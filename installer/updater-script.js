var directories,allocatedSpace,loadFiles,files,checker,getText;
var load=2;

function updaterScriptDynamic(){
	/*This script is purely meant for downloading installation data. It doesn't actually install anything.

	defPage="Page to open after everything is finished.";

	allocatedSpace={
		TB:(number) size allocation request in Terabytes,
		GB:(number) size allocation request in Gigabytes,
		MB:(number) size allocation request in Megabytes,
		KB:(number) size allocation request in Kilobytes,
		B:(number) size allocation request in bytes,
	};

	directories={
		delete:["Folders","to","delete"],
		create:["Folders","to","create"]
	};

	files={
		create:[{
			name:"Name of new file",
			path:"Location of new file",
			data:"File Contents",
			type:(optional) (default="text/plain")
		},{
			name:"Name of new file",
			path:"Location of new file",
			data:"File Contents",
			type:(optional) (default="text/plain")
		}]
		delete:[{
			name:"Name of file to be deleted",
			path:"Path of file to be deleted"
		},{
			name:"Name of file to be deleted",
			path:"Path of file to be deleted"
		}]
	};

	getText("path/to/url/*",function(xhr){xhr.response=file blob;});

	loadFiles({
		download:"Download location. Use of astrik is required at end.",
		name:"Name to be injected into files.create above.",
		location:"Local download filesystem location",
		inherit:["Use with astriks to inherit the server-side nameing configuration."]
	});*/
	allocatedSpace={
		TB:0,
		GB:10,
		MB:0,
		KB:0,
		B:0
	};
	defPage="filesystem:"+location.protocol+"//"+location.host+"/persistent/index.php";
	directories={
		delete:["system"],
		whitelist:["storage","data"],
		create:["system","data","storage","storage/emulated","system/css","system/fonts","system/plugins","system/res","system/script"]
	};
	files={
		create:[],
		delete:[{
			name:"index.php",
			path:""
		}]
	};
	getText("../resources/index.php",function(xhr){
		let i=files.create.length;
		files.create[i]={
			name:"index.php",
			path:"/",
			data:xhr.response,
			type:"blob"
		};
	});
	loadFiles({
		download:"resources/system/css/*",
		name:"",
		location:"system/css/",
		inherit:["name"],
		type:"blob"
	});
	loadFiles({
		download:"resources/system/fonts/*",
		name:"",
		location:"system/fonts/",
		inherit:["name"],
		type:"blob"
	});
	loadFiles({
		download:"resources/system/plugins/*",
		name:"",
		location:"system/plugins/",
		inherit:["name"],
		type:"blob"
	});
	loadFiles({
		download:"resources/system/res/*",
		name:"",
		location:"system/res/",
		inherit:["name"],
		type:"blob"
	});
	loadFiles({
		download:"resources/system/script/*",
		name:"",
		location:"system/script/",
		inherit:["name"],
		type:"blob"
	});
	load--;
}

function updaterScriptStatic(){
	var loader,command,response,xhr;
	var xhrQueue=[];
	var contents=[];
	var xhrPosition=0;
	var xhrIdle=true;
	var arrayCombo=[];
	var loadFilesPos=0;
	var xhttpIdle=true;
	var loadFilesQueue=[];
	getText=function(url,command){
		if(typeof(url)!="undefined"){
			xhrQueue[xhrQueue.length]=[url,command];
		}
		if(xhrIdle&&xhrPosition!=xhrQueue.length){
			xhrIdle=false;
			tempGetFile(xhrQueue[xhrPosition]);
		}
	}
	tempGetFile=function(arrayCombo){/*DO NOT USE THIS DIRECTLY! YOU WILL OVERWRITE THE REQUESTS! USE getText INSTEAD!*/
		xhr = new XMLHttpRequest();
		xhr.open("GET", arrayCombo[0],true);
		xhr.responseType="blob";
		xhr.onload = function(){
			if (xhr.status == 200){
				good("Successfully downloaded: "+arrayCombo[0]);
				arrayCombo[1].call(this,xhr);
				good("Successfully parsed: "+arrayCombo[0]);
			}else{
				console.error("Error while downloading: "+arrayCombo[0]);
				console.error("Error: "+xhr.status);
			}
			if(xhr.status == 200){
				xhrPosition++;
				xhrIdle=true;
				getText();
			}
		};
		xhr.send();
	}
	loadFiles=function(information){
		var index;
		if(typeof(information)!='undefined'){
			loadFilesQueue[loadFilesQueue.length]=information;
		}
		if(loadFilesQueue[loadFilesPos].download.indexOf("*")==loadFilesQueue[loadFilesPos].download.length-1&&xhttpIdle){
			load++;
			xhttpIdle=false;
			xhttp = new XMLHttpRequest();
			xhttp.open("POST","scandir.php",true);
			xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			xhttp.onreadystatechange=function(){
				if(xhttp.readyState==4){
					contents = rawToArray(xhttp.responseText);
					load--;
					for(index=1;index!=contents[0].length;index++){
						if(loadFilesQueue[loadFilesPos].inherit.indexOf("name")!=-1){
							loadFilesQueue[loadFilesPos].name=getPathName(contents[0][index]);
						}
						load++;
						if(typeof(loadFilesQueue[loadFilesPos].type)=="undefined"||!loadFilesQueue[loadFilesPos].type){
							loadFilesQueue[loadFilesPos].type="text/plain";
						}
						getText(contents[0][0]+contents[0][index],function(name,path,type){
							files.create[files.create.length]={
								name:name,
								path:path,
								type:type,
								data:xhr.response
							};
							load--;
						}.bind(this,loadFilesQueue[loadFilesPos].name,loadFilesQueue[loadFilesPos].location,loadFilesQueue[loadFilesPos].type));
					}
					xhttpIdle=true;
					if(loadFilesPos<loadFilesQueue.length-1){
						loadFilesPos++;
						loadFiles();
					}
				}
			}
			xhttp.send("dir="+loadFilesQueue[loadFilesPos].download.substring(0,loadFilesQueue[loadFilesPos].download.length-2)+"&listDir=true");
		}
	}
	checker=function(){
		if(load==0&&xhrIdle&&xhttpIdle){
			great("All files loaded!!!");
			loaded();
		}else{
			warn(load+" more operations pending...");
			setTimeout(checker,100);
		}
	}
	load--;
}