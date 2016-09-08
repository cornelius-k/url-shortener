/*
* Main client-side js for url shortener
*/

var $urlbox = document.getElementById('urlbox');
var $shortenedbox = document.getElementById('shortenedbox');
var globalText = '';

function keyTyped(event){
  console.log('triggered', event);
  //event.preventDefault();
  //addCharacter(event.key);
  if (event.keyCode === 10 || event.keyCode === 13){
    event.preventDefault();
    submitText(event.target.innerText);
    //submitURL(globalText);
  }
}

function submitText(string){
  console.log('submitting Text');
  jQuery.post('/api/url', {url: string}, function(response){
    if(response.error)
      notifyError(response.error);
    else
      displayShortenedURL(response.shortened);
  });
}

function displayShortenedURL(url){
  $shortenedbox.innerHTML = url;
}

function addCharacter(char){
  globalText.concat(char);
}

function processChar(nakedChar){
  return "<span>" + nakedChar + "</span>";
}

window.addEventListener('mouseup', moveCaret(window, 3));
function moveCaret(win, charCount) {
  console.log('called');
    var sel, range;
    if (win.getSelection) {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var textNode = sel.focusNode;
            var newOffset = sel.focusOffset + charCount;
            sel.collapse(textNode, Math.min(textNode.length, newOffset));
        }
    } else if ( (sel = win.document.selection) ) {
        if (sel.type != "Control") {
            range = sel.createRange();
            range.move("character", charCount);
            range.select();
        }
    }
}



$urlbox.addEventListener('keydown', keyTyped);
