/*
 * URL API Tests
 */
var request = require('supertest');
var app = require('../app').app;
var appRoot = require('app-root-path');
var config = require(appRoot + '/config.global.js');
var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var URLService = require(appRoot + '/services/url-service.js');
var url = require('url');

/*
* Unit Tests
*/
describe('Shortening Functions', function(){

  var longURL = 'http://zombo.com/its/zombo/com';
  var longURLNoHTTP = 'zombo.com/its/zombo/com';
  it('generates a valid basic shortened string', function(done){
    var shortened = URLService.shorten(longURL);
    expect(shortened).to.be.a.string;
    expect(shortened).to.not.equal(longURL);
    done();
  });

  it('generates a shortened string via vowless style', function(done){
      var shortened = URLService.shortenVowless(longURL);
      expect(shortened === 'zmbtszmbcm');
      done();
  });

  it('cleans urls by ensuring they have an http protocol prefix', function(done){
      var cleaned = URLService.cleanURL(longURLNoHTTP);
      expect(longURLNoHTTP === 'http://' + longURLNoHTTP);
      done()
  });

  it('validates urls are formed correctly', function(done){
    var validation = URLService.isValidURL(longURLNoHTTP);
    expect(validation).to.be.false;
    done();
  });

});

/*
* Unit Tests
*/
describe('URL Service will', function(){

  //test data
  var redirect = {key: 'testkey', toURL: 'http://test.com/test'};

  it('save the redirect to database', function(done){
    URLService.saveRedirect(redirect, function(err, response){
      expect(err).to.be.null;
      expect(response).to.not.be.null;
      done();
    });
  });

  it('retrieve the redirect from database', function(done){
    URLService.getRedirectForKey(redirect.key, function(err, response){
      expect(err).to.be.null;
      expect(response.toURL === redirect.testURL);
      done();
    });
  })

  it('deletes the redirect from database', function(done){
    URLService.removeRedirectWithKey(redirect.key, function(err, response){
      expect(err).to.be.null;
      expect(response).to.not.be.null;
      URLService.getRedirectForKey(redirect.key, function(err, response){
        expect(response).to.be.null;
        done();
      });
    });
  });
});

/*
* REST API Tests
*/
describe('URL API', function(){

  var testURL = 'http://test.com';

  var key; //to be assigned to the key (shortened url) return value from generated redirect
  it('responds with a shortened url for requests: POST /api/url', function(done){
    request(app)
    .post('/api/url')
    .send({url: testURL})
    .end(function(err, res){
      expect(err).to.be.null;
      expect(res.statusCode).to.be.equal(201);
      expect(res).to.be.json;
      expect(res.body.key).to.not.be.null;
      expect(res.body.key === testURL).to.be.false;
      key = res.body.key; //save the key (shortened url) for use in other tests
      done();
    });
  });

  //use same key retrived from creation test
  it('successfully redirects GET /* made with test redirect key', function(done){
    request(app)
    .get('/'+ key)
    .end(function(err, res){
      expect(err).to.be.null;
      expect(res.statusCode).to.be.equal(301);
      expect(res.header['localhost'] === testURL);
      done();
    });
  });

  //use same key retrived from creation test
  it('successfully deletes a redirection via a supplied key', function(done){
    request(app)
    .delete('/api/url/' + key)
    .end(function(err, res){
      expect(err).to.be.null;
      expect(res.statusCode).to.be.equal(200);
      request(app)
      .get('/' + shortened)
      .end(function(err, res){
        expect(res.statusCode).to.be.equal(400);
        done();
      });
    });
  });
});
