/*
 * Express Web App that shortens URLs
 * Created by Neil Kempin
 * Sept 2016
*/

var express = require('express');
var appRoot = require('app-root-path');
var config = require('./config.global');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;

var app = express();
exports.app = app;

app.set('view engine', 'jade');
app.use('/public', express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
   extended: true,
   limit: '5mb'
}));
app.use(bodyParser.json({limit: '15mb'}));

const PORT = process.env.PORT || 3000;

//connect to mongo and start web server
MongoClient.connect(config.mongoURL + config.dbName, (err, db) =>{
  if (err) return console.log(err);
  app.listen(PORT, function() {
    console.log('listening on ', PORT);
  });
});

app.get('/', (req, res) => res.send('working'));
