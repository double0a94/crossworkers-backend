# Crossworkers hr APIs Backend

## For running the backend server we can use 2 ways:

1. run `npm install` then `nodemon start` or `npm start`

2. by running `docker-compose build` then `docker-compose up`

## you can get use the data from mongodb by restoring the data in the "databaseDump" folder in the project's directory

- run `mongorestore --db database_name path_to_bson_folder`

## You can also import the postman saved APIs

- Open Postman select `import` then choose the json file from the "postman exports" folder in the project's root directory

## You can run the tests by running

- run `npm test`

### IMPORTANT NOTICE:

- But before running any tests please make sure the database is restored and fully working with the app
- and before rerunning the test you have to manually delete the added user in the User's collection with
  email: `ahmedashrafTestEmployee1@gmail.com`, it should have deleted automatically but the express and socket.io
  running server refused to make any updates to any created document during the tests.
- Please also pull the angular frontend part from github it uses most of the API's features
