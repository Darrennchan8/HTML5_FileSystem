alertCardOverlay = document.createElement("div");
alertCardOverlay.setAttribute("class","overlay");
alertCardOverlay.style.zIndex="6";
alertCard = document.createElement("div");
alertCard.setAttribute("class","alertCard");
alertCard.style.zIndex="7";
alertCardText=document.createElement("p");
alertCardText.innerText="Loading...";
alertCard.appendChild(alertCardText);
alertCardOverlay.appendChild(alertCard);
document.body.appendChild(alertCardOverlay);

function pageLoadTest(){
	if(document.readyState=="complete"){
		removeLoading();
	} else {
		setTimeout(pageLoadTest,10);
	}
}

function notify(){}

function invokeLoading(){
	alertCardOverlay.style.display="block";
}

function removeLoading(){
	alertCardOverlay.style.display="none";
}

invokeLoading();
pageLoadTest();