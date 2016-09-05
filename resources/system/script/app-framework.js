loadingScreen.setMessage('Parsing File...');
(function() {
  'use strict';
  var model;
  var view;
  var controller;

  model = {
    init: function() {
      loadingScreen.setPercentage(6);
      loadingScreen.setMessage('Initializing Model...');
      this.installationType = 'persistent';
      this.base = location.protocol;
      this.base += location.origin;
      this.base += '/' + this.installationType + '/';
      this.allowedMethods = {
        system: {
        },
        user: {
          ribbon: {
            addTitle: view.ribbonBar.addTitle,
            getTitle: view.ribbonBar.getTitle,
            clearTitle: view.ribbonBar.clearTitle,
            changeColor: view.ribbonBar.changeColor
          },
          hamburgerMenu: {
          },
          setFavicon: null,
          setTitle: null
        }
      };
      loadingScreen.setPercentage(9);
      loadingScreen.setMessage('Model Initialized!');
    },
    getIco: function(ico) {
      return this.base + 'system/res/drawable' + ico;
    },
    history: [],
    apps: {
      getAllowedMethods: function() {
        var objects = [model.allowedMethods.user];
        var targets = [model.allowedMethods.system];
        for (let i = 0; i != objects.length; i++) {
          var user = Object.keys(objects[i]);
          while (user.length !== 0) {
            let currentPermission = user.shift();
            if (targets[i][currentPermission]) {
              if (typeof objects[i][currentPermission] == 'object') {
                objects.push(objects[i][currentPermission]);
                targets.push(targets[i][currentPermission]);
              } else if (!targets[i][currentPermission]) {
                targets[i][currentPermission] = objects[i][currentPermission];
              }
            } else {
              targets[i][currentPermission] = objects[i][currentPermission];
            }
          }
        }
        return this.allowedMethods;
      },
      organizeManifests: function(input, target, callback) {
        var ii = input.folders.length;
        var paths = [];
        if (ii) {
          for (let i = 0; i != ii; i++) {
            target.push({
              path: input.folders[i].fullPath + '/',
              type: 'system'
            });
            paths.push(input.folders[i].fullPath);
          }
          model.apps.getManifests(paths, function(results) {
            for (let i = 0, ii = target.length; i != ii; i++) {
              target[i].manifest = results[i];
            }
            callback();
          }.bind(this));
        } else {
          callback([]);
        }
      },
      getManifests: function(apps, callback) {
        var xhr = [];
        var results = [];
        if (!Array.isArray(apps)) {
          apps = [apps];
        }
        var index = 0;
        for (let i = 0, ii = apps.length; i != ii; i++) {
          results[i] = {};
          xhr[i] = new XMLHttpRequest();
          xhr[i].open('GET', apps[i] + '/manifest.json', true);
          xhr[i].addEventListener('load', function(maxlength, current) {
            try {
              results[current] = JSON.parse(xhr[current].responseText);
            } catch (err) {
              console.error(err);
              console.error('Invalid Manifest file for ' + apps[current]);
            }
            if (maxlength == ++index) {
              callback(results);
            }
          }.bind(this, ii, i));
          xhr[i].addEventListener('error', function(maxlength, current) {
            console.error('Manifest file missing for ' + apps[current]);
            if (maxlength == ++index) {
              callback(results);
            }
          }.bind(this, ii, i));
          xhr[i].send();
        }
      },
      getAll: function(callback) {
        var apps = {
          system: [],
          user: []
        };
        fs.scandir({
          path: '/system/app/',
          callback: function(dirContents) {
            model.apps.organizeManifests(dirContents, apps.system, function() {
              fs.scandir({
                path: '/data/app/',
                callback: function(dirContents) {
                  model.apps.organizeManifests(dirContents, apps.user,
                  function() {
                    callback(apps);
                  }.bind(this));
                }.bind(this)
              });
            }.bind(this));
          }.bind(this)
        });
      },
      apps: []
    },
    settings: {
      load: function(callback) {
        fs.contents({
          origin: '/data/',
          path: 'config.json',
          callback: function(callback, data) {
            data = JSON.parse(data);
            model.settings.config = data;
            callback();
          }.bind(this, callback)
        });
      },
      upload: function(callback) {
        fs.delete({
          type: 'file',
          path: '/data/config.json',
          callback: function() {
            fs.new({
              type: 'file',
              path: '/data/',
              name: 'config.json',
              data: JSON.stringify(model.settings.config),
              callback: callback.bind(this)
            });
          }.bind(this)
        });
      }
    },
    permissions: {}
  };

  controller = {
    init: function() {
      loadingScreen.setPercentage(6);
      loadingScreen.setMessage('Initializing Controller...');
      model.init();
      view.init();
      window.allowedMethods = {};
      Object.assign(window.allowedMethods, model.apps.getAllowedMethods());
      Object.freeze(window.allowedMethods);
      model.settings.load(function() {
        this.apps.init();
      }.bind(this));
    },
    tmpFile: function(data, callback) {
      fs.tmpFile(data, callback);
    },
    getSVG: function(icon) {
      return model.getIco(icon + '.svg');
    },
    addHistory: function(title, UID) {
      model.history.push(title);
    },
    clearHistory: function(UID) {
      model.history = [];
    },
    getHistory: function(UID) {
      return model.history;
    },
    apps: {
      init: function() {
        /*Runs after all styles are loaded and configuration data is loaded*/
        if (this.loaded) {
          loadingScreen.setPercentage(26);
          loadingScreen.setMessage('Querying Apps...');
          model.apps.getAll(function(apps) {
            loadingScreen.setPercentage(60);
            loadingScreen.setMessage('Initializing Apps...');
            var allPermissions = {
              'DEFAULT_HOME': function(app) {
                try {
                  var appConfig = {
                    manifest: app.manifest,
                    activity: app.manifest.activities.home,
                    path: app.path,
                    type: app.type
                  };
                  if (!model.permissions.DEFAULT_HOME) {
                    model.permissions.DEFAULT_HOME = [];
                  }
                  model.permissions.DEFAULT_HOME.push(appConfig);
                } catch (err) {
                  console.error('Invalid home configuration.', err);
                }
              },
              'LIST_PACKAGES': function(app) {
                window.addEventListener('message', function(msg) {
                  if (msg.data.request != 'LIST_PACKAGES') {
                    return;
                  }
                  var origin = msg.source.location.pathname.split('/');
                  var appType = origin[0];
                  var appName = origin[3];
                  var app;
                  for (let i = model.apps.apps.length - 1; i >= 0; i--) {
                    let currPath = model.apps.apps[i].path.split('/');
                    if (appName == currPath[3] && appType == currPath[0]) {
                      app = model.apps.apps[i];
                    }
                  }
                  if (app) {
                    if (app.manifest.permissions.includes('LIST_PACKAGES')) {
                      model.apps.getAll(function(apps) {
                        msg.source.postMessage({
                          request: 'LIST_PACKAGES',
                          data: apps
                        }, '*');
                      }.bind(this));
                    } else {
                      msg.source.postMessage(new Error('"LIST_PACKAGES" not in manifest permissions.'), '*');
                    }
                  } else {
                    msg.source.postMessage(new Error('Invalid Origin: ' + msg.source.location.pathname), '*');
                  }
                }, false);
              },
              'LAUNCH_PACKAGES': function(app) {
                window.addEventListener('message', function(msg) {
                  if (msg.data.request != 'LAUNCH_PACKAGES') {
                    return;
                  }
                  var origin = msg.source.location.pathname.split('/');
                  var appType = origin[0];
                  var appName = origin[3];
                  var app;
                  for (let i = model.apps.apps.length - 1; i >= 0; i--) {
                    let currPath = model.apps.apps[i].path.split('/');
                    if (appName == currPath[3] && appType == currPath[0]) {
                      app = model.apps.apps[i];
                    }
                  }
                  if (app) {
                    if (app.manifest.permissions.includes('LAUNCH_PACKAGES')) {
                      msg.data.data.background = !!msg.data.data.background;
                      let result = controller.apps.open(msg.data.data.UID, msg.data.data.activity, msg.data.data.background);
                      msg.source.postMessage({
                        request: 'LAUNCH_PACKAGES',
                        data: result
                      }, '*');
                    } else {
                      msg.source.postMessage(new Error('"LAUNCH_PACKAGES" not in manifest permissions.'), '*');
                    }
                  } else {
                    msg.source.postMessage(new Error('Invalid Origin: ' + msg.source.location.pathname), '*');
                  }
                }, false);
              }
            };
            var handleSector = function(apps) {
              for (let i = 0, ii = apps.length; i != ii; i++) {
                try {
                  if (apps[i].manifest.activities.main) {
                    view.hamburgerMenu.add(apps[i]);
                  } else {
                    console.warn('Missing Main activity');
                  }
                  let iindex = apps[i].manifest.permissions.length;
                  for (let index = 0; index != iindex; index++) {
                    let permissionName = apps[i].manifest.permissions[index];
                    if (allPermissions[permissionName]) {
                      allPermissions[permissionName](apps[i]);
                    } else {
                      console.warn('Unrecognized or unneccessary permission: ',
                        permissionName);
                    }
                  }
                } catch (err) {
                  console.error('Invalid Manifest Configuration.',
                    'No activities will be added.', err);
                }
              }
            };
            for (let i in apps) {
              let group = apps[i];
              handleSector(group);
              model.apps.apps = model.apps.apps.concat(model.apps.apps, group);
            }
            loadingScreen.setPercentage(70);
            loadingScreen.setMessage('Starting Apps...');
            view.requestChooser.request('DEFAULT_HOME', {
              exclusive: false
            }, function(eligibleApp) {
              controller.apps.open(eligibleApp.manifest.UID, 'home', false);
            });
            setTimeout(function() {
              loadingScreen.setPercentage(100);
              loadingScreen.setMessage('Done!');
            }, 100);
          });
        } else {
          this.loaded = true;
        }
      },
      launch: function(app) {
        if (app.manifest.activities && app.manifest.activities.main) {
          controller.apps.open(app.manifest.UID, 'main', false);
        } else {
          console.warn('No main Activity found, can\'t launch.');
        }
      },
      open: function(appUID, activity, background) {
        var appLength = model.apps.apps.length;
        for (let i = 0; i != appLength; i++) {
          // All Apps List
          if (model.apps.apps[i].manifest.UID == appUID) {
            let app = model.apps.apps[i];
            if (app.manifest.activities[activity]) {
              let sandbox = 'allow-forms allow-pointer-lock allow-scripts allow-same-origin';
              if (background) {
                if (!app.running) {
                  app.running = 'background';
                  app.frame = document.createElement('iframe');
                  app.frame.setAttribute('sandbox', sandbox);
                  app.frame.src = app.path;
                  app.frame.src += app.manifest.activities[activity].path;
                  view.iframeContainer.appendChild(app.frame);
                }
              } else {
                let iindex = model.apps.apps.length;
                for (let index = 0; index != iindex; index++) {
                  controller.apps.close(model.apps.apps[index], false);
                  model.apps.apps[index].menuEntry.className = 'hamburgerItem';
                }
                app.menuEntry.className = 'hamburgerItem active';
                if (!app.running) {
                  app.running = 'foreground';
                  app.frame = document.createElement('iframe');
                  app.frame.setAttribute('sandbox', sandbox);
                  app.frame.src = app.path;
                  app.frame.src += app.manifest.activities[activity].path;
                  view.iframeContainer.appendChild(app.frame);
                } else {
                  if (app.running == 'background') {
                    app.frame.style.display = 'block';
                    app.running = 'foreground';
                  }
                }
              }
              return true;
            } else {
              console.warn('No matching activity found for' + activity);
              return false;
            }
          }
        }
      },
      close: function(appObj, forceStop) {
        if (forceStop) {
          if (appObj.frame) {
            view.iframeContainer.removeChild(appObj.frame);
            appObj.running = false;
          }
        } else {
          if (appObj.frame) {
            appObj.frame.style.display = 'none';
            appObj.running = 'background';
          }
        }
      }
    },
    activityMatch: function(activity, callback) {
      var validApp;
      var reAsk = false;
      var localPermissions = model.permissions;
      var savedPermissions = model.settings.config.permissions;
      if (localPermissions[activity].length === 0) {
        throw new Error('No app capable of opening ' + activity);
      } else if (localPermissions[activity].length === 1) {
        localPermissions[activity][0].default = true;
        savedPermissions[activity] = localPermissions[activity];
      } else {
        reAsk = true;
      }
      var ii = localPermissions[activity].length;
      for (let i = 0; i != ii; i++) {
        if (localPermissions[activity][i].default) {
          validApp = localPermissions[activity][i];
          reAsk = false;
          break;
        }
      }
      model.settings.upload(callback.bind(this, reAsk, validApp));
    }
  };

  view = {
    setStyle: function() {
      var CSSElem = document.createElement('link');
      CSSElem.type = 'text/css';
      CSSElem.rel = 'stylesheet';
      CSSElem.href = 'system/res/styles/framework.css';
      CSSElem.addEventListener('load', function() {
        loadingScreen.setPercentage(30);
        loadingScreen.setMessage('Styles Loaded!');
        controller.apps.init();
      });
      document.head.appendChild(CSSElem);
    },
    init: function() {
      loadingScreen.setPercentage(32);
      loadingScreen.setMessage('Initializing View...');
      this.setStyle();
      this.ribbonBar.init();
      this.hamburgerMenu.init();
      view.overlay = document.createElement('div');
      view.overlay.className = 'overlay o_deactivated';
      view.overlay.addEventListener('click', function(event) {
        view.hamburgerMenu.isOpen = true;
        view.hamburgerMenu.toggle();
        event.stopPropagation();
      });
      view.overlay.addEventListener('transitionend', function() {
        if (this.className == 'overlay o_deactivated') {
          this.style.display = 'none';
        }
      }.bind(view.overlay));
      document.body.appendChild(view.overlay);
      view.iframeContainer = document.createElement('div');
      view.iframeContainer.className = 'iframeContainer';
      document.body.appendChild(view.iframeContainer);
    },
    ribbonBar: {
      init: function() {
        var header;
        header = document.createElement('div');
        header.className = 'header';
        document.body.appendChild(header);
        view.ribbonBar.header = header;
      },
      addTitle: function() {
        var args = Array.from(arguments);
        while (args.length !== 0) {
          let txt;
          let txtElem;
          txt = args.shift();
          if (typeof txt == 'string') {
            txt = {
              title: txt
            };
          }
          controller.addHistory(txt);
          txtElem = document.createElement('p');
          if (txt.onclick) {
            txtElem.className = 'clickable';
            txtElem.addEventListener('click', txt.onclick);
          }
          txtElem.innerText = txt.title;
          view.ribbonBar.header.appendChild(txtElem);
        }
      },
      getTitle: function() {
        return controller.getHistory();
      },
      clearTitle: function() {
        controller.clearHistory();
      },
      changeColor: function() {
      }
    },
    hamburgerMenu: {
      isOpen: false,
      init: function() {
        view.hamburgerIco = document.createElement('div');
        view.hamburgerIco.className = 'hamburgerIco menu';
        var hamburgerIcoBar = document.createElement('span');
        view.hamburgerIco.appendChild(hamburgerIcoBar);
        view.hamburgerIco.addEventListener('click', view.hamburgerMenu.toggle);
        view.ribbonBar.header.appendChild(view.hamburgerIco);
        view.hamburgerMenu.menu = document.createElement('div');
        view.hamburgerMenu.menu.className = 'hamburgerMenu menuClosed';
        document.body.appendChild(view.hamburgerMenu.menu);
      },
      toggle: function() {
        if (view.hamburgerMenu.isOpen) {
          view.hamburgerMenu.isOpen = false;
          view.hamburgerMenu.menu.className = 'hamburgerMenu menuClosed';
          view.overlay.className = 'overlay o_deactivated';
          view.hamburgerIco.className = 'hamburgerIco menu';
        } else {
          view.hamburgerMenu.isOpen = true;
          view.hamburgerMenu.menu.className = 'hamburgerMenu menuOpened';
          view.hamburgerIco.className = 'hamburgerIco back';
          view.overlay.style.display = 'block';
          view.overlay.className = 'overlay o_activated';
        }
      },
      add: function(options) {
        var item = document.createElement('div');
        item.className = 'hamburgerItem';
        var itemIco = document.createElement('img');
        itemIco.src = options.path + options.manifest.activities.main.ico;
        item.appendChild(itemIco);
        var itemTitle = document.createElement('p');
        itemTitle.innerText = options.manifest.name;
        item.appendChild(itemTitle);
        options.menuEntry = item;
        item.addEventListener('click', function(appDetails) {
          if (appDetails.running == 'foreground') {
            if (view.hamburgerMenu.isOpen) {
              view.hamburgerMenu.toggle();
            }
          } else {
            controller.apps.launch(appDetails);
          }
        }.bind(this, options));
        item.addEventListener('transitionend', function() {
          setTimeout(function() {
            if (view.hamburgerMenu.isOpen) {
              view.hamburgerMenu.toggle();
            }
          }.bind(this), 20);
        });
        view.hamburgerMenu.menu.appendChild(item);
      }
    },
    requestChooser: {
      request: function(activityName, options, callback) {
        controller.activityMatch(activityName, function(result, eligibleApp) {
          if (options.exclusive || result) {
            /*It's absolutely necessary to display the dialogue to switch apps*/
            console.log('DISPLAY DIALOGUE');
            callback();
          } else {
            callback(eligibleApp);
          }
        }.bind(this));
      },
      display: function(options) {
      }
    },
  };

  controller.init();
})();
