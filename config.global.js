/*
* Set up global config
*/
module.exports = {
  mongoURL: 'mongodb://localhost:27017',
  dbName: '/hz',
  dbCollectionName: 'redirects'
};

//allow config to be overriden by dev environment-specifc config file
if(process.env.NODE_ENV == 'development'){
  var devConfig = require('config.development');
  var keys = Object.keys(devConfig);
  keys.forEach(function(key){
    module.exports[key] = dev.config[key];
  });
}
