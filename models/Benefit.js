const mongoose = require("mongoose");

const benefitsSchema = new mongoose.Schema(
  {
    benefitType: String,
    benefitName: String,
    benefitDescription: String
  },
  { timestamps: true }
);

const Benefit = mongoose.model("Benefit", benefitsSchema);

module.exports = Benefit;
