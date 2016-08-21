loadingScreen.setMessage("File Loaded!");
loadingScreen.setPercentage(25);
(function(){
	"use strict";
	var root,getFileName,recursiveData,getParentDir,fsLog,fsError;
	getParentDir=function(pathName){
		return pathName.substring(0,pathName.lastIndexOf("/",pathName.length-1));
	};
	getFileName=function(pathName){
		return pathName.substring(pathName.lastIndexOf("/")+1,pathName.length);
	};
	fsError=function(message,err){
		console.error(Math.round(performance.now())+" "+message||"Anonymous Operation Failed","Details: ",err);
	};
	fsLog=function(message){
		console.log(Math.round(performance.now())+" "+message||"Anonymous Operation Success");
	};
	window.fs={
		delete:function(details){
			if(typeof(details.callback)!="function"){
				details.callback=function(){};
			}
			details.path=details.path;
			if(details.type=="folder"){
				root.getDirectory(details.path,{create:false},function(dir){
					dir.removeRecursively(function(){
						fsLog("fs.delete: Folder deleted.");
						details.callback(true);
					},function(){
						fsError("fs.delete: Folder cannot be deleted.");
						details.callback(false);
					});
				},function(){
					fsError("fs.delete: Folder Path cannot be accessed.");
					details.callback(false);
				});
			}else if(details.type=="file"){
				root.getDirectory(getParentDir(details.path),{create:false},function(dir){
					dir.getFile(getFileName(details.path),{create:false},function(file){
						file.remove(function(){
							fsLog("fs.delete: File deleted.");
							if(typeof(details.callback=="function")){
								details.callback(true);
							}
						},function(){
							fsError("fs.delete: File cannot be deleted.");
						});
					},function(){
						fsError("fs.delete: File cannot be accessed.");
					});
				},function(){
					fsError("fs.delete: File Path cannot be accessed.");
				});
			}
		},
		rename:function(data){
			if(typeof(data.callback)!="function"){
				data.callback=function(){};
			}
			var folderPath;
			data.path=data.path;
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
							fsLog("fs.rename: Successfully renamed file");
							data.callback(true);
						},function(){
							fsError("fs.rename: Unable to rename file.");
							data.callback(false);
						});
					},function(){
						fsError("fs.rename: Unable to retrieve parent directory.");
						data.callback(false);
					});
				},function(){
					fsError("fs.rename: Error retrieving target directory.");
					data.callback(false);
				});
			}
		},
		scandir:function(data){
			data.path=data.path;
			root.getDirectory(data.path,{create:false},function(dir){
				var dirReader=dir.createReader();
				var dirContents={path:data.path,folders:[],files:[]};
				var index=0;
				dirReader.readEntries(function(entries){
					dirContents.parentFolders=data.path.split("/");
					dirContents.parentFolders[0]="/";
					while(dirContents.parentFolders.indexOf("")!=-1){
						dirContents.parentFolders.splice(dirContents.parentFolders.indexOf(""),1);
					}
					for(var i=0;i!=entries.length;i++){
						if(entries[i].isDirectory){
							dirContents.folders.push({
								fullPath:entries[i].fullPath,
								name:entries[i].fullPath.substring(entries[i].fullPath.lastIndexOf("/")+1,entries[i].fullPath.length)
							});
							index++;
						}
						if(entries[i].isFile){
							dirContents.files.push({
								fullPath:entries[i].fullPath
							});
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
							data.callback(dirContents);
						}
					}
					if(entries.length===0){
						data.callback(dirContents);
					}
				},function(){
					fsError("fs.scandir: Error while loading Folder contents.");
				});
			},function(){
				fsError("fs.scandir: Folder Read Operation Failed.");
			});
		},
		recursivelyScandir:function(data){
			if(typeof(arguments[1])!="boolean"){
				recursiveData={
					folders:[{
						fullPath:data.path
					}],
					files:[],
					scanpos:0,
					callback:data.callback
				};
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
			details.path=details.path;
			if(details.type=="folder"){
				root.getDirectory(details.path,{create:false},function(args){
					details.pass();
				},function(args){
					details.fail();
				});
			}else if(details.type=="file"){
				root.getDirectory(details.path,{create:false},function(args){
					args.getFile(details.name,{create:false},function(args){
						details.pass();
					},function(args){
						details.fail();
					});
				},function(args){
					details.fail();
				});
			}
		},
		new:function(details){
			details.path=details.path;
			if(details.type=="folder"){
				root.getDirectory(details.path,{create:true,exclusive:false},function(args){
					fsLog("fs.new: Folder Creation Operation Successful.");
					if(typeof(details.callback=="function")){
						details.callback(true);
					}
				},function(args){
					fsError("fs.new: Cannot create folder.");
				});
			}else if(details.type=="file"){
				root.getDirectory(details.path,{create:true,exclusive:false},function(args){
					fsLog("fs.new: Reference Folder Operation Successful.");
					args.getFile(details.name,{create:true,exclusive:false},function(newFile){
						fsLog("fs.new: File Creation Operation Successful.");
						if(typeof(details.data)=="undefined"||!details.data){
							if(details.callback){
								details.callback(true);
							}
						}else{
							if(!details.encoding){
								details.encoding="text/plain";
							}
							newFile.createWriter(function(fileContent){
								var blob=new Blob([details.data],{type:details.encoding});
								fileContent.write(blob);
								fsLog("fs.new: File Write Operation Successful.");
								if(details.callback){
									details.callback(true);
								}
							},function(args){
								fsError("fs.new: File Write Operation Failed.");
							});
						}
					},function(args){
						fsError("fs.new: File cannot be created.");
					});
				},function(args){
					fsError("fs.new: Cannot access reference folder.");
				});
			}else if(details.type=="blob"){
				root.getDirectory(details.path,{create:true,exclusive:false},function(args){
					fsLog("fs.new: Reference Folder Operation Successful.");
					args.getFile(details.name,{create:true,exclusive:false},function(newFile){
						fsLog("fs.new: File Creation Operation Successful.");
						newFile.createWriter(function(fileContent){
							fileContent.write(details.data);
							fsLog("fs.new: File Write Operation Successful.");
							if(details.callback){
								details.callback(true);
							}
						},function(args){
							fsError("fs.new: File Write Operation Failed.");
						});
					},function(args){
						fsError("fs.new: Couldn't Create File");
					});
				},function(args){
					fsError("fs.new: Couldn't get Reference Folder");
				});
			}
		},
		path:function(fileDetails){
			if(!fileDetails){
				throw new Error("missing code");
			}else if(fileDetails.type=="file"){
				if(fileDetails.export=="download"){
					fsLog("fs.dlPath: Returned Download Path of File");
					return ".."+fileDetails.path;
				}else if(fileDetails.export=="full"){
					fsLog("fs.dlPath: Returned Full Path of File");
					return "filesystem:"+location.origin+"/persistent"+fileDetails.path;
				}
			}
		},
		tmpFile:function(data, callback){
			var randName = crypto.getRandomValues(new Uint32Array(10)).toString();
			fs.new({
				type: "file",
				path: "/tmp/",
				name: randName,
				data: data,
				callback: callback.bind(this, fs.path({
					type: "file",
					export: "full",
					path: "/tmp/" + randName
				}))
			});
		}
	};
	navigator.webkitPersistentStorage.requestQuota(10*1024*1024*1024,function(grantedBytes){
		webkitRequestFileSystem(PERSISTENT,grantedBytes,function(fileSystem){
			loadingScreen.setMessage("FileSystem Initialized!");
			loadingScreen.setPercentage(100);
			root=fileSystem.root;
			fsLog("fileSystem.js: File System Initialized.");
		},function(err){
			fsError("fileSystem.js: Cannot get File System.",err);
		});
	},function(err){
		fsError("fileSystem.js: Cannot request File System.",err);
	});
	loadingScreen.setMessage("File Parsed!");
	loadingScreen.setPercentage(50);
})();