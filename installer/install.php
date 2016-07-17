<!DOCTYPE html>
<html>
	<head>
		<title>
			Installer
		</title>
		<link verified type="text/css" rel="stylesheet" href="stylesheet.css">
	</head>
	<body>
		<div id="console"></div>
		<script verified src="logTools.js"></script>
		<script verified src="printTools.js"></script>
		<script verified src="mediaTools.js"></script>
		<script verified src="updater-script.js"></script>
		<script verified src="notificationTools.js"></script>
		<script verified>
			var step=1;
			function loaded(){
				if(step==2){
					step=3;
					dismissAlert(2);
					pushAlert("Completed!","Press OK to continue.","OK","step3()",true,"2");
				}
				if(step<3){
					setTimeout(loaded,100);
				}
			}
			function step3(){
				step=3;
				dismissAlert(2);
				pushAlert("Waiting...","To proceed, you need to grant this website permission to store files on this device. Approximately "+Math.round((((allocatedSpace.B/1024+allocatedSpace.KB)/1024+allocatedSpace.MB)/1024+allocatedSpace.GB+allocatedSpace.TB*1024)*100)/100+" GB is being requested.",null,null,true,"3");
				start();
			}
			function step4(){
				step=4;
				dismissAlert(3);
				pushAlert("Permission granted!","Click OK to start the installation.","OK","install()",true,"4");
			}
			function step5(){
				step=5;
				dismissAlert(4);
				pushAlert("Installing...","Don't interrupt the install process, or you may corrupt data.",null,null,true,"5");
			}
			function step6(){
				step=6;
				dismissAlert(5);
				if(errorCount>1){
					pushAlert("Final Steps","This installation has finished. However, "+errorCount+" errors were encountered. Type 'term' to view log.","Confirm","step7()",true,"6");
				}else if(errorCount==1){
					pushAlert("Final Steps","This installation has finished. However, 1 error was encountered. Type 'term' to view log.","Confirm","step7()",true,"6");
				}else{
					pushAlert("Final Steps","Congratulations! The installation completed without any errors! Press OK to continue.","OK","step7()",true,"6");
				}
			}
			function step7(){
				dismissAlert(6);
				pushAlert("Install Finished","Press OK to navigate to webpage.","OK","location.href=defPage",true,"7");
			}
			function step2(){
				step=2;
				dismissAlert(1);
				pushAlert("Initializing...","To start, we'll need to download the install files first... We'll let you continue after the files are downloaded.",null,null,true,"2");
				updaterScriptStatic();
				updaterScriptDynamic();
				setTimeout(checker,100);
			}
			pushAlert("Welcome!","This website will install a virtual filesystem onto your computer. Click OK to continue.","OK","step2()",true,"1");
		</script>
		<script verified>
			var deleteFolders,createFolders,onError,root,start;
			function dependencies(){
				var i,get,create,index;
				get={create:false};
				create={create:true,exclusive:false};
				onError=function(args){
					error('Error: ',args);
					warn("Continuing anyways...");
					index++;
					if(index==i){
						index=0;
						createFolders();
						great("Obsolete Files Removed!");
					}
				};
				deleteFolders=function(){
					log("Deleting Folders...");
					index=0;
					for(i=0;i!=directories.delete.length;i++){
						root.getDirectory(directories.delete[i],get,function(dirEntry){
							dirEntry.removeRecursively(function(){
								log("Folder "+dirEntry.name+" Deleted.");
								index++;
								if(index==i){
									index=0;
									createFolders();
									great("Obsolete Folders Removed!");
								}
							},function(args){
								index++;
								error(args.message);
								error("Folder "+dirEntry.name+" could not be deleted.");
								warn("Continuing anyways...");
								if(index==i){
									index=0;
									createFolders();
									great("Obsolete Files Removed!");
								}
							});
						},function(args){
								index++;
								warn(args.message);
								warn("Folder "+directories.delete[i]+" could not be deleted.");
								warn("The folder may already have been deleted.");
								warn("Continuing anyways...");
								if(index==i){
									index=0;
									great("Obsolete Folders Removed!");
									createFolders();
								}
							}
						);
					}
				};
				deleteFiles=function(){
					var index=0;
					log("Removing Obsolete Files...");
					for(let i=0,ii=files.delete.length;i!=ii;i++){
						root.getDirectory(files.delete[i].path,{create:false},function(refPath){
							refPath.getFile(files.delete[i].name,{create:false},function(file){
								file.remove(function(){
									index++;
									good("File Deleted.");
									if(index==ii){
										great("Obsolete Files Removed!");
										createFiles();
									}
								},function(){
									index++;
									warn("Couldn't delete file, continuing anyways...");
									if(index==ii){
										great("Obsolete Files Removed!");
										createFiles();
									}
								});
							},function(){
								index++;
								warn(arguments[0].message);
								warn("Couldn't get reference file, continuing anyways...");
								if(index==ii){
									great("Obsolete Files Removed!");
									createFiles();
								}
							})
						},function(){
							index++;
							warn(arguments[0].message);
							warn("Couldn't get reference path, continuing anyways...");
							if(index==ii){
								great("Obsolete Files Removed!");
								createFiles();
							}
						})
					}
				}
				createFolders=function(){
					log("Creating Folders...");
					index=0;
					for(i=0;i!=directories.create.length;i++){
						root.getDirectory(directories.create[i],create,function(dirEntry){
							log("Folder "+dirEntry.name+" Created.");
							index++;
							if(index==i){
								index=0;
								great("New Folders Created!");
								deleteFiles();
							}
						},function(args){
							index++;
							error(args.message);
							warn("Continuing anyways...");
							if(index==i){
								index=0;
								great("New Folders Created!");
								deleteFiles();
							}
						});
					}
				};
				createFiles=function(){
					log("Creating Files...");
					var x=0;
					var createFilesSecondary;
					createFilesSecondary=function(){
						console.log(files.create[x].path);
						root.getDirectory(files.create[x].path,get,function(targetDirectory){
							targetDirectory.getFile(window.files.create[x].name,create,function(newFile){
								newFile.createWriter(function(fileContent){
									if(typeof(window.files.create[x].type)=="undefined"||!window.files.create[x].type){
										window.files.create[x].type="text/plain";
									}
									if(typeof(window.files.create[x].type)!="blob"){
										var blob=new Blob([window.files.create[x].data],{type:window.files.create[x].type});
									}else{
										var blob=window.files.create[x].data;
									}
									fileContent.write(blob);
									good("File write:"+window.files.create[x].path+window.files.create[x].name);
									x++;
									if(x==files.create.length){
										great("File write operation complete!");
										step6();
									}else{
										createFilesSecondary();
									}
								},function(err){error("createFiles.error Write: "+err.message);});
							},function(err){error("createFiles.error file: "+err.message);});
						},function(err){error("createFiles.error folder: "+err.message);});
					}
					createFilesSecondary();
				};
			}
			dependencies();
			function init(fs){
				root=fs.root;
				step4();
			}
			function install(){
				step5();
				deleteFolders();
			}
			request=function(grantedBytes){
				good(arguments[0]+" Bytes Granted!");
				window.webkitRequestFileSystem(window.PERSISTENT,grantedBytes,init,onError);
			};
			start=function(){
				localStorage.setItem("allocatedSpace",((allocatedSpace.TB*1024+allocatedSpace.GB)*1024+allocatedSpace.KB)*1024+allocatedSpace.B);
				navigator.webkitPersistentStorage.requestQuota((((allocatedSpace.TB*1024+allocatedSpace.GB)*1024+allocatedSpace.MB)*1024+allocatedSpace.KB)*1024+allocatedSpace.B,request,function(err){error("FATAL: "+err.message);});
			};
		</script>
	</body>
</html>