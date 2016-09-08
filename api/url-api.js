/*
* URL API
* functions for handling URL shortening API requests go here
*/
var appRoot = require('app-root-path');
var config = require(appRoot + '/config.global');
var MongoClient = require('mongodb').MongoClient;
var express = require('express');
var bodyParser = require('body-parser');
var URLService = require(appRoot + '/services/url-service');
var validURL = require('valid-url');
var nodeURL = require('url');

module.exports.addRoutes = function(app) {

     //check that a url is formatted correctly
     app.get('/api/url/valid', function(req, res){

       var url = req.query.url;
       if(!url)
         return res.status(400).json({error: "A url is required"});

       url = URLService.cleanURL(url);
       var valid = URLService.isValidURL(url);

       valid ?  res.status(200) : res.status(400);
     });

     // Create and save a new redirect / shortened URL
     app.post('/api/url', (req, res) => {

       var redirect = {
         toURL: req.body.url,
         key: '',
         style: req.body.style //optional
       };

       // validate
       if(redirect.toURL === undefined)
         return res.status(400).json({error: 'Request must contain a URL'});

       if(!URLService.isValidURL(redirect.toURL))
        return res.status(400).json({error: 'URL' + redirect.from + ' is invalid'});

       // generate shortened URL "key"
       redirect.key = URLService.shorten(redirect.toURL, redirect.style);

       // save new redirect
       URLService.saveRedirect(redirect, (err, result) =>{
         
         err ? res.status(400).json({error: err}) : res.status(201).json({key : result.key})}
       );
     });

     // remove a redirect from database
     app.delete('/api/key', function(req, res){
       var key = req.body.key;
       // validate
       if(key === undefined)
         return res.status(400).json({error: 'Request must contain a redirect key'});

       URLService.removeRedirectWithKey(key, function(err, response){
         if(err) console.log(err);
         if(response.result.n === 0)
          return res.status(404).json({error: "Redirect with that key does not exist and cannot be deleted"});
         else
           return res.status(200).json({message: "Removed redirect for key" + key});
       });
     });

     //wildcard routing for matching acatual shortened URL to redirect
     app.get('/*', (req, res) => {
       var key = req.path.replace('/', ''); //keys should not start with slash
       URLService.getRedirectForKey(key, function(err, response){
         if(!response)
           return res.status(404).json({error: "not found"});
          //redirect
         return res.redirect(301, response.toURL);

       });
     }
    );
 };
