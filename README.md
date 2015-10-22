# CSC428_study_apparatus

This web app will administer the experiments for a research study comparing a variety of text presentation methods on small screens, such as smart watches.

The server is a Node.js script with dependencies [Mongoose]. Once you have downloaded the code, you must run `npm install` from within the `app` directory.

The next step is to populate the database with the Tweet collection. Assuming that you have installed the MongoDB database, start it up with `mongod`, then run the `populate_tweets.js` in order to load the JSON files of tweets and save them as records in the database.
