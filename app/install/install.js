(function(){
	"use strict";
	var model,view,controller;
	model={
		init:function(){
			this.space={
				TB:0,
				GB:10,
				MB:0,
				KB:0,
				B:0
			};
			this.messages=[{
				title:"Welcome!",
				message:"This website will install a virtual filesystem onto your computer. Click OK to continue.",
				type:"info"
			},{
				title:"Initializing...",
				message:"To start, we'll need to download the install files first... We'll let you continue after the files are downloaded.",
				type:"load",
				action:controller.action.download
			},{
				title:"Completed!",
				message:"Press OK to continue.",
				type:"info"
			},{
				title:"Waiting...",
				message:"To proceed, you need to grant this website permission to store files on this device. Approximately "+this.getSpace()+" GB is being requested.",
				type:"load",
				action:controller.action.requestFS
			},{
				title:"Permission granted!",
				message:"Click OK to start the installation.",
				type:"info"
			},{
				title:"Installing...",
				message:"Don't interrupt the install process, or you may corrupt data.",
				type:"load",
				action:controller.action.install
			},{
				type:"custom",
				prop:"errCount",
				operation:[{
					comp:function(value){
						if(value===0){
							return true;
						}
						return false;
					},
					return:{
						title:"Final Steps",
						message:"Congratulations! The installation completed without any errors! Press OK to continue.",
						type:"info"
					}
				},{
					comp:function(value){
						if(value===1){
							return true;
						}
						return false;
					},
					return:{
						title:"Final Steps",
						message:"This installation has finished. However, 1 error was encountered. Type 'term' to view log.",
						type:"info"
					}
				},{
					comp:function(value){
						if(value>1){
							return true;
						}
						return false;
					},
					return:{
						title:"Final Steps",
						message:"This installation has finished. However, multiple errors were encountered. Type 'term' to view log.",
						type:"info"
					}
				},]
			},{
				title:"Install Finished",
				message:"Press OK to navigate to webpage.",
				type:"navigate"
			}];
		},
		getMessage:function(stage){
			var message=this.messages[stage];
			if(message.type=="custom"){
				var value=controller.getProp(message.prop);
				for(var i=0,ii=message.operation.length;i!=ii;i++){
					if(message.operation[i].comp(value)){
						return message.operation[i].return;
					}
				}
			}else{
				return message;
			}
		},
		getSpace:function(){
			return Math.round((((this.space.B/1024+this.space.KB)/1024+this.space.MB)/1024+this.space.GB+this.space.TB*1024)*100)/100;
		}
	};
	
	controller={
		init:function(){
			load("notificationTools",function(loaded,details){
				if(loaded){
					model.init();
					view.init();
					this.stage=-1;
					this.nextStage();
				}else{
					secure.stdErr("A problem occured and we need to restart this application.","Details: "+details);
				}
			}.bind(this));
			secure.lockVar("XMLHttpRequest");
		},
		getProp:function(propName){
		},
		nextStage:function(){
			this.stage++;
			var viewStats=model.getMessage(this.stage);
			if(viewStats.type=="info"){
				viewStats.choices=["OK"];
				viewStats.actions=[function(){
					view.notification.dismiss();
					this.nextStage();
				}.bind(this)];
			}else if(viewStats.type=="load"){
				viewStats.action();
			}
			view.pushAlert(viewStats);
		},
		action:{
			download:function(){
				var x=new XMLHttpRequest();
				x.open("GET","resources.json",true);
				x.addEventListener("load",function(){
					console.log(x.responseText);
				});
				x.send();
			},
			requestFS:function(){
			},
			install:function(){
			}
		},
		filesystem:{
		}
	};

	view={
		init:function(){
			this.notification=new notification();
		},
		pushAlert:function(options){
			this.notification.new({
				priority:0,
				dismissable:false,
				title:options.title,
				message:options.message,
				choices:options.choices,
				actions:options.actions
			});
		}
	};
	secure.onStartup(controller.init.bind(controller));
})();