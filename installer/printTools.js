/*
	Options: 
		fullPath:
			Boolean. Prints out a clickable full path on the tile bar. Recommended for file mangers.
		hamburgerMenu:
			Boolean. Prints out a hamburger Menu if you have one defined.
*/
var resetPrintTools,getPathName,print,addFirst;
function printTools(){
	var testAllLoop = i = 0;
	var tempArray = paths = array = [];
	var tempString = path = "";
	var playlistSection = printSection = -1;
	var wrapperElement,wrapperHeader,wrapperElementHeader,wrapperElementHeaderShuffle,wrapperElementHeaderText,cardElement,textNode,textNodeShuffle,cardText,title,printLink,getBetween,instancesOf,printNewSection,destroyEmpty,appendAction,remove,element,subElement,defaultOptions;

	defaultOptions = function(){
		if(typeof(hamburgerMenu)=="undefined"||!hamburgerMenu){
			hamburgerMenu=false;
		}
		if(typeof(fullPath)=="undefined"||!fullPath){
			fullPath=false;
		}
	}

	resetPrintTools = function(){
		testAllLoop = i = 0;
		tempArray = paths = array = [];
		tempString = path = "";
		playlistSection = printSection = -1;
		wrapperElement = wrapperHeader = wrapperElementHeader = wrapperElementHeaderShuffle = wrapperElementHeaderText = cardElement = textNode = textNodeShuffle = cardText = null;
		while (document.getElementById("placer").firstChild) {
	    	document.getElementById("placer").removeChild(document.getElementById("placer").firstChild);
		}
	}

	addFirst = function(element,subElement){
		element.insertBefore(subElement,element.childNodes[0]);
	}

	printLink=function(tempString){
		cardElement = document.createElement("div");
		//appendAction(cardElement,"download"+paths+tempString);
		if(tempString.substring(tempString.length-1,tempString.length)=="/"){
			appendAction(cardElement,"folder");
		} else {
			appendAction(cardElement,"file");
		}
		cardText = document.createElement("p");
		cardText.setAttribute("class","cardText")
		if (typeof printOnlyNames !== "undefined") {
	    	if(printOnlyNames==true){
				textNode = document.createTextNode(fileName(tempString));
			} else {
				if(tempString.substring(tempString.length-1,tempString.length)=="/"){
					textNode = document.createTextNode(tempString.substring(0,tempString.length-1));
				} else {
					textNode = document.createTextNode(tempString);
				}
			}
		}
		if (typeof cardStyle !== "undefined") {
			if(cardStyle=="full"){
				cardElement.setAttribute("class", "fullCard");
			} else if(cardStyle=="long"){
				cardElement.setAttribute("class", "longCard")
			} else {
				cardElement.setAttribute("class", cardStyle);
			}
		} else {
			cardElement.setAttribute("class", "longCard");
		}
		cardElement.setAttribute("onclick", "openf("+playlistSection+","+i+")");
		cardText.appendChild(textNode);
		cardElement.appendChild(cardText);
		document.getElementsByClassName("fullWrapper")[printSection].appendChild(cardElement);
	}

	getPathName = function(path){
		return path.substring(path.lastIndexOf("/",path.length-2)+1,path.length);
	}

	instancesOf=function(string,subString){
		counter=0;
		counterIndex=0;
		while(string.indexOf(subString,counterIndex)!=-1){
			counter++;
			counterIndex=string.indexOf(subString,counterIndex)+subString.length;
		}
		return counter;
	}

	getBetween=function(string,subString,start,end){
		string = string;
		getBetweenOutput=[];
		getBetweenIndex=0;
		getBetweenIndex2=0;
		while(string.indexOf(subString,getBetweenIndex2)!=-1){
			getBetweenOutput[getBetweenIndex]=string.indexOf(subString,getBetweenIndex2);
			getBetweenIndex2 = string.indexOf(subString,getBetweenIndex2)+1;
			getBetweenIndex++;
		}
		getBetweenOutput[getBetweenOutput.length]=string.length;
		return string.substring(getBetweenOutput[start],getBetweenOutput[end]);
	}

	printNewSection=function(paths){
		printSection++;
		playlistSection++;
		wrapperElement = document.createElement("div");
		wrapperElement.setAttribute("class", "fullWrapper");
		wrapperElementHeader = document.createElement("header");
		wrapperElementHeader.setAttribute("class", "wrapperHeader");
		if(hamburgerMenu){
			wrapperElementHeader.appendChild(newHamburgerMenu());
		}
		if(fullPath==false){
			wrapperElementHeaderText = document.createElement("p");
			textNode = document.createTextNode(getPathName(paths));
			wrapperElementHeaderText.appendChild(textNode);
			wrapperElementHeaderText.setAttribute("class", "wrapperHeaderTitle");
			wrapperElementHeader.appendChild(wrapperElementHeaderText);
		} else {
			counter=instancesOf(paths,"/");
			wrapperElementHeaderText = document.createElement("div");
			textNode = document.createTextNode("/");
			wrapperElementHeaderText.appendChild(textNode);
			wrapperElementHeaderText.setAttribute("onclick","navigate('/')");
			wrapperElementHeaderText.setAttribute("class","wrapperHeaderTitleClickable");
			wrapperElementHeader.appendChild(wrapperElementHeaderText);
			for(index=0;index!=counter;index++){
				wrapperElementHeaderText = document.createElement("p");
				textNode = document.createTextNode(">");
				wrapperElementHeaderText.appendChild(textNode);
				wrapperElementHeaderText.setAttribute("class","wrapperHeaderTitle");
				wrapperElementHeader.appendChild(wrapperElementHeaderText);
				wrapperElementHeaderText = document.createElement("div");
				title = getBetween(paths,"/",index,index+1);
				wrapperElementHeaderText.innerText=title.substring(1,title.length);
				wrapperElementHeaderText.setAttribute("onclick","navigate('"+getBetween(paths,"/",0,index+1)+"/')");
				wrapperElementHeaderText.setAttribute("class","wrapperHeaderTitleClickable");
				wrapperElementHeader.appendChild(wrapperElementHeaderText);
			}
		}
		if(printWrapperAction!=false){
			wrapperElementHeaderShuffle = document.createElement("p");
			textNodeShuffle = document.createTextNode(printWrapperAction);
			wrapperElementHeaderShuffle.appendChild(textNodeShuffle);
			wrapperElementHeaderShuffle.setAttribute("class", "wrapperHeaderShuffle");
			wrapperElementHeaderShuffle.setAttribute("onclick", "document.getElementById('playbackMode').innerHTML='random"+playlistSection+"';audioPlaybackHandler();");
			wrapperElementHeader.appendChild(wrapperElementHeaderShuffle);
		}
		document.body.appendChild(wrapperElementHeader);
		document.getElementById("placer").appendChild(wrapperElement);
	}

	destroyEmpty=function(){
		if(wrapperElement.childNodes[0].innerText==""){
		document.getElementById("placer").removeChild(wrapperElement);
		printSection--;
		}
	}

	appendAction=function(parent,action){
		if(action.indexOf("download")!=-1){
			newObject = document.createElement("img");
			newObject.src="../res/downloadDark.svg";
			newObject.setAttribute("class","actionLeft");
			newObject.setAttribute("onclick","download("+action.substring(8,action.length)+")");
			parent.appendChild(newObject);
		}
		if(action.indexOf("folder")!=-1){
			newObject = document.createElement("img");
			newObject.src="../res/folder.svg";
			newObject.setAttribute("class","actionLeft");
			parent.appendChild(newObject);
		}
		if(action.indexOf("file")!=-1){
			newObject = document.createElement("img");
			newObject.src="../res/file.svg";
			newObject.setAttribute("class","actionLeft");
			parent.appendChild(newObject);
		}
	}

	remove=function(parent, child){
		parent.removeChild(parent.childNodes[child]);
	}

	print=function(array){
		for (testAllLoop=0; testAllLoop!=array.length; testAllLoop++) {
			printNewSection(array[testAllLoop][0]);
			for(i=1;i!=array[testAllLoop].length;i++){
				printLink(array[testAllLoop][i]);
			}
			destroyEmpty();
		}
	}
}
printTools();