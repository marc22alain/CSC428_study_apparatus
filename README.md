# CSC428 study apparatus

This web app will administer the experiments for a research study comparing a variety of text presentation methods on small screens, such as smart watches.

The server is a Node.js script with dependencies [Mongoose]. Once you have downloaded the code, you must run `npm install` from within the `app` directory.

The server code is `app.js`. Start it with Node, then open one browser windows at `localhost:3000/` and select the testing client for experiment administriation. To access the app from your phone, get your computer's IP address and add `:3000/', load that page and you can select the reading client.

As supplied, the server will use a database hosted at MongoLab.