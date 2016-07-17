function notepad(){
	var docContainer,docHeader,docHeaderBack,docHeaderTitle,docBody,docName,saved,collectiveAll;

	newDoc = function(){
		collectiveAll="";
		saved = true;
		hideFABOptions();
		docContainer = document.createElement("div");
		docContainer.setAttribute("id","docContainer");
		docContainer.style.zIndex="3";
		docContainer.style.width="100%";
		docContainer.style.height="100%";
		docContainer.style.top="0px";
		docContainer.style.position="fixed";
		docHeader = document.createElement("div");
		docHeader.style.position="relative";
		docHeader.style.top="0px";
		docHeader.style.width="100%";
		docHeader.style.background="#00BCD4";
		docHeaderBack = document.createElement("img");
		docHeaderBack.setAttribute("src","../res/arrowBackLight.svg");
		docHeaderBack.style.padding="2%";
		docHeaderBack.style.display="inline-block";
		docHeaderBack.style.cursor="pointer";
		docHeaderBack.setAttribute("onclick","exitDoc();");
		docHeaderTitle = document.createElement("input");
		docHeaderTitle.style.background="transparent";
		docHeaderTitle.style.border="none";
		docHeaderTitle.style.display="inline-block";
		docHeaderTitle.style.top="20px";
		docHeaderTitle.style.width="90%";
		docHeaderTitle.style.position="absolute";
		docHeaderTitle.style.color="white";
		docHeaderTitle.style.fontFamily="Roboto";
		docHeaderTitle.style.fontSize="17px";
		docHeaderTitle.setAttribute("placeHolder","Enter File Name...");
		docHeaderTitle.setAttribute("id","docHeaderTitle");
		docHeaderTitle.setAttribute("onkeydown","notepadKey(event)");
		docHeader.appendChild(docHeaderBack);
		docHeader.appendChild(docHeaderTitle);
		removeFABOption("stockEditor");
		pushFAB(["editorSave","#2196F3","../res/saveLight.svg","saveDocument()","horizontal",0]);
		updateFAB();

		docBody = document.createElement("div");
		docBody.style.backgroundColor="white";
		docBody.style.position="relative";
		docBody.style.bottom="0px";
		docBody.style.width="100%";
		docBody.style.height="100%";
		docBody.style.fontFamily="Roboto";
		docBody.setAttribute("id","docBody");
		docBody.setAttribute("contentEditable","");
		docBody.setAttribute("onkeydown","notepadKey(event)");
		docContainer.appendChild(docHeader);
		docContainer.appendChild(docBody);
		document.body.appendChild(docContainer);
	}

	notepadKey=function(event){
		saved = false;
		if(document.getElementById("docHeaderTitle")==document.activeElement){
			if(event.keyCode==13||event.keyCode==9){
				event.preventDefault();
				event.stopPropagation();
				document.getElementById("docHeaderTitle").blur();
				document.getElementById("docBody").focus();
			}
		}else{
			switch(event.keyCode){
				case 9:
					event.preventDefault();
					break;
			}
		}
		if(event.ctrlKey&&event.keyCode==83){
			event.preventDefault();
			saveDocument();
		}
	}

	exitDoc=function(){
		docName = docHeaderTitle.value;
		if(docName==""){
			docName="Untitled";
		}
		if(saved==true){
			forceExitDoc();
		} else {
			notify('Save Changes to "'+docName+'"?','"'+docName+'" has been modified.',["Save","Don't Save","Cancel"],["saveDocument()","forceExitDoc()","dismissAlert()"]);
		}
	}

	forceExitDoc=function(){
		docContainer.parentNode.removeChild(docContainer);
		pushFAB(["stockEditor","#F44336","../res/createLight.svg","newDoc()","vertical",7]);
		removeFABOption("editorSave");
		updateFAB();
		hideFABOptions();
		dismissAlert();
	}

	saveDocument=function(){
		saved = true;
	}

	pushFAB(["stockEditor","#F44336","../res/createLight.svg","newDoc()","vertical",7]);
	updateFAB();
}