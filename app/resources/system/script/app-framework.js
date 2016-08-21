loadingScreen.setMessage("Parsing File...");
(function () {
	"use strict";
	var model, view, controller;
	model = {
		init: function () {
			loadingScreen.setPercentage(4);
			loadingScreen.setMessage("Initializing Model...");
			this.installationType = "persistent";
			this.style = `
				body {
					background: #eeeded;
					margin: 0;
				}
				@font-face {
					font-family: 'Roboto';
					font-style: normal;
					font-weight: 400;
					src:url('../fonts/roboto.woff2') format('woff2');
					unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215, U+E0FF, U+EFFD, U+F000;
				}
				@font-face {
					font-family: 'Roboto';
					font-style: normal;
					font-weight: 400;
					src: local('Roboto'), local('Roboto-Regular'), url(https://fonts.gstatic.com/s/roboto/v15/CWB0XYA8bzo0kSThX0UTuA.woff2) format('woff2');
					unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215, U+E0FF, U+EFFD, U+F000;
				}
				* {
					/*Disables Highlighting*/
					-webkit-touch-callout: none;
					-webkit-user-select: none;
					-moz-user-select: none;
					-ms-user-select: none;
					user-select: none;
					/*Disables Dragging*/
					-webkit-user-drag: none;
					-khtml-user-drag: none;
					-moz-user-drag: none;
					-o-user-drag: none;
					font-family: 'Roboto', sans-serif;
				}
				::-webkit-scrollbar {
					display: none;
				}
				.header {
					position: absolute;
					display: flex;
					top: 0;
					box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
					width: 100%;
					background-color: #00BCD4;
					height: 6vmax;
					max-height: 6vmax;
					overflow-x: scroll;
					z-index: 3;
				}
				.header p.clickable {
					cursor: pointer;
					margin-left: 1vmax;
					margin-right: 1vmax;
				}
				.header p {
					cursor: default;
					color: white;
					font-size: xx-large;
					margin: 0;
					margin-top: auto;
					margin-bottom: auto;
				}
				.appFrame {
					margin-top: 6vmax;
				}
				.hamburgerIco {
					padding: 1.76vmax;
					cursor: pointer;
					transition: transform .2s ease-out;
				}
				.hamburgerIco::active {
				}
				.hamburgerIco::before {
					content:"";
					border-radius: 1.6vmax;
					width: 2.8vmax;
					height: .4vmax;
					background-color: white;
					display: block;
					transition: width .2s ease-out, border-radius .2s, transform .2s ease-out;
				}
				.hamburgerIco span {
					border-radius: 1.6vmax;
					margin-top: .64vmax;
					margin-bottom: .64vmax;
					width: 2.8vmax;
					height: .4vmax;
					background-color: white;
					display: block;
					transition: border-radius .2s;
				}
				.hamburgerIco::after {
					content:"";
					border-radius: 1.6vmax;
					width: 2.8vmax;
					height: .4vmax;
					background-color: white;
					display: block;
					transition: width .2s ease-out, border-radius .2s, transform .2s ease-out;
				}
				.hamburgerIco.back::before {
					border-radius:0;
					transform-origin: bottom right;
					transform: translateX(1.5vmax) translateY(1.1vmax) rotate(45deg);
					width: 1.4vmax;
				}
				.hamburgerIco.back span {
					border-radius:0;
				}
				.hamburgerIco.back {
					transform: rotate(180deg);
				}
				.hamburgerIco.back::after {
					border-radius:0;
					transform-origin: top right;
					transform: translateX(1.5vmax) translateY(-1.1vmax) rotate(-45deg);
					width: 1.4vmax;
				}
				.hamburgerMenu {
					cursor: default;
					height: 100%;
					padding-top: 6vmax;
					width: 35vmax;
					max-width: 35vmax;
					background-color: #eeeded;
					margin: 0;
					position: fixed;
					z-index: 2;
					box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
					-webkit-transition: left .35s ease-out;
					transition: left .35s ease-out;
					overflow-x: scroll;
				}
				.menuOpened {
					left: 0vmax;
				}
				.menuClosed {
					left: -35vmax;
				}
				.overlay {
					left: 0;
					top: 0;
					z-index: 1;
					position: fixed;
					width: 100%;
					height: 100%;
					background-color: rgba(0, 0, 0, .6);
					-webkit-transition: opacity .15s ease-out;
					transition: opacity .15s ease-out;
				}
				.o_deactivated {
					opacity: 0;
				}
				.o_activated {
					display: block;
					opacity: 1;
				}
				.iframeContainer {
					width: 100%;
					height: 100%;
					margin: 0;
					top: 0;
					left: 0;
					position: fixed;
					overflow: hidden;
					padding-top: 6vmax;
				}
				.iframeContainer * {
					width: 100%;
					height: 100%;
				}
			`;
			this.base = location.protocol + location.origin + "/" + this.installationType + "/";
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
			loadingScreen.setMessage("Model Initialized!");
		},
		getIco: function (ico) {
			return this.base + "system/res/" + ico;
		},
		history: [],
		getAllowedMethods: function () {
			var objects = [this.allowedMethods.user];
			var targets = [this.allowedMethods.system];
			for (let i = 0; i != objects.length; i++) {
				var user = Object.keys(objects[i]);
				while (user.length !== 0) {
					let curr_permission = user.shift();
					if (targets[i][curr_permission]) {
						if (typeof objects[i][curr_permission] == "object") {
							objects.push(objects[i][curr_permission]);
							targets.push(targets[i][curr_permission]);
						} else if (!targets[i][curr_permission]) {
							targets[i][curr_permission] = objects[i][curr_permission];
						}
					} else {
						targets[i][curr_permission] = objects[i][curr_permission];
					}
				}
			}
			return this.allowedMethods;
		},
		getApps: function (callback) {
			fs.scandir({
				path: "/system/app/",
				callback: function (callback, dirContents) {
					var apps = {
						system: [],
						user: []
					};
					let userQueue = function (apps, manifests) {
						loadingScreen.setPercentage(16);
						loadingScreen.setMessage("Queueing User Apps...");
						for (let i = 0, ii = apps.length; i != ii; i++) {
							apps[i].manifest = manifests[i];
						}
						fs.scandir ({
							path: "/data/app/",
							callback: function (apps, callback, dirContents) {
								var ii = dirContents.folders.length;
								for (let i = 0; i != ii; i++) {
									apps.user.push({
										path: dirContents.folders[i].fullPath + "/",
										type: "user"
									});
									model.getManifest(apps.user.path, function (apps, manifests) {
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
							path: dirContents.folders[i].fullPath + "/",
							type: "system"
						});
						model.getManifest(apps.system[i].path, userQueue);
					}
					if (ii = 0) {
						userQueue();
					}
				}.bind(this, callback)
			});
		},
		getManifest: function (apps, callback) {
			var xhr = [];
			var results = [];
			if (!Array.isArray(apps)) {
				apps = [apps];
			}
			var index = 0;
			for (let i = 0, ii = apps.length; i != ii; i++) {
				results[i] = {};
				xhr[i] = new XMLHttpRequest();
				xhr[i].open("GET", apps[i] + "manifest.json", true);
				xhr[i].addEventListener("load", function (maxlength, current) {
					try {
						results[current] = JSON.parse(xhr[current].responseText);
					} catch (err) {
						console.error(err);
						console.error("Invalid Manifest file for " + apps[current]);
					}
					if (maxlength == ++index) {
						callback(results);
					}
				}.bind(this, ii, i));
				xhr[i].addEventListener("error", function (maxlength, current) {
					console.error("Manifest file missing for " + apps[current]);
					if (maxlength == ++index) {
						callback(results);
					}
				}.bind(this, ii, i));
				xhr[i].send();
			}
		}
	};

	controller = {
		init: function () {
			loadingScreen.setPercentage(2);
			loadingScreen.setMessage("Initializing Controller...");
			model.init();
			view.init();
			window.allowedMethods = {};
			Object.assign(window.allowedMethods, model.getAllowedMethods());
			Object.freeze(window.allowedMethods);
			this.loadApps();
		},
		getStyle: function () {
			return model.style;
		},
		tmpFile: function (data, callback) {
			fs.tmpFile(data, callback);
		},
		getSVG: function (icon) {
			return model.getIco(icon + ".svg");
		},
		addHistory: function (title, UID) {
			model.history.push(title);
		},
		clearHistory: function (UID) {
			model.history = [];
		},
		getHistory: function (UID) {
			return model.history;
		},
		open: function (package_name, activity) {
		},
		loadApps: function () {
			if (this.loaded) {
				loadingScreen.setPercentage(13);
				loadingScreen.setMessage("Queueing System Apps...");
				model.getApps(function (apps) {
					loadingScreen.setPercentage(20);
					loadingScreen.setMessage("Processing Packages...");
					var invokeStartup = function (i) {
						if (i != apps.length) {
							controller.startupManager(apps[i], function () {
								invokeStartup(++i);
							}.bind(this));
						} else {
							console.warn("Startups done");
						}
					};
					invokeStartup(0);
				}.bind(this));
			} else {
				this.loaded = true;
			}
		},
		startupManager: function (app_details, callback) {
			console.warn(app_details);
			callback();
		},
		requestChooser: function (activity) {
		}
	};

	view = {
		setStyle: function () {
			var style = controller.getStyle();
			controller.tmpFile(style, function (CSS_URL) {
				var CSS_Elem = document.createElement("link");
				CSS_Elem.type = "text/css";
				CSS_Elem.rel = "stylesheet";
				CSS_Elem.href = CSS_URL;
				CSS_Elem.addEventListener("load", function () {
					loadingScreen.setPercentage(10);
					loadingScreen.setMessage("Styles Loaded!");
					controller.loadApps();
				});
				document.head.appendChild(CSS_Elem);
			});
		},
		init: function () {
			loadingScreen.setPercentage(8);
			loadingScreen.setMessage("Initializing View...");
			this.setStyle();
			this.ribbonBar.init();
			this.hamburgerMenu.init();
			view.overlay = document.createElement("div");
			view.overlay.className = "overlay o_deactivated";
			view.overlay.addEventListener("click", function (event) {
				view.hamburgerMenu.isOpen = true;
				view.hamburgerMenu.toggle();
				event.stopPropagation();
			});
			view.overlay.addEventListener("transitionend", function () {
				if (this.className == "overlay o_deactivated") {
					this.style.display = "none";
				}
			}.bind(view.overlay));
			document.body.appendChild(view.overlay);
			view.iframeContainer = document.createElement("div");
			view.iframeContainer.className = "iframeContainer";
			document.body.appendChild(view.iframeContainer);
		},
		ribbonBar: {
			init: function () {
				var header;
				header = document.createElement("div");
				header.className = "header";
				document.body.appendChild(header);
				view.ribbonBar.header = header;
			},
			addTitle: function () {
				var args = Array.from(arguments);
				while (args.length !== 0) {
					let txt, txtElem;
					txt = args.shift();
					if (typeof txt == "string") {
						txt = {
							title:txt
						};
					}
					controller.addHistory(txt);
					txtElem = document.createElement("p");
					if (txt.onclick) {
						txtElem.className = "clickable";
						txtElem.addEventListener("click", txt.onclick);
					}
					txtElem.innerText = txt.title;
					view.ribbonBar.header.appendChild(txtElem);
				}
			},
			getTitle: function () {
				return controller.getHistory();
			},
			clearTitle: function () {
				controller.clearHistory();
			},
			changeColor: function () {
			}
		},
		hamburgerMenu: {
			isOpen: false,
			init: function() {
				view.hamburgerIco = document.createElement("div");
				view.hamburgerIco.className = "hamburgerIco menu";
				var hamburgerIco_bar = document.createElement("span");
				view.hamburgerIco.appendChild(hamburgerIco_bar);
				view.hamburgerIco.addEventListener("click", view.hamburgerMenu.toggle);
				view.ribbonBar.header.appendChild(view.hamburgerIco);
				view.hamburgerMenu.menu = document.createElement("div");
				view.hamburgerMenu.menu.className = "hamburgerMenu menuClosed";
				document.body.appendChild(view.hamburgerMenu.menu);
			},
			toggle: function () {
				if (view.hamburgerMenu.isOpen) {
					view.hamburgerMenu.isOpen = false;
					view.hamburgerMenu.menu.className = "hamburgerMenu menuClosed";
					view.overlay.className = "overlay o_deactivated";
					view.hamburgerIco.className = "hamburgerIco menu";
				} else {
					view.hamburgerMenu.isOpen = true;
					view.hamburgerMenu.menu.className = "hamburgerMenu menuOpened";
					view.hamburgerIco.className = "hamburgerIco back";
					view.overlay.style.display = "block";
					view.overlay.className = "overlay o_activated";
				}
			}
		}
	};
	controller.init();
})();