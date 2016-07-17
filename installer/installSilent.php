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
		<script>
			var good=great=warn=function(){};
		</script>
		<script verified src="printTools.js"></script>
		<script verified src="mediaTools.js"></script>
		<script verified src="updater-script.js"></script>
		<script verified src="notificationTools.js"></script>
		<script verified>
			var step=1;
			function loaded(){
				if(step==2){
					step=3;
					step3();
				}
				if(step<3){
					setTimeout(loaded,100);
				}
			}
			function step3(){
				step=3;
				start();
			}
			function step4(){
				step=4;
				install();
			}
			function step5(){
				step=5;
			}
			function step6(){
				step=6;
				step7();
			}
			function step7(){
				pushAlert("Install Finished","Press OK to reinstall.","OK","transition()",true,"7");
			}
			function transition(){
				load+=2;
				dismissAlert(7);
				step2();
			}
			function step2(){
				step=2;
				updaterScriptStatic();
				updaterScriptDynamic();
				setTimeout(checker,100);
			}
			step2();
		</script>
		<script verified>
			var deleteFolders,createFolders,onError,root,start;
			function dependencies(){
				var i,get,create,index;
				get={create:false};
				create={create:true,exclusive:false};
				onError=function(arguments){
					index++;
					if(index==i){
						index=0;
						createFolders();
					}
				};
				deleteFolders=function(){
					index=0;
					for(i=0;i!=directories.delete.length;i++){
						root.getDirectory(directories.delete[i],get,function(dirEntry){
							dirEntry.removeRecursively(function(){
								index++;
								if(index==i){
									index=0;
									createFolders();
								}
							},function(arguments){
								index++;
								if(index==i){
									index=0;
									createFolders();
								}
							});
						},function(arguments){
								index++;
								if(index==i){
									index=0;
									createFolders();
								}
							}
						);
					}
				};
				createFolders=function(){
					index=0;
					for(i=0;i!=directories.create.length;i++){
						root.getDirectory(directories.create[i],create,function(dirEntry){
							index++;
							if(index==i){
								index=0;
								createFiles();
							}
						},function(arguments){
							index++;
							if(index==i){
								index=0;
								createFiles();
							}
						});
					}
				};
				createFiles=function(){
					var x=0;
					var createFilesSecondary;
					createFilesSecondary=function(){
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
									x++;
									if(x==files.create.length){
										step6();
									}else{
										createFilesSecondary();
									}
								});
							});
						});
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
				window.webkitRequestFileSystem(window.PERSISTENT,grantedBytes,init,onError);
			};
			start=function(){
				localStorage.setItem("allocatedSpace",((allocatedSpace.TB*1024+allocatedSpace.GB)*1024+allocatedSpace.KB)*1024+allocatedSpace.B);
				navigator.webkitPersistentStorage.requestQuota((((allocatedSpace.TB*1024+allocatedSpace.GB)*1024+allocatedSpace.MB)*1024+allocatedSpace.KB)*1024+allocatedSpace.B,request,function(){});
			};
		</script>
	</body>
</html>