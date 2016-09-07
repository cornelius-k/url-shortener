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
  it('does basic string shortening', function(done){
    var shortened = URLService.shorten(longURL);
    expect(shortened).to.not.be.null;
    expect(shortened == longURL).to.not.be.true;
    done();
  });

  it('shortens via vowless method', function(done){
      var shortened = URLService.shortenVowless(longURL);
      expect(shortened === 'zmbtszmbcm');
      done();
  });

});

/*
* REST API Tests
*/
describe('URL API', function(){

  var testURL = 'http://test.com';

  it('responds to GET /api/url with json data', function(done){
    var api = '/api/url';
    request(app)
    .get('/api/url')
    .expect(200)
    .end(function(err, res){
      expect(err).to.be.null;
      expect(res).to.not.be.null;
      expect(res).to.be.json;
      done();
    });
  });

  var shortened;
  it('responds to POST /api/url with shortened url', function(done){
    request(app)
    .post('/api/url')
    .send({url: testURL})
    .end(function(err, res){
      expect(err).to.be.null;
      expect(res.statusCode).to.be.equal(201);
      expect(res).to.be.json;
      expect(res.shortened).to.not.be.null;
      expect(res.shortened === testURL).to.be.false;
      //save shortened url for other tests
      shortened = res.shortened;
      done();
    });
  });

  it('successfully redirects a known shortened url', function(done){
    request(app)
    .get('/' + shortened)
    .end(function(err, res){
      expect(err).to.be.null;
      expect(res.statusCode).to.be.equal(301);
      //need to implement redirect detection
      done();
    });
  });

  it('successfully deletes a shortened url from db', function(done){
    request(app)
    .delete('/app/url/' + testURL)
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
