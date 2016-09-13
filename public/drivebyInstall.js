(function() {
  'use strict';

  /*HardCoded Variable, Feel free to change*/
  var domain = 'darrennchan8.eu.pn';

  /*AutoConfig*/
  var DEVBUILD = window.DEVBUILD !== false;

  /*Status Variables*/
  var fileSystemReady;
  var filesDownloaded;

  /*Temporary Data Storage (only for session)*/
  var xhr;
  var fileSystemObjects;
  var prepareData;

  /*Persistent Data Management*/
  var root;
  var purgeFileSystem;
  var newFile;

  /*View Methods*/
  var errorHandler;

  if (DEVBUILD) {
    var exclusions = [];
    var dataPath = '../public/resources.json';
  } else {
    var exclusions = ['data','storage'];
    var dataPath = '//' + domain + '/resources.json';
  }

  errorHandler = function(err) {
    alert('There has been an error while installing...');
    alert('Details: ' + err);
    if (!confirm('Continue?')) {
      location.reload();
    }
  };

  newFile = function(path, name, data) {
    var config = {create: true,exclusive: false};
    if (path === '') {
      config = {create: false,exclusive: false};
    }
    root.getDirectory(path, config, function(name, data, args) {
      if (name) {
        args.getFile(name, {create: true,exclusive: false}, function(newFile) {
          newFile.remove(function() {
            args.getFile(name, {
              create: true,
              exclusive: false
            }, function(newFile) {
              newFile.createWriter(function(data, fileContent) {
                var charset = {type: 'text/plain; charset=x-user-defined'};
                fileContent.write(new Blob([data], charset));
                setTimeout(function() {
                  fileSystemObjects.dequeue();
                }, 10);
              }.bind(this, data));
            }.bind(this), errorHandler);
          }.bind(this), errorHandler);
        }, errorHandler);
      }else {
        fileSystemObjects.dequeue();
      }
    }.bind(this, name, data), errorHandler);
  };

  purgeFileSystem = function() {
    var dirReader = root.createReader();
    dirReader.readEntries(function(entries) {
      var i = entries.length;
      var ii = i;
      var _checker = function() {
        ii--;
        if (!ii) {
          fileSystemObjects.dequeue();
        }
      };
      while (i--) {
        if (entries[i].isDirectory) {
          if (exclusions.includes(entries[i].name)) {
            _checker();
          } else {
            entries[i].removeRecursively(_checker, errorHandler);
          }
        } else {
          entries[i].remove(_checker, errorHandler);
        }
      }
      if (ii === 0) {
        fileSystemObjects.dequeue();
      }
    });
  };

  fileSystemObjects = {
    current: [],
    queue: function() {
      this.current.push(arguments);
    },
    dequeue: function() {
      if (this.current.length !== 0) {
        newFile.apply(this, this.current.shift());
      } else {
        if (!DEVBUILD) {
          alert('Installation Complete!');
          let finalLocation = 'filesystem:';
          finalLocation += location.origin;
          finalLocation += '/persistent/index.html';
          window.open(finalLocation);
        } else {
          console.log('done');
        }
      }
    }
  };

  prepareData = function() {
    if (filesDownloaded && fileSystemReady) {
      var data;
      var files;
      data = JSON.parse(xhr.responseText);
      files = Object.keys(data).sort();
      for (var i = 0, ii = files.length; i != ii; i++) {
        if (typeof data[files[i]] == 'string') {
          let tmp;
          let path;
          let name;
          tmp = files[i].split('/');
          path = tmp.slice(0, tmp.length - 1).join('/');
          name = tmp.slice(tmp.length - 1, tmp.length)[0];
          fileSystemObjects.queue(path, name, atob(data[files[i]]));
        }else if (typeof data[files[i]] == 'object') {
          fileSystemObjects.queue(files[i], null, null);
        }
      }
      purgeFileSystem();
    }
  };

  xhr = new XMLHttpRequest();
  xhr.open('GET', dataPath, true);
  xhr.addEventListener('load', function() {
    filesDownloaded = true;
    prepareData();
  });
  xhr.addEventListener('error', errorHandler);
  xhr.send();

  navigator.webkitPersistentStorage.requestQuota(2147483647, function(bytes) {
    webkitRequestFileSystem(PERSISTENT, bytes, function(fileSystem) {
      root = fileSystem.root;
      fileSystemReady = true;
      prepareData();
    }, errorHandler);
  }, errorHandler);
})();
