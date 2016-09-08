/*
* URL Service
* logic for working with URLS, shortening, and database interaction goes here
*/
var appRoot = require('app-root-path');
var config = require(appRoot + '/config.global');
var MongoClient = require('mongodb').MongoClient;
var validURL = require('valid-url');
var nodeURL = require('url');

module.exports = {

  //string manipulation
  stripSlashes: function(str){
    return str.replace(new RegExp('/', 'g'), "");
  },

  removeProtocol: function(str){
    var url = nodeURL.parse(str);
    return url.href.replace(url.protocol, '');
  },

  removeSpecialChars: function(str){
    //regex wizardry credit annakata from SO post
    return str.replace(/[^\w\s]/gi, '');
  },

  //shortening algorithms
  basicHash: function(str){
    //credit http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
    var hash = 0, i, chr, len;
    if (str.length === 0) return hash;
    for (i = 0, len = str.length; i < len; i++) {
      chr   = str.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  },

  randomString: function(){
    return Math.random().toString(36).substring(5);
  },

  shortenBasicHash: function(str){
    var hash = this.basicHash(str);
    var hashedStr = hash.toString();
    hashedStr = hashedStr.substr(0, 4);
    return hashedStr;
  },

  truncate : function(str, length = 5){
    return str.substr(0, length);
  },

  shortenVowless : function(str){
    return this.truncate(str.replace(/[aeiou]/gi, ''));
  },

  shorten : function (url, style = ''){
    var shortened;
    style = style || 'default';
    switch(style){
      case "vowless":
        shortened = this.shortenVowless(url);
        break;
      case "basicHash":
        shortened = this.basicHash(url);
      case "default":
        shortened = this.randomString();
        break;
    }

    return shortened;
  },

  cleanURL : function(url){
    var protocol = nodeURL.parse(url).protocol;
    if(protocol == null)
      url = "http://" + url;
    return url;
  },

  isValidURL : function(url){
    return validURL.isUri(url) ? true : false;
  },

  //CRUD Operations
  saveRedirect: function(redirect, done){
    MongoClient.connect(config.mongoURL + config.dbName, (err, db) => {
      if (err) console.log(err);

      db.collection(config.dbCollectionName).insert(redirect, (err, result) => {
        if(err) console.log(err);
        //dig into mongo result set
        result = result.ops[0];
        done(err, result);
      });

      db.close();
    });
  },

  getRedirectForKey: function(key, done){
    MongoClient.connect(config.mongoURL + config.dbName, function(err, database) {
      if (err) console.log(err);
      db = database;
      db.collection(config.dbCollectionName).findOne({key: key}, function(err, result) {
        if(err) console.log(err);
        done(err, result);
      });
    });
  },

  removeRedirectWithKey: function(key, done){
    MongoClient.connect(config.mongoURL + config.dbName, (err, db) => {
      if (err) console.log(err);

      db.collection(config.dbCollectionName).remove({key: key}, (err, result) => {
        if(err) console.log(err);
        debugger;
        done(err, result);
      });
    });
  }

};
