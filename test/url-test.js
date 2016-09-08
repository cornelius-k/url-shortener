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
* Shortening function unit tests
*/
describe('Shortening Functions', function(){

  var longURL = 'http://zombo.com/its/zombo/com';
  var longURLNoHTTP = 'zombo.com/its/zombo/com';

  it('strips slashes from a string', function(done){
    var stripped = URLService.stripSlashes(longURL);
    expect(stripped).to.equal('http:zombo.comitszombocom');
    done();
  });

  it('removes protocol from url string', function(done){
    var noProtocol = URLService.removeProtocol(longURL);
    expect(noProtocol).to.equal('//' + longURLNoHTTP);
    done();
  });

  it('removes all special characters from a string', function(done){
    var nothingSpecial = URLService.removeSpecialChars('t.e.x.t/?=%!#');
    expect(nothingSpecial).to.equal('text');
    done();
  });

  it('generates a valid basic shortened string', function(done){
    var shortened = URLService.shorten(longURL);
    expect(shortened).to.be.a.string;
    expect(shortened).to.not.equal(longURL);
    done();
  });

  it('generates a shortened string via vowless style', function(done){
      var shortened = URLService.shortenVowless('http://zombo.com/welcome');
      expect(shortened === 'zmbcmwlcm').to.be.true;
      done();
  });

  it('cleans urls by ensuring they have an http protocol prefix', function(done){
      var cleaned = URLService.cleanURL(longURLNoHTTP);
      expect(longURLNoHTTP === 'http://' + longURLNoHTTP);
      done()
  });

  it('validates urls are formed correctly with protocol', function(done){
    var validWithSpecialChars = URLService.isValidURL('http://zombo.comb/^^^');
    var validWithoutExtension = URLService.isValidURL('http://zombo');
    var validWithoutProtocol = URLService.isValidURL('zombo.com');
    var actuallyValid = URLService.isValidURL('http://zombo.com');
    expect(validWithSpecialChars).to.be.false;
    expect(validWithoutProtocol).to.be.false;
    //expect(validWithoutExtension).to.be.false;
    expect(actuallyValid).to.be.true;
    done();
  });

});

/*
* Database interaction unit tests
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
* REST API Tests / integration
*/
var key; //to be assigned to the key (shortened url) return value from generated redirect
describe('URL API', function(){

  var global = {};
  before(function(){
    global.testURL = 'http://test.com';
    global.key = "";
  });

  /*
  * CRUD : create a record, retrieve the same record, delete the record
  * and verify that it is no longer retrievable
  */

  it('responds with a shortened url for requests: POST /api/url', function(done){

    request(app)
    .post('/api/url')
    .send({url: global.testURL})
    .end(function(err, res){
      expect(err).to.be.null;
      expect(res.statusCode).to.be.equal(201);
      expect(res).to.be.json;
      expect(res.body.key).to.not.be.null;
      expect(res.body.key === global.testURL).to.be.false;
      global.key = res.body.key; //save the key (shortened url) for use in other tests
      done();
    });
  });

  //use same key retrived from creation test
  it('successfully redirects GET /* made with test redirect key', function(done){
    expect(key).to.be.not.null;
    expect(global.key).to.not.be.empty;
    request(app)
    .get('/'+ global.key)
    .end(function(err, res){
      expect(err).to.be.null;
      expect(res.statusCode).to.be.equal(301);
      expect(res.header['localhost'] === global.testURL);
      done();
    });
  });

  //use same key retrived from creation test
  it('successfully deletes a redirection via a supplied key', function(done){
    request(app)
    .delete('/api/key')
    .send({key : global.key})
    .end(function(err, res){
      expect(err).to.be.null;
      expect(res.statusCode).to.be.equal(200);
      request(app)
      .get('/' + global.key)
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.statusCode).to.be.equal(404);
        done();
      });
    });
  });
});
