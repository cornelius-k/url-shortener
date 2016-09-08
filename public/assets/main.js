/*
* Main client-side js for url shortener
*/

function lettersTyped(e){
  console.log('triggered', e);
  if (event.keyCode === 10 || event.keyCode === 13)
    event.preventDefault();
    
}
var $urlbox = document.getElementById('urlbox');
$urlbox.addEventListener('keypress', lettersTyped);
