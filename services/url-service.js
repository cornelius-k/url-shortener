/*
* URL Service
* logic for working with URLS and shortening goes here
*/

//shortening algorithms
function shortenBasicHash(str){
  //credit http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
  var hash = 0, i, chr, len;
  if (str.length === 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

module.exports = {
  shorten : function(url, style = ''){
    var shortened;

    switch(style){
      case "vowless":
        shortened = shortenVowless(url);
        break;
      default:
        shortened = shortenBasicHash(url);
    }
    
    return shortened;
  },

  cleanURL : function(url){
    var protocol = nodeURL.parse(url).protocol;
    if(protocol == nul)
      url = "http://" + url;
    return url;
  }

};
