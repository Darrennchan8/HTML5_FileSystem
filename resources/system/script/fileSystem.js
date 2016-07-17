'use strict';
var fsError,time,fsLog,fs,fsTools,fsReady;
function fileSystem(){
	var root,getDirPath,getFileName,fsIdle,parsePath,verify,recursiveData,verify2,getParentDir;
	fsIdle=true;
	getDirPath=function(pathName){
		return pathName.substring(0,pathName.lastIndexOf("/"));
	};
	getParentDir=function(pathName){
		return pathName.substring(0,pathName.lastIndexOf("/",pathName.length-1));
	}
	getFileName=function(pathName){
		return pathName.substring(pathName.lastIndexOf("/")+1,pathName.length);
	};
	fsError=function(args){
		if(typeof(args)=="undefined"||!args){
			args="Anonymous Operation Failure";
		}
		console.error(time()+" "+args);
	};
	time=function(){
		var now=new Date(); 
		var year=now.getFullYear();
		var month=now.getMonth()+1; 
		var day=now.getDate();
		var hour=now.getHours();
		var minute=now.getMinutes();
		var second=now.getSeconds(); 
		if(month.toString().length == 1) {
			var month = '0'+month;
		}
		if(day.toString().length == 1) {
			var day = '0'+day;
		}   
		if(hour.toString().length == 1) {
			var hour = '0'+hour;
		}
		if(minute.toString().length == 1) {
			var minute = '0'+minute;
		}
		if(second.toString().length == 1) {
			var second = '0'+second;
		}
		var dateTime = year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second;   
		return dateTime;
	};
	fsLog=function(message){
		if(typeof(message)=="undefined"||!message){
			message="Anonymous Operation Successful";
		}
		console.log(time()+" "+message);
	};
	verify=function(details){
		/*Prestep for calling back '/storage/emulated/' with the spoofed path for security*/
		if(typeof(details)=="string"){
			if(localStorage.getItem("rooted")=="true"){
				return details;
			}else{
				if(details.indexOf("../")!=-1){
					details="";
				}
				if(details.indexOf("/")==0){
					return "/storage/emulated"+details;
				}else{
					return "/storage/emulated/"+details;
				}
			}
		}else{
			new Error("err: string expected but reviced type "+typeof(details)+".",fileSystem.js,51);
		}
	};
	verify2=function(details){
		/*Prestep for callback without nasty '/storage/emulated/'*/
		if(typeof(details)=="string"){
			if(localStorage.getItem("rooted")=="true"||details.indexOf("storage/emulated")==-1){
				return details;
			}else{
				return details.substring(details.indexOf("storage/emulated")+16,details.length);
			}
		}else{
			new Error("err: string expected but reviced type "+typeof(details)+".",fileSystem.js,70);
		}
	};
	fsTools=function(){
		fs={
			/*
			fs.new({
				type:"folder"||"file"||"blob",
				path:"/root/path/to/folder/or/file/",
				name:"(files & blob only) name of file",
				data:"(files & blob only)(optional for files) file contents",
				encoding:"(files only)(optional) default=text/plain",
				callback:function(){}
				//asynchronous
			});
			fs.delete({
				type:"folder"||"file",
				path:"/root/path/to/folder/or/file.txt",
				//asynchronous
			});
			fs.rename({
				type:"folder"||"file",
				path:"/root/path/to/folder/or/file.txt",
				newName:"new name of folder or file",
				callback:function(){} //Optional, returns true on success, and false on error.
				//asynchronous
			})
			fs.exists({
				type:"folder"||"file",
				path:"/root/path/to/folder/or/file/",
				name:"(files only) name of file",
				pass:function(){"success callback"},
				fail:function(){"failure callback"}
				//asynchronous
			});
			fs.scandir({path:"/root/path/to/folder/",callback:function(data){data=={
				folders:[{
					name:"name of folder",
					fullpath:"/root/path/to/folder/"
				},...],
				files:[{
					name:"Name of file",
					type:"txt",
					fullpath:"/root/path/to/folder/file.txt"
				},...],
				parentFolders:["/","firstFolder","secondFolder","etc..."]
				//asynchronous
			}}});
			fs.recursivelyScandir({path:"/root/path/to/folder/",callback:function(data){data=={
				folders:[{
					name:"name of folder",
					fullpath:"/root/path/to/folder/"
				},...],
				files:[{
					name:"Name of file",
					type:"txt",
					fullpath:"/root/path/to/folder/file.txt"
				},...],
				//asynchronous
			}}});
			fs.path({
				type:"file",
				path:"/root/path/to/folder/or/file.txt",
				export:"download"
				//synchronous
			});
			*/
			delete:function(details){
				fsIdle=false;
				if(typeof(details.callback)!="function"){
					details.callback=function(){};
				}
				details.path=verify(details.path);
				if(details.type=="folder"){
					root.getDirectory(details.path,{create:false},function(dir){
						dir.removeRecursively(function(){
							fsLog("fs.delete: Folder deleted.");
							details.callback(true);
						},function(){
							fsError("fs.delete: Folder cannot be deleted.");
							details.callback(false);
						})
				},function(){
					fsError("fs.delete: Folder Path cannot be accessed.");
					details.callback(false);
				})
				}else if(details.type=="file"){
					console.log(details);
					console.log("parentDir: ",getParentDir(details.path));
					console.log("currentDir: ",getFileName(details.path));
					root.getDirectory(getParentDir(details.path),{create:false},function(dir){
						dir.getFile(getFileName(details.path),{create:false},function(file){
							file.remove(function(){
								fsLog("fs.delete: File deleted.");
								if(typeof(details.callback=="function")){
									details.callback(true);
								}
							},function(){
								fsError("fs.delete: File cannot be deleted.");
							})
						},function(){
							fsError("fs.delete: File cannot be accessed.");
						})
					},function(){
						fsError("fs.delete: File Path cannot be accessed.");
					})
				}
			},
			rename:function(data){
				fsIdle=false;
				if(typeof(data.callback)!="function"){
					data.callback=function(){};
				}
				var folderPath;
				data.path=verify(data.path);
				if(data.type=="file"){
					folderPath=getFileName(data.path);
				}else{
					folderPath=data.path;
				}
				if(data.type=="folder"){
					root.getDirectory(data.path,{create:false},function(targetDir){
						fsLog("fs.rename: Successfully retrieved target directory.");
						root.getDirectory(getParentDir(data.path),{create:false},function(parentDir){
							fsLog("fs.rename: Successfully retrieved parent directory.");
							targetDir.moveTo(parentDir,data.newName,function(){
								fsIdle=true;
								fsLog("fs.rename: Successfully renamed file");
								data.callback(true);
							},function(){
								fsError("fs.rename: Unable to rename file.");
								data.callback(false);
							});
						},function(){
							fsIdle=true;
							fsError("fs.rename: Unable to retrieve parent directory.");
							data.callback(false);
						})
					},function(){
						fsIdle=true;
						fsError("fs.rename: Error retrieving target directory.");
						data.callback(false);
					});
				}
			},
			scandir:function(data){
				fsIdle=false;
				data.path=verify(data.path);
				root.getDirectory(data.path,{create:false},function(dir){
					var dirReader=dir.createReader();
					var dirContents={path:data.path,folders:[],files:[]};
					var index=0;
					dirReader.readEntries(function(entries){
						dirContents.parentFolders=verify2(data.path).split("/");
						dirContents.parentFolders[0]="/";
						while(dirContents.parentFolders.indexOf("")!=-1){
							dirContents.parentFolders.splice(dirContents.parentFolders.indexOf(""),1);
						}
						for(var i=0;i!=entries.length;i++){
							if(entries[i].isDirectory){
								dirContents.folders[dirContents.folders.length]={};
								dirContents.folders[dirContents.folders.length-1].fullPath=verify2(entries[i].fullPath);
								dirContents.folders[dirContents.folders.length-1].name=entries[i].fullPath.substring(entries[i].fullPath.lastIndexOf("/")+1,entries[i].fullPath.length);
								index++;
							}
							if(entries[i].isFile){
								dirContents.files[dirContents.files.length]={};
								dirContents.files[dirContents.files.length-1].fullPath=verify2(entries[i].fullPath);
								if(entries[i].fullPath.lastIndexOf("/")<entries[i].fullPath.lastIndexOf(".")){
									dirContents.files[dirContents.files.length-1].name=entries[i].fullPath.substring(entries[i].fullPath.lastIndexOf("/")+1,entries[i].fullPath.lastIndexOf("."));
									dirContents.files[dirContents.files.length-1].type=entries[i].fullPath.substring(entries[i].fullPath.lastIndexOf(".")+1,entries[i].fullPath.length);
								}else{
									dirContents.files[dirContents.files.length-1].name=entries[i].fullPath.substring(entries[i].fullPath.lastIndexOf("/")+1,entries[i].fullPath.length);
									dirContents.files[dirContents.files.length-1].type="";
								}
								index++;
							}
							if(index==entries.length){
								fsIdle=true;
								data.callback(dirContents);
							}
						}
						if(entries.length==0){
							fsIdle=true;
							data.callback(dirContents);
						}
					},function(){
						fsIdle=true;
						fsError("fs.scandir: Error while loading Folder contents.");
					})
				},function(){
					fsIdle=true;
					fsError("fs.scandir: Folder Read Operation Failed.");
				})
			},
			recursivelyScandir:function(data){
				if(typeof(arguments[1])!="boolean"){
					fsIdle=false;
					recursiveData={folders:[{fullPath:data.path}],files:[],scanpos:0,callback:data.callback};
					fs.recursivelyScandir(null,false);
				}else{
					if(recursiveData.folders.length!=recursiveData.scanpos){
						fs.scandir({
							path:recursiveData.folders[recursiveData.scanpos].fullPath,
							callback:function(dat){
								for(let x=0;x!=dat.folders.length;x++){
									recursiveData.folders[recursiveData.folders.length]=dat.folders[x];
								}
								for(let x=0;x!=dat.files.length;x++){
									recursiveData.files[recursiveData.files.length]=dat.files[x];
								}
								recursiveData.scanpos++;
								fs.recursivelyScandir(null,false);
							}
						});
					}else{
						delete recursiveData.scanpos;
						recursiveData.callback(recursiveData);
					}
				}
			},
			exists:function(details){
				fsIdle=false;
				details.path=verify(details.path);
				if(details.type=="folder"){
					root.getDirectory(details.path,{create:false},function(args){
						fsIdle=true;
						details.pass();
					},function(args){
						fsIdle=true;
						details.fail();
					})
				}else if(details.type=="file"){
					root.getDirectory(details.path,{create:false},function(args){
						args.getFile(details.name,{create:false},function(args){
							fsIdle=true;
							details.pass();
						},function(args){
							fsIdle=true;
							details.fail();
						})
					},function(args){
						fsIdle=true;
						details.fail();
					})
				}
			},
			new:function(details){
				fsIdle=false;
				details.path=verify(details.path);
				if(details.type=="folder"){
					root.getDirectory(details.path,{create:true,exclusive:false},function(args){
						fsIdle=true;
						fsLog("fs.new: Folder Creation Operation Successful.");
						if(typeof(details.callback=="function")){
							details.callback(true);
						}
					},function(args){
						fsIdle=true;
						fsError("fs.new: Cannot create folder.");
					});
				}else if(details.type=="blob"){
					root.getDirectory(details.path,{create:true,exclusive:false},function(args){
						fsLog("fs.new: Reference Folder Operation Successful.");
						args.getFile(details.name,{create:true,exclusive:false},function(newFile){
							fsLog("fs.new: File Creation Operation Successful.");
							if(typeof(details.data)=="undefined"||!details.data){
								if(typeof(details.callback=="function")){
									details.callback(true);
								}
								fsIdle=true;
							}else{
								if(typeof(details.encoding)=="undefined"||!details.encoding){
									details.encoding="text/plain";
								}
								newFile.createWriter(function(fileContent){
									var blob=new Blob([details.data],{type:details.encoding});
									fileContent.write(blob);
									fsLog("fs.new: File Write Operation Successful.");
									if(typeof(details.callback=="function")){
										details.callback(true);
									}
								},function(args){
									fsIdle=true;
									fsError("fs.new: File Write Operation Failed.");
								})
							}
						},function(args){fsIdle=true;fsError("fs.new: File cannot be created.");})
					},function(args){fsIdle=true;fsError("fs.new: Cannot access reference folder.");});
				}else if(details.type=="file"){
					root.getDirectory(details.path,{crate:true,exclusive:false},function(args){
						fsLog("fs.new: Reference Folder Operation Successful.");
						args.getFile(details.name,{create:true,exclusive:false},function(newFile){
							fsLog("fs.new: File Creation Operation Successful.");
							newFile.createWriter(function(fileContent){
								fileContent.write(details.data);
								fsLog("fs.new: File Write Operation Successful.");
								if(typeof(details.callback=="function")){
									details.callback(true);
								}
							},function(args){
								fsIdle=true;
								fsError("fs.new: File Write Operation Failed.");
							})
						},function(args){
							fsIdle=true;
							fsError("fs.new: Couldn't Create File");
						})
					},function(args){
						fsIdle=true;
						fsError("fs.new: Couldn't get Reference Folder");
					})
				}
			},
			path:function(fileDetails){
				console.log(fileDetails);
				if(fileDetails.type=="file"){
					if(fileDetails.export="download"){
						fsLog("fs.dlPath: Returned Download Path of File");
						return ".."+verify(fileDetails.path);
					}
				}
			},
			idle:function(){
				return fsIdle;
			}
		}
		if(typeof(fsReady)=="function"){
			fsReady();
		}
	}
	navigator.webkitPersistentStorage.requestQuota(localStorage.getItem("allocatedSpace"),function(grantedBytes){
		window.webkitRequestFileSystem(window.PERSISTENT,grantedBytes,function(fileSystem){
			window.webkitRequestFileSystem=null;
			navigator.webkitPersistentStorage.requestQuota=null;
			navigator.webkitTemporaryStorage.requestQuota=null;
			root=fileSystem.root;
			fsLog("fileSystem.js: File System Initialized.");
			fsLog("fileSystem.js: Starting bootstrap...");
			fsTools();
		},function(){
			fsError("fileSystem.js: Cannot mount File System.");
		});
	},function(){
		fsError("fileSystem.js: Cannot mount File System.");
	});
}
fileSystem();