const express = require("express");
var cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const expressValidator = require("express-validator");
const bodyParser = require("body-parser");
const passport = require("passport");
const dotenv = require("dotenv");
const MongoStore = require("connect-mongo")(session);
const path = require("path");
const os = require("os");

const Chat = require("./models/Chat");
// Get the OS
const osType = os.type();

// Load environment variables from .env file
dotenv.config({ path: ".env" });

// Load the router files
const userRouter = require("./routes/user");
const employeeRouter = require("./routes/employee");
const hrAssistantRouter = require("./routes/hr-assistant");
const benefitRouter = require("./routes/benefit");
const chatRouter = require("./routes/chat");

// Load the Passport Configuration file
const passportConfig = require("./config/passport");

// Load the auth with jwt middleware
const auth = require("./config/authConfig");

// Create express server
const app = express();

// Get the right mongodb URI for the right OS
const mongoURI =
  osType === "Darwin"
    ? process.env.DARWIN_MONGODB_URI
    : process.env.MONGODB_URI;

// Connect to Mongodb
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useNewUrlParser", true);
mongoose.connect(mongoURI);
mongoose.connection.on("error", err => {
  console.error(err);
  console.log("MongoDB connection error. Please make sure MongoDB is running.");
  process.exit();
});

// Express Configurations
app.set("host", process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0");
app.set("port", process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
    store: new MongoStore({
      url: process.env.MONGODB_URI,
      autoReconnect: true
    })
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(
  "/",
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

// app routes
app.use("/user", userRouter);
app.use("/employee", auth, employeeRouter);
app.use("/hr-assistant", auth, hrAssistantRouter);
app.use("/benefit", auth, benefitRouter);
app.use("/chat", auth, chatRouter);

// Error Handler
if (process.env.NODE_ENV === "development") {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send("Server Error");
  });
}

// Start Socket.io package config and event handler
const server = require("http").createServer(app);
const io = require("socket.io")(server);
io.on("connection", socket => {
  console.log("user connected");

  // Catch new-message event
  socket.on("new-message", message => {
    console.log("EVENT CAUGHT!!!!");
    console.log(message);
    Chat.updateOne(
      {
        $or: [
          { senderId: message.fromId, receiverId: message.toId },
          { senderId: message.toId, receiverId: message.fromId }
        ]
      },
      {
        senderId: message.fromId,
        receiverId: message.toId,
        $push: {
          messages: {
            message: message.message,
            senderName: message.senderName
          }
        }
      },
      { new: true, upsert: true }, // set upsert to true to push a new message in the existing array of messages
      (err, result) => {
        if (err) console.log(err);
        if (result.n >= 1 || nModified > 0) {
          //a new Message is added successfully

          Chat.findOne(
            {
              $or: [
                { senderId: message.fromId, receiverId: message.toId },
                { senderId: message.toId, receiverId: message.fromId }
              ]
            },
            (err, chats) => {
              console.log(chats);
              if (chats && chats.messages) {
                io.emit("new-message", chats);
              } else {
                return res.status(404).json({
                  message: "No chats found"
                });
              }
            }
          );
        }
      }
    );
  });
});

// Run the server
// We must use server.listen not app.listen
// cause of socket.io and express  4 and higher
server.listen(3000);

module.exports = server;
