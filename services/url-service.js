/*
* URL Service
* logic for working with URLS, shortening, and database interaction goes here
*/
var appRoot = require('app-root-path');
var config = require(appRoot + '/config.global');
var MongoClient = require('mongodb').MongoClient;
var validURL = require('valid-url');
var nodeURL = require('url');
var anagramica = require('anagramica');
var q = require('q');

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
    return this.truncate(Math.random().toString(36));
  },

  shortenBasicHash: function(str){
    var hash = this.basicHash(str);
    var hashedStr = hash.toString();
    return this.truncate(hashedStr);
  },

  truncate : function(str, length = 7){
    return str.substr(0, length);
  },

  shortenVowless : function(str){
    str = this.removeProtocol(str);
    str = this.stripSlashes(str);
    str = str.replace(/[aeiou]/gi, '');
    return this.truncate(str);
  },

  anagram : function(str){
    str = this.removeProtocol(str);
    str = this.stripSlashes(str);
    str = this.removeSpecialChars(str);
    var promise = q.defer();
    return q.fcall(anagramica.best(str, function(err, response){
      return response.toString();
    })).then(function(str){
      return this.truncate(str);
    });

  },

  shorten : function (url, method = 'default'){
    var shortened;
    var shortened2;
    var promises = [];
    switch(method){
      case "novowels":
        shortened = this.shortenVowless(url);
        break;
      case "basicHash":
        shortened = this.basicHash(url);
        break;
      case "anagram":
        shortened2 = this.anagram(url);
        break;
      case "randomString":
        shortened = this.randomString();
        break;
      default:
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

      var col = db.collection(config.dbCollectionName);

      col.insert(redirect, (err, result) => {
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
      db.close();
    });
  },

  removeRedirectWithKey: function(key, done){
    MongoClient.connect(config.mongoURL + config.dbName, (err, db) => {
      if (err) console.log(err);

      db.collection(config.dbCollectionName).remove({key: key}, (err, result) => {
        if(err) console.log(err);
        done(err, result);
      });
      db.close();
    });
  }

};
