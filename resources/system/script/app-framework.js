loadingScreen.setMessage('Parsing File...');
(function() {
  'use strict';

  var model = {
    init: function() {
      loadingScreen.setPercentage(4);
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
      loadingScreen.setPercentage(6);
      loadingScreen.setMessage('Model Initialized!');
    },
    getIco: function(ico) {
      return this.base + 'system/res/drawable' + ico;
    },
    history: [],
    getAllowedMethods: function() {
      var objects = [this.allowedMethods.user];
      var targets = [this.allowedMethods.system];
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
    getApps: function(callback) {
      fs.scandir({
        path: '/system/app/',
        callback: function(callback, dirContents) {
          var apps = {
            system: [],
            user: []
          };
          let userQueue = function(apps, manifests) {
            loadingScreen.setPercentage(16);
            loadingScreen.setMessage('Queueing User Apps...');
            for (let i = 0, ii = apps.length; i != ii; i++) {
              apps[i].manifest = manifests[i];
            }
            fs.scandir({
              path: '/data/app/',
              callback: function(apps, callback, dirContents) {
                var ii = dirContents.folders.length;
                for (let i = 0; i != ii; i++) {
                  apps.user.push({
                    path: dirContents.folders[i].fullPath + '/',
                    type: 'user'
                  });
                  model.getManifest(apps.user.path, function(apps, manifests) {
                    for (let i = 0, ii = apps.length; i != ii; i++) {
                      apps[i].manifest = manifests[i];
                    }
                    callback(apps);
                  }.bind(this, apps.user));
                }
                if (ii == 0) {
                  callback(apps);
                }
              }.bind(this, apps, callback)
            });
          }.bind(this, apps.system);
          var ii = dirContents.folders.length;
          for (let i = 0; i != ii; i++) {
            apps.system.push({
              path: dirContents.folders[i].fullPath + '/',
              type: 'system'
            });
            model.getManifest(apps.system[i].path, userQueue);
          }
          if (ii = 0) {
            userQueue();
          }
        }.bind(this, callback)
      });
    },
    getManifest: function(apps, callback) {
      var xhr = [];
      var results = [];
      if (!Array.isArray(apps)) {
        apps = [apps];
      }
      var index = 0;
      for (let i = 0, ii = apps.length; i != ii; i++) {
        results[i] = {};
        xhr[i] = new XMLHttpRequest();
        xhr[i].open('GET', apps[i] + 'manifest.json', true);
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

  var controller = {
    init: function() {
      loadingScreen.setPercentage(2);
      loadingScreen.setMessage('Initializing Controller...');
      model.init();
      view.init();
      window.allowedMethods = {};
      Object.assign(window.allowedMethods, model.getAllowedMethods());
      Object.freeze(window.allowedMethods);
      model.settings.load(function() {
        this.loadApps();
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
    open: function(packageName, activity) {
    },
    loadApps: function() {
      /*Runs after all styles are loaded and configuration data is loaded*/
      if (this.loaded) {
        loadingScreen.setPercentage(13);
        loadingScreen.setMessage('Querying Apps...');
        model.getApps(function(apps) {
          loadingScreen.setPercentage(20);
          loadingScreen.setMessage('Processing Permissions...');
          var allPermissions = {
            'DEFAULT_HOME': function(app) {
              try {
                var appConfig = {
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
            }
          };
          for (let i = 0, ii = apps.length; i != ii; i++) {
            try {
              view.hamburgerMenu.add({
                title: apps[i].manifest.name
              });
              let iindex = apps[i].manifest.permissions.length;
              for (let index = 0; index != iindex; index++) {
                if (allPermissions[apps[i].manifest.permissions[index]]) {
                  allPermissions[apps[i].manifest.permissions[index]](apps[i]);
                } else {
                  console.warn('Unrecognized or unneccessary permission: ',
                    apps[i].manifest.permissions[index]);
                }
              }
            } catch (err) {
              console.error('Invalid Manifest Configuration.',
                'No activities will be added.', err);
            }
          }
          view.requestActivity('DEFAULT_HOME', {
            exclusive: false
          });
        });
      } else {
        this.loaded = true;
      }
    },
    activityMatch: function(activity, callback) {
      var status = false;
      var localPermissions = model.permissions;
      var savedPermissions = model.settings.config.permissions;
      var compare = function(obj1, obj2, activity) {
        obj1 = JSON.stringify(obj1[activity]);
        obj2 = JSON.stringify(obj2[activity]);
        return obj1 != obj2;
      };
      if (compare(localPermissions, savedPermissions, activity)) {
        if (localPermissions[activity].length === 1) {
          savedPermissions[activity] = localPermissions[activity];
        } else {
          status = true;
        }
      }
      model.settings.upload(callback.bind(this, status));
    }
  };

  var view = {
    setStyle: function() {
      var CSSElem = document.createElement('link');
      CSSElem.type = 'text/css';
      CSSElem.rel = 'stylesheet';
      CSSElem.href = 'system/res/styles/framework.css';
      CSSElem.addEventListener('load', function() {
        loadingScreen.setPercentage(10);
        loadingScreen.setMessage('Styles Loaded!');
        controller.loadApps();
      });
      document.head.appendChild(CSSElem);
    },
    init: function() {
      loadingScreen.setPercentage(8);
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
        console.log('ADD HAMBURGER: ', options);
      }
    },
    requestActivity: function(activityName, options) {
      controller.activityMatch(activityName, function(result) {
        /*Display dialogue only when necessary*/
        if (options.exclusive || result) {
          console.log(activityName, options);
        }
      }.bind(this));
    }
  };

  controller.init();
})();
