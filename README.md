#URL Shortener
A Node web-app for shortening URLs

###configure
Application requires access to a MongoDB database named 'hz'. Either create this
database or set `NODE_ENV=development`, create a `config.development.js` file in the project root and
 specify an alternate database via `module.exports.dbName = 'MyDB'`. 
`config.development.js` values override default global config.

###install & run
`npm install`
`node app.js`
