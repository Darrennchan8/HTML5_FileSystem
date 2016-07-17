'use strict';
/*
* This  is  the file Manager core, which everything used to
* be built around.  The  main  functions  that  users  will 
* directly call upon with are navigate, newFile, newFolder,
* invokeUpload, and open.  fileManager.rename  should  have
* the request parameter set as an  object,  with  the  keys
* containing type:"file"||"folder", and fullPath, a string.
*/
var fileManager;
function fileManagerCore(){
	var overlay;
	fileManager={
		stopProp:function(event){
			event.stopPropagation();
		},
		navigate:function(path){
			localStorage.setItem("currentPath",path);
			fs.scandir({
				path:localStorage.getItem("currentPath"),
				callback:fileManager.setUI
			});
		},
		refresh:function(){
			ui.contextMenu.remove();
			fileManager.navigate(localStorage.getItem("currentPath"));
		},
		newFile:function(){
			fs.new({
				type:"blob",
				path:localStorage.getItem("currentPath"),
				name:prompt("Name of New File"),
				callback:fileManager.refresh
			});
		},
		newFolder:function(){
			fs.new({
				type:"folder",
				path:localStorage.getItem("currentPath")+"/"+prompt("Name of New Folder"),
				callback:fileManager.refresh
			});
		},
		rename:function(data){
			let name=prompt("New Name:");
			fs.rename({
				path:data.fullPath,
				type:data.type,
				newName:name,
				callback:fileManager.refresh
			});
		},
		init:function(){
			hamburgerMenu.close();
			fab.add({
				priority:8,
				id:"stockUpload",
				color:"#00BCD4",
				img:"system/res/upload.svg",
				position:"vertical",
				onclick:fileManager.invokeUpload,
				title:"Upload"
			},{
				priority:7,
				id:"newFile",
				color:"#00BCD4",
				img:"system/res/newFileLight.svg",
				position:"vertical",
				onclick:fileManager.newFile,
				title:"New File"
			},{
				priority:6,
				id:"newFolder",
				color:"#00BCD4",
				img:"system/res/newFolderLight.svg",
				position:"vertical",
				onclick:fileManager.newFolder,
				title:"New Folder"
			});
			fileManager.navigate("/");
		},
		invokeUpload:function(){
			let uploadForm = document.createElement("input");
			uploadForm.setAttribute("type","file");
			uploadForm.setAttribute("multiple","");
			uploadForm.addEventListener("change",function(){fileManager.uploadFiles(this.files)});
			uploadForm.style.display="none";
			document.body.appendChild(uploadForm);
			uploadForm.click();
			document.body.removeChild(uploadForm);
		},
		uploadFiles:function(files){
			for(let i=0;i!=files.length;i++){
				fs.new({
					type:"file",
					path:localStorage.getItem("currentPath"),
					name:files[i].name,
					data:files[i],
					callback:function(){fileManager.refresh;}
				});
			}
		},
		download:function(fileName){
			let tempLink = document.createElement("a");
			tempLink.href = fs.path({type:"file",path:fileName.fullPath,export:"download"});
			tempLink.setAttribute("download","");
			tempLink.style.display="none";
			document.body.appendChild(tempLink);
			tempLink.click();
			tempLink.parentNode.removeChild(tempLink);
			fileManager.requestChooser(null);
		},
		setUI:function(folderContents){
			ui.header.reset();
			var path="";
			for(let index=0;index!=folderContents.parentFolders.length;index++){
				path+=folderContents.parentFolders[index];
				if(index!=0){
					path+="/";
				}
				ui.header.add({
					message:folderContents.parentFolders[index],
					onclick:fileManager.navigate.bind(this,path)
				});
				ui.header.add({message:">"});
			}
			ui.body.reset();
			for(let index=0;index!=folderContents.folders.length;index++){
				ui.body.add({
					message:folderContents.folders[index].name,
					onclick:fileManager.navigate.bind(this,folderContents.folders[index].fullPath),
					img:[{
						src:"system/res/folder.svg",
						align:"left"
					},{
						src:"system/res/moreDark.svg",
						align:"right",
						visible:"hover",
						onclick:function(params,e){
							e.target.style.opacity="1";
							let y=e.target.offsetTop+e.target.offsetHeight/2+54-window.scrollY;
							let x=e.target.offsetLeft+e.target.offsetWidth/2-window.scrollX;
							ui.contextMenu.add({
								x:x,
								y:y,
								items:[{
									message:"Rename",
									img:"system/res/editDark.svg",
									onclick:fileManager.rename.bind(this,{
										fullPath:params,
										type:"folder"
									})
								},{
									message:"Delete",
									img:"system/res/deleteFolderDark.svg",
									onclick:fs.delete.bind(null,{
										type:"folder",
										path:params,
										callback:fileManager.refresh
									})
								}]
							});
						}.bind(null,folderContents.folders[index].fullPath)
					}]
				});
			}
			for(let index=0;index!=folderContents.files.length;index++){
				if(folderContents.files[index].type.length!=0){
					folderContents.files[index].type="."+folderContents.files[index].type;
				}
				ui.body.add({
					message:folderContents.files[index].name+folderContents.files[index].type,
					onclick:fileManager.open.bind(folderContents.files[index]),
					img:[{
						src:"system/res/file.svg",
						align:"left"
					},{
						src:"system/res/moreDark.svg",
						align:"right",
						visible:"hover",
						onclick:function(params,e){
							e.target.style.opacity="1";
							let y=e.target.offsetTop+e.target.offsetHeight/2+54-window.scrollY;
							let x=e.target.offsetLeft+e.target.offsetWidth/2-window.scrollX;
							ui.contextMenu.add({
								x:x,
								y:y,
								items:[{
									message:"Rename",
									img:"system/res/editDark.svg",
									onclick:fileManager.rename.bind(this,{
										fullPath:params,
										type:"file"
									})
								},{
									message:"Delete",
									img:"system/res/deleteFileDark.svg",
									onclick:fs.delete.bind(null,{
										type:"file",
										path:params,
										callback:fileManager.refresh
									})
								}]
							});
						}.bind(null,folderContents.files[index].fullPath)
					}]
				});
			}
		},
		open:function(fileInfo){
			let possibleActions = [];
			possibleActions[possibleActions.length]={
				title:"Download",
				onclick:fileManager.download.bind(null,fileInfo),
				img:"system/res/downloadDark.svg"
			};
			if(audio.indexOf(fileInfo.type)!=-1){
				possibleActions[possibleActions.length]={
					title:"Play Audio",
					onclick:integratedPlayer.audio.open.bind(null,fileInfo),
					img:"system/res/audioFileBlack.svg"
				};
			}
			if(video.indexOf(fileInfo.type)!=-1){
				possibleActions[possibleActions.length]={
					title:"Play Video",
					onclick:integratedPlayer.video.open(null,fileInfo),
					img:"system/res/videoDark.svg"
				};
			}
			fileManager.requestChooser(possibleActions);
		},
		requestChooser:function(actions){
			if(Array.isArray(actions)){
				let requestCard,recommended,recommendedTitle,recommendedContent,recommendedContextImage,recommendedContentText;
				overlay=document.createElement("div");
				overlay.setAttribute("class","overlay");
				requestCard = document.createElement("div");
				requestCard.setAttribute("class","requestCard");
				overlay.addEventListener("click",fileManager.requestChooser);
				overlay.style.zIndex=5;
				requestCard.setAttribute("onclick","fileManager.stopProp(event)");
				recommended = document.createElement("div");
				recommended.setAttribute("class","recommended");
				recommendedTitle = document.createElement("div");
				recommendedTitle.innerHTML="Recommended";
				recommendedTitle.setAttribute("class","recommendedTitle");
				recommended.appendChild(recommendedTitle);
				requestCard.appendChild(recommended);
				document.body.style.overflow="hidden";
				for(let i = 0; i!=actions.length; i++){
					recommendedContent = document.createElement("div");
					recommendedContent.addEventListener("click",actions[i].onclick);
					recommendedContent.setAttribute("class","recommendedContent");
					recommendedContextImage = document.createElement("img");
					recommendedContextImage.src=actions[i].img;
					recommendedContextImage.setAttribute("class","recommendedContentAction");
					recommendedContent.appendChild(recommendedContextImage);
					recommendedContentText = document.createElement("div");
					recommendedContentText.innerHTML=actions[i].title;
					recommendedContentText.setAttribute("class","recommendedContentText");
					recommendedContent.appendChild(recommendedContentText);
					requestCard.appendChild(recommendedContent);
				}
				overlay.appendChild(requestCard);
				document.body.appendChild(overlay);
			} else {
				document.body.style.overflow="auto";
				document.body.removeChild(overlay);
				overlay=undefined;
			}
		}
	}
	fab.add({
		priority:8,
		id:"stockUpload",
		color:"#00BCD4",
		img:"system/res/upload.svg",
		position:"vertical",
		onclick:fileManager.invokeUpload,
		title:"Upload"
	},{
		priority:7,
		id:"newFile",
		color:"#00BCD4",
		img:"system/res/newFileLight.svg",
		position:"vertical",
		onclick:fileManager.newFile,
		title:"New File"
	},{
		priority:6,
		id:"newFolder",
		color:"#00BCD4",
		img:"system/res/newFolderLight.svg",
		position:"vertical",
		onclick:fileManager.newFolder,
		title:"New Folder"
	});
	hamburgerMenu.add({
		priority:5,
		id:"stockHome",
		title:"Home",
		img:"system/res/homeLight.svg",
		onclick:fileManager.init,
		color:"#2196F3",
		unload:function(){fab.remove("newFile","newFolder","stockUpload");}
	});
}
fileManagerCore();