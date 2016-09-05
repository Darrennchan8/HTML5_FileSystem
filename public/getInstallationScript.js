(function() {
  'use strict';
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'drivebyInstall.js', true);
  xhr.addEventListener('load', function(xhr) {
    var link = document.querySelector('a');
    link.setAttribute('href', 'javascript:' + xhr.target.responseText);
    link.innerText = 'Drag Me!';
  });
  xhr.send();
})();
