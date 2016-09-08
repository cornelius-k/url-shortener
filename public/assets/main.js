/*
* Main client-side js for url shortener
*/

var $urlbox = document.getElementById('urlbox');
$urlbox.setAttribute('data-text', '');

var globalText = '';

function keyTyped(event){
  console.log('triggered', event);
  //event.preventDefault();
  //addCharacter(event.key);
  if (event.keyCode === 10 || event.keyCode === 13){
    addCharacter('x');
    event.preventDefault();
    //submitURL(globalText);
  }
}

function submitText(string){
  console.log('submitted');
}

function addCharacter(char){
  globalText.concat(char);
  var coolChar = processChar(char);
  $urlbox.innerHTML += coolChar;
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
