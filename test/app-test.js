/*
* Main App Tests
*/

var request = require('supertest');
var app = require('../app').app;
var appRoot = require('app-root-path');
var config = require(appRoot + '/config.global.js');
var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;

describe('Homepage', function(){
  it('responds with 200 for GET /', function(done){
    request(app)
      .get('/')
      .expect(200, done);
  });
});

describe("Mongo Client", function(){
  it("should connect to mongodb without error", function(done){
    MongoClient.connect(config.mongoURL, function(err, db){
      expect(err).to.be.null;
      done();
    });
  });
});
