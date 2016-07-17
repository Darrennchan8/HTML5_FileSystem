'use strict';
var settings;
function options(){
	var plugins;
	settings={
		display:function(){
		},
		plugins:{
			mainPage:function(){
				hamburgerMenu.close();
				ui.header.reset({
					color:"#F44336"
				});
				ui.header.add({
					message:"Plugins Manager",
					onclick:function(){}
				});
				ui.body.reset();
				fab.add({
					priority:50,
					id:"addPlugin",
					color:"#F44336",
					img:"system/res/addLight.svg",
					position:"vertical",
					onclick:settings.plugins.add,
					title:"New Plugin",
				});
				for(let i=0;i!=plugins.length;i++){
					ui.body.add({
						message:"Text to card",
						img:[{
							src:"system/res/pluginDark.svg",
							align:"left"
						}]
					});
				}
			},
			add:function(){
				console.log("add plugin action");
			},
			init:function(){
				plugins=JSON.parse(localStorage.getItem("plugins"));
				for(let i=0;i!=plugins.length;i++){
					let src=document.createElement("script");
					src.setAttribute("src",plugins[i].src);
					document.body.appendChild(src);
				}
			}
		}
	}
	hamburgerMenu.add({
		priority:1000,
		id:null,
		title:"Settings",
		img:"system/res/settingsDark.svg",
		onclick:settings.display,
		position:"bottom",
		unload:function(){}
	},{
		priority:999,
		id:null,
		title:"Plugins",
		img:"system/res/addLight.svg",
		color:"#F44336",
		onclick:settings.plugins.mainPage,
		position:"bottom",
		unload:function(){fab.remove("addPlugin");}
	});
}
options();