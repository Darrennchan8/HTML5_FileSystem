var log,warn,error,good,great,toggleTerminal,hiddenCSS,errorCount;
function logTools(){
	errorCount=0;
	var termLevel=0;
	var termInitialized=false;
	var term=[116,101,114,109,32,45,105];
	var defTerminal=function(arguments){
		var textElement=document.createElement("div");
		textElement.setAttribute("class","termText");
		textElement.innerText=arguments;
		textElement.style.textOverflow="ellipsis";
		textElement.style.overflow="hidden";
		textElement.style.whiteSpace="nowrap";
		textElement.style.fontFamily="Lucida Console,Lucida Sans Typewriter,monaco,Bitstream Vera Sans Mono,monospace";
		document.body.appendChild(textElement);
		try{
			if(document.getElementById("lastElement").getBoundingClientRect().top>=0&&document.getElementById("lastElement").getBoundingClientRect().bottom<=window.innerHeight){
				window.scrollBy(0, 16);
			}
			document.getElementById("lastElement").removeAttribute("id");
		}catch(err){}
		textElement.setAttribute("id","lastElement");
		return textElement;
	}
	log=function(arguments){
		console.log(arguments);
		defTerminal(arguments);
	}
	good=function(arguments){
		console.log(arguments);
		defTerminal(arguments).style.color="green";
	}
	great=function(arguments){
		console.log(arguments);
		defTerminal(arguments).style.backgroundColor="green";
	}
	error=function(arguments){
		errorCount++;
		console.error(arguments);
		defTerminal(arguments).style.backgroundColor="red";
	}
	warn=function(arguments){
		console.warn(arguments);
		defTerminal(arguments).style.backgroundColor="yellow";
	}
	toggleTerminal=function(event){
		if(event.keyCode==term[termLevel]){
			termLevel++
			if(termLevel==4&&!termInitialized){
				document.body.removeChild(hiddenCSS);
				termInitialized=true;
				log("Terminal Initialized!");
			}
			if(termLevel==term.length){
				if(localStorage.getItem("term")=="true"){
					warn("Terminal Installed, Type 'term -u' to uninstall.");
				}else{
					localStorage.setItem("term","true");
					great("Terminal Installed, Type 'term -u' to uninstall.");
				}
			}
		}else{
			termLevel=0;
		}
	}
	if(localStorage.getItem("term")=="true"){
		termInitialized=true;
		warn("Terminal Installed, Type 'term -u' to uninstall.");
	}else{
		hiddenCSS=document.createElement("style");
		hiddenCSS.innerHTML=".termText{visibility:hidden;}";
		document.body.appendChild(hiddenCSS);
	}
	document.body.setAttribute("onkeypress","toggleTerminal(event)");
}
logTools();