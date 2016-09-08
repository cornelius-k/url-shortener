/*
* Main client-side js for url shortener
*/

var globalText = '';
var $ = jQuery;
var valid;

//selectors
var $urlbox = document.getElementById('urlbox');             //box for original url to be shortened
var $shortenedbox = document.getElementById('shortenedbox')  //box for shortened url content
var $shortenedtext = document.getElementById('shortenedtext'); //place for actual shortened url text
var $notify = document.getElementById('notify');             //notifications go here
var $validity = document.getElementById('colorblock');         //indicates if url being typed is valid

$urlbox.addEventListener('keydown', typeInBox);

function typeInBox(event){
  var enterKeyPressed = event.keyCode === 10 || event.keyCode === 13;
  var charKeyPressed = event.key.length === 1;
  var existingText = event.target.innerText;

  if (enterKeyPressed){
    event.preventDefault();
  }

  url = charKeyPressed ? existingText + event.key : existingText;

  url = url.startsWith('http') ? url : "http://" + url;
  valid = isURLValid(url);

  console.log('it is '+ valid);

  if(valid){
    indicateURLValidity('valid');
    if (enterKeyPressed){
      requestShortURL(url);
    }
  }
  else{
    console.log('invalid');
    indicateURLValidity('invalid');
  }
}


var requestShortURL = function(longURL){
  hideShortenedURL();
  jQuery.post('/api/url', {url: longURL}, function(response){
    if(response.error)
      notifyError(response.error);
    else
      displayShortenedURL(response.shortened);
  });
};

function displayShortenedURL(url){
  var markup = "<a href=" + url + ">" + url + "</a>";
  $shortenedtext.innerHTML = markup;
  $($shortenedbox).fadeIn(900);
}

function hideShortenedURL(){
//$($shortenedbox).fadeOut();
}

function notifyError(string){
  $notify.className = "invalid";
  $notify.innerHTML = string;

  //fade out after a bit
  window.setTimeout(function(){
    $notify.className = "hidden";
    $notify.innerHTML = "";
  }, 5000);
}

function indicateURLValidity(validityClass){
  console.log('here2');
  $validity.className = validityClass;
}

//regex credit: somewhere on SO
function isURLValid(url) {
	var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
	return regexp.test(url) && url.includes('.');
}
