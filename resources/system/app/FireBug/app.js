(function() {
	"use strict";
	document.querySelector("a").href = `javascript:
	try{
		(function() {
			if (document.getElementById("FirebugLite")) {
				 return;
			}
			var element = document.createElement("script");
			element.id = "FirebugLite";
			element.src = "filesystem:` + location.host + `/res/firebug-lite-beta.js#startOpened";
			element.FirebugLite = "4";
			document.body.appendChild(element);
			var img = new Image;
			element.setAttribute("src", "filesystem:` + location.host + `/res/sprite.png");
		})();
	}catch (err) {
		alert(JSON.stringify(err));
	}
	`;
})();