(function() {
  'use strict';
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'drivebyInstall.js', true);
  xhr.addEventListener('load', function(xhr) {
    var link = document.querySelector('a');
    var dom = 'window.DEVBUILD = false; window.domain = location.href; ';
    if (location.host == 'localhost') {
      dom = 'window.domain = location.host + "/HTML5_FileSystem/public/"; ';
    }
    link.setAttribute('href', 'javascript: ' + dom + xhr.target.responseText);
    link.innerText = 'Drag Me!';
  });
  xhr.send();
})();
