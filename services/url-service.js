/*
* URL Service
* logic for working with URLS and shortening goes here
*/
var appRoot = require('app-root-path');
var config = require(appRoot + '/config.global');
var MongoClient = require('mongodb').MongoClient;

var db;


//shortening algorithms
function shortenBasicHash(str){
  //credit http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
  var hash = 0, i, chr, len;
  if (str.length === 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function shortenVowless(str){
  return str;
}

module.exports = {
  shorten : function (url, style = ''){
    var shortened;

    switch(style){
      case "vowless":
        shortened = shortenVowless(url);
        break;
      default:
        shortened = shortenBasicHash(url);
    }

    return shortened;
  },

  cleanURL : function(url){
    var protocol = nodeURL.parse(url).protocol;
    if(protocol == nul)
      url = "http://" + url;
    return url;
  },

  saveRedirect: function(redirect, done){
    MongoClient.connect(config.mongoURL + config.dbName, (err, db) => {
      if (err) console.log(err);

      db.collection(config.dbCollectionName).insert(redirect, (err, result) => {
        if(err) console.log(err);
        done(err, result);
      });
    });
  }

};
