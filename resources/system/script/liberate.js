/*Offensive Security Precaution
This is not intended to stop devoted, tech-savvy users,
just mindless/malicious script injections,
typically attached with ARP spoofing,
and after seeing what xfinity wifi has done.*/

var secureElements,secureTags,secureTagLoop,secureLoop,secureAnalyzation;
var secureReporter = secureAnalyzationFunction = 0;
function analyze(secureAnalyzation){
	if(secureAnalyzation.indexOf("function ")!=-1){
		secureAnalyzationFunction = secureAnalyzation.substring(secureAnalyzation.indexOf("function ")+9,secureAnalyzation.indexOf("()"));
		secureAnalyzationFunction = secureAnalyzationFunction+"=undefined;";
		eval(secureAnalyzationFunction);
	}
}
function secure(){
	var secureTags = ["script","link","meta","canvas"];
	for(secureTagLoop=0;secureTagLoop!=secureTags.length;secureTagLoop++){
		secureElements = document.getElementsByTagName(secureTags[secureTagLoop]);
		for(secureLoop=0;secureLoop!=secureElements.length;secureLoop++){
			if(secureElements[secureLoop].outerHTML.indexOf("verified")==-1){
				analyze(secureElements[secureLoop].outerHTML);
				secureElements[secureLoop].parentElement.removeChild(secureElements[secureLoop]);
				secureLoop--;
				secureReporter++;
				console.log("Deleted "+secureReporter+" foreign elements.")
			}
		}
	}
}
window.onload = function() {
	secure();
	setInterval(secure,1500);
};