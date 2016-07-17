"use strict";
var core,version;
version = 1.0;
/*var mobile=document.createElement("script");
mobile.setAttribute("src","https://drive.google.com/uc?export=download&id=0BzPj9VMZeClgWDNJZ2l4OUlNNGc");
document.body.appendChild(mobile);*/
core={
	init:function(){
		if(localStorage.getItem("initialized")===null){
			localStorage.setItem("initialized",true);
			localStorage.setItem("currentPath","/");
			localStorage.setItem("plugins",JSON.stringify([]));
		}
		fileManager.refresh();
		settings.plugins.init();
	},
	factoryReset:function(){
		localStorage.removeItem("initialized");
		location.reload();
	}
}
fsReady=core.init;