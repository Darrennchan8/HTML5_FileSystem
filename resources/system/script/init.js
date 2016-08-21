(function () {
    "use strict";
    var model, view, controller;
    model = {
        init: function () {
            /*Styles for loading screen*/
            this.requiredStyles = `
                body {
                    overflow: hidden;
                    margin: 0;
                    padding: 0;
                    font-family: Roboto, sans-serif;
                }
                .loadingFrame {
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    z-index: 2147483647;
                    margin: 0;
                    background-color: #9E9E9E;
                }
                .loadingFrame_banner {
                    position: absolute;
                    top: 35vh;
                    left: 50vw;
                    font-size: 10vh;
                    color: #616161;
                    transform: translate(-50%, -50%);
                }
                .loadingFrame_banner::before {
                    content: "Loading...";
                }
                .loadingFrame_footer {
                    position: absolute;
                    bottom: 0;
                    width: 100%;
                    height: 10vh;
                    background-color: #616161;
                }
                .loadingFrame_progressBar {
                    height: 1vh;
                    top: 0;
                    position: absolute;
                    width: 0%;
                    background-color: #2196F3;
                    transition: width .3s;
                }
                .loadingFrame_message {
                    cursor: default;
                    font-size: 2.5vh;
                    margin-top: 2.5vh;
                    margin-bottom: .5vh;
                    margin-left: 2vw;
                    color: #212121;
                    white-space: nowrap;
                    overflow-x: hidden;
                    text-overflow: ellipsis;
                }
                .loadingFrame_subMessage {
                    cursor: default;
                    font-size: 1.25vh;
                    margin: 1.5vh;
                    margin-left: 4vw;
                    color: #212121;
                    white-space: nowrap;
                    overflow-x: hidden;
                    text-overflow: ellipsis;
                }
                .loadingFrame_subMessage::before {
                    content: "Loading ";
                }
                .loadingFrame_subMessage::after {
                    content: "...";
                }
            `;
            this.enchanceScripts();
        },
        scripts: [
            {
                title: "Preparing FileSystem...",
                uri: "system/script/fileSystem.js",
                weight: 1
            }, {
                title: "Starting UI...",
                uri: "system/script/app-framework.js",
                weight: 9
            }
        ],
        enchanceScripts: function () {
            /*Calculate additional details that will make life easier.
            balanced_weight is the numerical decimal of how much space any script will occupy
            breakpoint is a string used for comparisons
            */
            var scripts = this.scripts;
            var total_weight = 0;
            var sum = 0;
            var previousBreakpoints = 0;
            for (let i = 0, ii = scripts.length; i != ii; i++) {
                total_weight += scripts[i].weight;
            }
            for (let i = 0, ii = scripts.length; i != ii; i++) {
                scripts[i].balanced_weight = parseFloat((scripts[i].weight / total_weight).toFixed(3));
            }
            for (let i = 0, ii = scripts.length; i != ii; i++) {
                sum += scripts[i].balanced_weight;
            }
            if (sum != 1) {
                scripts[0].balanced_weight += parseFloat((1 - sum).toFixed(3));
            }
            for (let i = 0, ii = scripts.length; i != ii; i++) {
                previousBreakpoints += scripts[i].balanced_weight * 100
                scripts[i].breakpoint = previousBreakpoints + "%";
            }
        }
    };

    controller = {
        init: function () {
            model.init();
            view.init();
            this.loadScripts();
            this.loadNext();
        },
        getStyles: function () {
            return model.requiredStyles;
        },
        finished: function () {
            document.body.removeChild(view.loadingFrame);
        },
        loadScripts: function () {
            view.loadingFrame.footer.addEventListener("transitionend", function () {
                view.loadNext();
                if (model.scripts[this.currentTarget].breakpoint == view.loadingFrame.footer.progressBar.style.width) {
                    this.currentTarget++;
                    if (this.currentTarget != model.scripts.length) {
                        this.loadNext();
                    } else {
                        this.finished();
                    }
                }
            }.bind(this));
        },
        currentTarget: 0,
        loadNext: function () {
            view.loadingFrame.footer.message.innerText = model.scripts[controller.currentTarget].title;
            view.loadingFrame.footer.subMessage.innerText = model.scripts[controller.currentTarget].uri;
            let script = document.createElement("script");
            script.src = model.scripts[controller.currentTarget].uri;
            script.addEventListener("load", function () {
                document.head.removeChild(script);
            }.bind(script));
            document.head.appendChild(script);
        },
        globalize: function (global_obj) {
            Object.freeze(global_obj);
            window.loadingScreen = global_obj;
        },
        getWidth: function (scriptNum) {
            return model.scripts[scriptNum].balanced_weight * 100;
        }
    };

    view = {
        previousWidths: 0,
        init: function () {
            /*Clean up*/
            document.currentScript.parentNode.removeChild(document.currentScript);
            document.title = "App Launcher";
            /*Enable Styles*/
            var styles;
            styles = controller.getStyles();
            this.styleElem = document.createElement("style");
            this.styleElem.innerHTML = styles;
            document.head.appendChild(this.styleElem);
            /*Add to DOM*/
            this.loadingFrame = (function () {
                var loadingFrame, banner, footer, progressBar, message, subMessage;
                loadingFrame = document.createElement("div");
                loadingFrame.className = "loadingFrame";
                banner = document.createElement("p");
                banner.className = "loadingFrame_banner";
                loadingFrame.banner = banner;
                loadingFrame.appendChild(banner);
                footer = document.createElement("div");
                footer.className = "loadingFrame_footer";
                progressBar = document.createElement("div");
                progressBar.className = "loadingFrame_progressBar";
                footer.progressBar = progressBar;
                footer.appendChild(progressBar);
                message = document.createElement("p");
                message.className = "loadingFrame_message";
                footer.message = message;
                footer.appendChild(message);
                subMessage = document.createElement("p");
                subMessage.className = "loadingFrame_subMessage";
                footer.subMessage = subMessage;
                footer.appendChild(subMessage);
                loadingFrame.footer = footer;
                loadingFrame.appendChild(footer);
                document.body.appendChild(loadingFrame);
                return loadingFrame;
                /*
                    loadingFrame:{
                        banner:{},
                        footer:{
                            progressBar:{},
                            message:{},
                            subMessage:{},
                            recoveryBtn:{}
                        }
                    }
                */
            })();
            controller.globalize(this.global);
        },
        global: {
            setMessage: function (msg) {
                view.loadingFrame.footer.message.innerText = msg;
            },
            setPercentage: function (percentage) {
                if (percentage > 100 || percentage < 0) {
                    throw new Error("Invalid Percentage");
                }
                view.loadingFrame.footer.progressBar.style.width = view.previousWidths + percentage * model.scripts[controller.currentTarget].balanced_weight + "%";
            }
        },
        loadNext: function () {
            this.previousWidths += controller.getWidth(controller.currentTarget);
        }
    };
    controller.init();
})();