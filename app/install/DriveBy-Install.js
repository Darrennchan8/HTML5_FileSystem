(function(){
	"use strict";
	var root, y, z, resume, newFile, x, queueCheck, queue, deleteAll, error, dataPath, exclusions, dev_build;
	y = 0;
	z = 0;
	dev_build = true;
	if (dev_build) {
		exclusions = [];
		dataPath="../../public/resources.json";
	} else {
		exclusions = ["data","storage"];
		dataPath="https://updater-162a0.firebaseapp.com/resources.json";
	}
	error=function(err){
		alert(err);
		location.reload();
	};
	newFile=function(path,name,data){
		var config={create:true,exclusive:false};
		if(path===""){
			config={create:false,exclusive:false};
		}
		root.getDirectory(path,config,function(name,data,args){
			if(name){
				args.getFile(name,{create:true,exclusive:false},function(newFile){
					newFile.createWriter(function(data,fileContent){
						fileContent.write(new Blob([data],{type:"text/plain; charset=x-user-defined"}));
						setTimeout(function(){
							queue.dequeue();
						},10);
					}.bind(this,data));
				},error);
			}else{
				queue.dequeue();
			}
		}.bind(this,name,data),error);
	};
	deleteAll=function(){
		var dirReader=root.createReader();
		dirReader.readEntries(function(entries){
			var ii, i;
			ii = i = entries.length;
			var _checker=function(){
				ii--;
				if(!ii){
					queue.dequeue();
				}
			}
			while(i--){
				if(entries[i].isDirectory){
					if(exclusions.includes(entries[i].name)){
						_checker();
					}else{
						entries[i].removeRecursively(_checker,error);
					}
				}else{
					entries[i].remove(_checker,error);
				}
			}
			if (ii === 0) {
				queue.dequeue();
			}
		});
	};
	queue={
		current:[],	
		queue:function(){
			this.current.push(arguments);
			z++;
		},
		dequeue:function(){
			if(this.current.length!==0){
				newFile.apply(this,this.current.shift());
			}
			z--;
			if(z==0){
				console.log("done");
				if (!dev_build) {
					window.open("filesystem:"+location.origin+"/persistent/index.html");
				}
			}
		}
	};
	resume=function(){
		if(y==2){
			var data,files;
			data=JSON.parse(x.responseText);
			files=Object.keys(data).sort();
			for(var i=0,ii=files.length;i!=ii;i++){
				if(typeof data[files[i]]=="string"){
					let tmp,path,name;
					tmp=files[i].split("/");
					path=tmp.slice(0,tmp.length-1).join("/");
					name=tmp.slice(tmp.length-1,tmp.length)[0];
					queue.queue(path,name,atob(data[files[i]]));
				}else if(typeof data[files[i]]=="object"){
					queue.queue(files[i],null,null);
				}
			}
			deleteAll();
		}
	};
	x=new XMLHttpRequest();
	x.open("GET",dataPath,true);
	x.addEventListener("load",function(){
		y++;
		resume();
	});
	x.addEventListener("error",error);
	x.send();
	navigator.webkitPersistentStorage.requestQuota(2147483647,function(grantedBytes){
		webkitRequestFileSystem(PERSISTENT,grantedBytes,function(fileSystem){
			root=fileSystem.root;
			y++;
			resume();
		},error);
	},error);
})();