(function() {
  var model;
  var controller;
  var view;
  model = {
    init: {
      init: function() {
        window.top.postMessage({
          request: 'LIST_PACKAGES'
        }, '*');
        window.addEventListener('message', function(msg) {
          model.handleData[msg.data.request](msg.data.data);
        }.bind(this), false);
      }
    },
    handleData: {
      'LIST_PACKAGES': function(unsortedApps) {
        var apps = [];
        apps = apps.concat(unsortedApps.system);
        apps = apps.concat(unsortedApps.user);
        for (let i = apps.length - 1; i >= 0; i--) {
          apps[i].launchable = false;
          if (apps[i].manifest.activities.main) {
            apps[i].launchable = true;
          }
          if (apps[i].launchable && apps[i].manifest.activities.main.ico) {
            apps[i].icoPath = apps[i].path + apps[i].manifest.activities.main.ico;
          } else if (apps[i].manifest.ico) {
            apps[i].icoPath = apps[i].path + apps[i].manifest.ico;
          } else {
            apps[i].icoPath = 'res/drawable/file.svg';
          }
          apps[i] = {
            'UID': apps[i].manifest.UID,
            'name': apps[i].manifest.name,
            'icoPath': apps[i].icoPath,
            'launchable': apps[i].launchable
          };
        }
        controller.init.appList(apps);
      },
      'LAUNCH_PACKAGES': function(status) {
      }
    },
    apps: {
      launch: function(UID, activity) {
        window.top.postMessage({
          request: 'LAUNCH_PACKAGES',
          data: {
            UID: UID,
            activity: activity,
            background: false
          }
        }, '*');
      }
    }
  };
  controller = {
    init: {
      init: function() {
        model.init.init();
        view.init.init();
      },
      appList: function(apps) {
        view.init.listApps(apps);
      }
    },
    apps: {
      launch: function(UID, activity) {
        model.apps.launch(UID, activity);
      }
    }
  };
  view = {
    init: {
      init: function() {
        var sections = ['settings', 'apps'];
        for (let i = 0, ii = sections.length; i != ii; i++) {
          let section = document.createElement('div');
          section.className = 'cardSection';
          section.id = sections[i];
          let topSection = document.createElement('div');
          topSection.className = 'sectionHeader';
          let sectionName = document.createElement('p');
          sectionName.innerText = sections[i];
          topSection.appendChild(sectionName);
          section.appendChild(topSection);
          let body = document.createElement('div');
          body.className = 'body';
          let loadingText = document.createElement('p');
          loadingText.className = 'loading';
          loadingText.innerText = 'Loading...';
          body.appendChild(loadingText);
          section.appendChild(body);
          document.body.appendChild(section);
        }
      },
      listApps: function(apps) {
        var appContainer = document.querySelector('#apps .body');
        while (appContainer.children.length) {
          appContainer.removeChild(appContainer.children[0]);
        }
        for (let i = 0, ii = apps.length; i != ii; i++) {
          let appItem = document.createElement('div');
          appItem.className = 'appListItem';
          let centerVertical = document.createElement('div');
          centerVertical.className = 'centerVertical';
          let icoContainer = document.createElement('div');
          icoContainer.className = 'icoContainer';
          let appIco = document.createElement('img');
          appIco.src = apps[i].icoPath;
          icoContainer.appendChild(appIco);
          if (apps[i].launchable) {
            appIco.className = 'launchable';
            let launchIco = document.createElement('img');
            launchIco.className = 'launchIco';
            launchIco.src = 'res/drawable/launchApp.svg';
            launchIco.addEventListener('click', function() {
              controller.apps.launch(apps[i].UID, 'main');
            }.bind(this));
            icoContainer.appendChild(launchIco);
          }
          centerVertical.appendChild(icoContainer);
          appItem.appendChild(centerVertical);
          let centerText = document.createElement('div');
          centerText.className = 'centerVertical';
          let appName = document.createElement('p');
          appName.innerText = apps[i].name;
          centerText.appendChild(appName);
          appItem.appendChild(centerText);
          appContainer.appendChild(appItem);
        }
      }
    }
  };
  controller.init.init();
})();
