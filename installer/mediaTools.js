/*
	Options: 
		printWrapperAction:
			Set as "" to remove, otherwise set as the text for the action button within the title of cards.
		printOnlyNames:
			Set as a boolean, use false to display the whole name; otherwise, set as true to remove .mp3, or .mp4 from showing up.
*/
/*Supported Presets Listed Below*/
	var audio = ["*.mp3","*.wav","*.flac","*.ape","*.m4a","*.aac","*.wma","*.ogg","*.webm"];
	var video = ["*.webm","*.mkv","*.flv","*.mp4","*.ogg","*.gif","*.avi","*.mov","*.m4v","*.m4p","*.3gp"];
	var all = ["*.*"];
	var windows=["*.exe","*.bat","*.vbs"];
/*End of Supported Presets List*/
var arrayType=[[]];
var arrayName=[[]];
function fileName(array){
	if(typeof(array)=="object"){
		arrayNames=[];
		for (i = array.length - 1; i >= 0; i--) {
			arrayNames[i]=array[i].substring(0,array[i].lastIndexOf("."));
		}
		return arrayNames;
	} else {
		return array.substring(0,array.lastIndexOf("."));
	}
}

function fileType(array){
	if(typeof(array)=="object"){
		arrayTypes=[];
		for (i = array.length - 1; i >= 0; i--) {
			arrayTypes[i]=array[i].substring(array[i].lastIndexOf("."),array[i].length);
		}
		return arrayTypes;
	} else {
		return array.substring(array.lastIndexOf("."),array.length);
	}
}

function findReplace(string,query,replacement){
	if(typeof(replacement)=="undefined"){
		replacement="";
	}
	if(typeof(string)=="string"){
		while(string.indexOf(query)!=-1){
			string=string.substring(0,string.indexOf(query))+replacement+string.substring(string.indexOf(query)+query.length,string.length);
		}
		return string;
	} else {
		for (i = string.length - 1; i >= 0; i--) {
			while(string[i].indexOf(query)!=-1){
				string[i]=string[i].substring(0,string[i].indexOf(query))+replacement+string[i].substring(string[i].indexOf(query)+query.length,string[i].length);
			}
		}
		return string;
	}
}

function filter(master,array){
	function compareList(masterObject,arrayObject){
		for (i = masterObject.length - 1; i >= 0; i--) {
			for (compareIndex = arrayObject.length - 1; compareIndex >= 1; compareIndex--) {
				if(arrayObject[compareIndex].indexOf(masterObject[i])==-1&&masterObject[i].indexOf("*")==-1&&arrayObject[compareIndex].indexOf("*")==-1){
					arrayObject[compareIndex]=arrayObject[compareIndex]+"?";
				} else {
					arrayObject[compareIndex]=findReplace(arrayObject[compareIndex],"?");
					arrayObject[compareIndex]=arrayObject[compareIndex]+"*";
				}
			}
		}
		return findReplace(arrayObject,"*");
	}
	function concatList(l1,l2){
		l3=[];
		for (i = 0; i!=Math.min(l1.length,l2.length); i++) {
			l3[i]=[];
			for (index = 0; index!=Math.min(l1[i].length,l2[i].length); index++) {
				l3[i][index]=l1[i][index]+l2[i][index];
			}
		}
		return l3;
	}
	function checkFilter(arrayCheck){
		for (i = arrayCheck.length - 1; i >= 0; i--) {
			for (index = arrayCheck[i].length - 1; index >= 0; index--) {
				if(arrayCheck[i][index].indexOf("?")>-1){
					arrayCheck[i].splice(index,1);
				}
			}
		};
		return arrayCheck;
	}
	masterType=fileType(master);
	masterName=fileName(master);
	for (var index = array.length - 1; index >= 0; index--) {
		arrayName[index]=fileName(array[index]);
		arrayType[index]=fileType(array[index]);
		arrayType[index]=compareList(masterType,arrayType[index]);
		arrayName[index]=compareList(masterName,arrayName[index]);
	}
	completedList = concatList(arrayName,arrayType);
	return checkFilter(completedList);
}

function rawToArray(string){
	string = string.trim();
	stringArray = string.split(":");
	for (var i = stringArray.length - 1; i >= 0; i--) {
		stringArray[i]=stringArray[i].split("|");
	};
	return stringArray;
}