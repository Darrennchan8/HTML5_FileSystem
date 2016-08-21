loadingScreen.setMessage('File Loaded!');
loadingScreen.setPercentage(25);
(function() {
  'use strict';
  var root;
  var getFileName;
  var recursiveData;
  var getParentDir;
  var fsLog;
  var fsError;
  var _log = function(message, priority) {
    var print = [
      function() {},
      console.log,
      console.warn,
      console.error,
      alert
    ];
    print[priority].call(this, message);
  };
  getParentDir = function(pathName) {
    var filePos = pathName.lastIndexOf('/', pathName.length - 1);
    return pathName.substring(0, filePos);
  };
  getFileName = function(pathName) {
    return pathName.substring(pathName.lastIndexOf('/') + 1, pathName.length);
  };
  fsError = function(message, err) {
    message = message || 'Anonymous Operation Failed';
    _log(message, 3);
    if (err) {
      _log(err, 3);
    }
  };
  fsLog = function(message) {
    message = message || 'Anonymous Operation Success';
    _log(message, 1);
  };
  window.fs = {
    delete: function(details) {
      if (typeof(details.callback) != 'function') {
        details.callback = function() {};
      }
      details.path = details.path;
      if (details.type == 'folder') {
        root.getDirectory(details.path, {create: false}, function(dir) {
          dir.removeRecursively(function() {
            fsLog('fs.delete: Folder deleted.');
            details.callback(true);
          }, function(err) {
            fsError('fs.delete: Folder cannot be deleted.', err);
            details.callback(false);
          });
        }, function(err) {
          fsError('fs.delete: Folder Path cannot be accessed.', err);
          details.callback(false);
        });
      }else if (details.type == 'file') {
        root.getDirectory(getParentDir(details.path), {create: false},
        function(dir) {
          dir.getFile(getFileName(details.path), {create: false},
          function(file) {
            file.remove(function() {
              fsLog('fs.delete: File deleted.');
              if (typeof(details.callback == 'function')) {
                details.callback(true);
              }
            }, function(err) {
              fsError('fs.delete: File cannot be deleted.', err);
            });
          }, function(err) {
            fsError('fs.delete: File cannot be accessed.', err);
          });
        }, function(err) {
          fsError('fs.delete: File Path cannot be accessed.', err);
        });
      }
    },
    rename: function(data) {
      if (typeof(data.callback) != 'function') {
        data.callback = function() {};
      }
      var folderPath;
      data.path = data.path;
      if (data.type == 'file') {
        folderPath = getFileName(data.path);
      }else {
        folderPath = data.path;
      }
      if (data.type == 'folder') {
        root.getDirectory(data.path, {create: false}, function(targetDir) {
          fsLog('fs.rename: Successfully retrieved target directory.');
          root.getDirectory(getParentDir(data.path), {create: false},
          function(parentDir) {
            fsLog('fs.rename: Successfully retrieved parent directory.');
            targetDir.moveTo(parentDir, data.newName, function() {
              fsLog('fs.rename: Successfully renamed file');
              data.callback(true);
            }, function(err) {
              fsError('fs.rename: Unable to rename file.', err);
              data.callback(false);
            });
          }, function(err) {
            fsError('fs.rename: Unable to retrieve parent directory.', err);
            data.callback(false);
          });
        }, function(err) {
          fsError('fs.rename: Error retrieving target directory.', err);
          data.callback(false);
        });
      }
    },
    scandir: function(data) {
      data.path = data.path;
      root.getDirectory(data.path, {create: false}, function(dir) {
        var dirReader = dir.createReader();
        var dirContents = {path: data.path, folders: [],files: []};
        var index = 0;
        dirReader.readEntries(function(entries) {
          dirContents.parentFolders = data.path.split('/');
          dirContents.parentFolders[0] = '/';
          while (dirContents.parentFolders.indexOf('') != -1) {
            var emptyPos = dirContents.parentFolders.indexOf('');
            dirContents.parentFolders.splice(emptyPos, 1);
          }
          for (var i = 0; i != entries.length; i++) {
            let fullPath = entries[i].fullPath;
            if (entries[i].isDirectory) {
              let nameStart = fullPath.lastIndexOf('/') + 1;
              dirContents.folders.push({
                fullPath: fullPath,
                name: fullPath.substring(nameStart, fullPath.length)
              });
              index++;
            }
            if (entries[i].isFile) {
              let type = fullPath.lastIndexOf('.');
              let name = fullPath.lastIndexOf('/');
              if (name < type) {
                dirContents.files.push({
                  fullPath: fullPath,
                  name: fullPath.substring(name + 1, type),
                  type: fullPath.substring(type + 1, fullPath.length)
                });
              } else {
                dirContents.files.push({
                  fullPath: fullPath,
                  name: fullPath.substring(name + 1, fullPath.length),
                  type: ''
                });
              }
              index++;
            }
            if (index == entries.length) {
              data.callback(dirContents);
            }
          }
          if (entries.length === 0) {
            data.callback(dirContents);
          }
        }, function(err) {
          fsError('fs.scandir: Error while loading Folder contents.', err);
        });
      }, function(err) {
        fsError('fs.scandir: Folder Read Operation Failed.', err);
      });
    },
    recursivelyScandir: function(data) {
      if (typeof(arguments[1]) != 'boolean') {
        recursiveData = {
          folders: [{
            fullPath: data.path
          }],
          files: [],
          scanpos: 0,
          callback: data.callback
        };
        fs.recursivelyScandir(null, false);
      } else {
        if (recursiveData.folders.length != recursiveData.scanpos) {
          fs.scandir({
            path: recursiveData.folders[recursiveData.scanpos].fullPath,
            callback: function(dat) {
              for (let x = 0; x != dat.folders.length; x++) {
                recursiveData.folders.push(dat.folders[x]);
              }
              for (let x = 0; x != dat.files.length; x++) {
                recursiveData.files.push(dat.files[x]);
              }
              recursiveData.scanpos++;
              fs.recursivelyScandir(null, false);
            }
          });
        } else {
          delete recursiveData.scanpos;
          recursiveData.callback(recursiveData);
        }
      }
    },
    exists: function(details) {
      details.path = details.path;
      if (details.type == 'folder') {
        root.getDirectory(details.path, {create: false}, function(args) {
          details.pass();
        }, function(args) {
          details.fail();
        });
      }else if (details.type == 'file') {
        root.getDirectory(details.path, {create: false}, function(args) {
          args.getFile(details.name, {create: false}, function(args) {
            details.pass();
          }, function(args) {
            details.fail();
          });
        }, function(args) {
          details.fail();
        });
      }
    },
    new: function(details) {
      details.path = details.path;
      if (details.type == 'folder') {
        root.getDirectory(details.path, {create: true,exclusive: false},
        function(args) {
          fsLog('fs.new: Folder Creation Operation Successful.');
          if (typeof(details.callback == 'function')) {
            details.callback(true);
          }
        }, function(args) {
          fsError('fs.new: Cannot create folder.', args);
        });
      }else if (details.type == 'file') {
        root.getDirectory(details.path, {create: true, exclusive: false},
        function(args) {
          fsLog('fs.new: Reference Folder Operation Successful.');
          args.getFile(details.name, {create: true, exclusive: false},
          function(newFile) {
            fsLog('fs.new: File Creation Operation Successful.');
            if (typeof details.data == 'undefined' || !details.data) {
              if (details.callback) {
                details.callback(true);
              }
            } else {
              if (!details.encoding) {
                details.encoding = 'text/plain';
              }
              newFile.createWriter(function(fileContent) {
                var blob = new Blob([details.data],{type: details.encoding});
                fileContent.write(blob);
                fsLog('fs.new: File Write Operation Successful.');
                if (details.callback) {
                  details.callback(true);
                }
              }, function(args) {
                fsError('fs.new: File Write Operation Failed.', args);
              });
            }
          }, function(args) {
            fsError('fs.new: File cannot be created.', args);
          });
        }, function(args) {
          fsError('fs.new: Cannot access reference folder.', args);
        });
      }else if (details.type == 'blob') {
        root.getDirectory(details.path, {create: true, exclusive: false},
        function(args) {
          fsLog('fs.new: Reference Folder Operation Successful.');
          args.getFile(details.name, {create: true, exclusive: false},
          function(newFile) {
            fsLog('fs.new: File Creation Operation Successful.');
            newFile.createWriter(function(fileContent) {
              fileContent.write(details.data);
              fsLog('fs.new: File Write Operation Successful.');
              if (details.callback) {
                details.callback(true);
              }
            }, function(args) {
              fsError('fs.new: File Write Operation Failed.', args);
            });
          }, function(args) {
            fsError('fs.new: Couldn\'t Create File', args);
          });
        }, function(args) {
          fsError('fs.new: Couldn\'t get Reference Folder', args);
        });
      }
    },
    path: function(fileDetails) {
      if (!fileDetails) {
        throw new Error('missing code');
      }else if (fileDetails.type == 'file') {
        if (fileDetails.export == 'download') {
          fsLog('fs.dlPath: Returned Download Path of File');
          return '..' + fileDetails.path;
        }else if (fileDetails.export == 'full') {
          let path = 'filesystem:' + location.origin + '/persistent';
          path += fileDetails.path;
          fsLog('fs.dlPath: Returned Full Path of File');
          return path;
        }
      }
    },
    tmpFile: function(data, callback) {
      var randName = crypto.getRandomValues(new Uint32Array(10)).toString();
      fs.new({
        type: 'file',
        path: '/tmp/',
        name: randName,
        data: data,
        callback: callback.bind(this, fs.path({
          type: 'file',
          export: 'full',
          path: '/tmp/' + randName
        }))
      });
    }
  };
  navigator.webkitPersistentStorage.requestQuota(10 * 1024 * 1024 * 1024,
  function(grantedBytes) {
    webkitRequestFileSystem(PERSISTENT, grantedBytes,
    function(fileSystem) {
      loadingScreen.setMessage('FileSystem Initialized!');
      loadingScreen.setPercentage(100);
      root = fileSystem.root;
      fsLog('fileSystem.js: File System Initialized.');
    }, function(err) {
      fsError('fileSystem.js: Cannot get File System.', err);
    });
  }, function(err) {
    fsError('fileSystem.js: Cannot request File System.', err);
  });
  loadingScreen.setMessage('File Parsed!');
  loadingScreen.setPercentage(50);
})();
