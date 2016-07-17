var pushAlert,notifyPrompt,dismissAlert;
function notificationTools(){
	var alertCardOverlay,alertCardText,alertCard,message,choices,i,alertCardOptions,alertCardOptionsText,title,actions,alertCardTitle,alertCardTitleText,id,dismissable,priority;

	pushAlert=function(title,message,choices,actions,dismissable,priority){
		alertCardOverlay = document.createElement("div");
		alertCardOverlay.setAttribute("class","overlay");
		alertCardOverlay.style.zIndex="6";
		if(typeof(priority)=="undefined"||!priority){
			priority="";
		}
		if(typeof(priority)=="number"){
			alertCardOverlay.style.zIndex=(6+priority).toString();
		}
		if(typeof(dismissable)=="undefined"||dismissable==false||!dismissable){
			alertCardOverlay.setAttribute("onclick","dismissAlert()");
		}
		alertCard = document.createElement("div");
		alertCard.setAttribute("class","alert"+priority);
		alertCard.style.display="block";
		alertCard.style.boxShadow="0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)";
		alertCard.style.position="absolute";
		alertCard.style.top="50%";
		alertCard.style.left="50%";
		alertCard.style.transform="translate(-50%, -50%)";
		alertCard.style.backgroundColor="#eeeded";
		alertCard.style.minWidth="250px";
		alertCard.style.cursor="default";
		alertCard.style.zIndex="7";
		alertCard.style.fontFamily="Roboto";

		if(typeof(title)!="undefined"&&title){
			alertCardTitle=document.createElement("div");
			alertCardTitle.style.margin="15px";
			alertCardTitle.style.textAlign="left";
			alertCardTitleText=document.createElement("p");
			alertCardTitleText.style.fontWeight="bold";
			alertCardTitleText.innerText=title;
			alertCardTitle.appendChild(alertCardTitleText);
			alertCard.appendChild(alertCardTitle);
		}

		if(typeof(message)!="undefined"&&message){
			alertCardMessage=document.createElement("div");
			alertCardMessage.style.margin="15px";
			alertCardMessage.style.marginBottom="5px";
			alertCardMessage.style.textAlign="left";
			alertCardText=document.createElement("p");
			alertCardText.style.marginBottom="5px";
			alertCardText.innerText=message;
			alertCardMessage.appendChild(alertCardText);
			alertCard.appendChild(alertCardMessage);
		}

		if(typeof(choices)!="undefined"&&choices){
			if(typeof(choices)=="string"){
				choices = [choices];
			}
			if(typeof(actions)=="string"){
				actions = [actions];
			}
			alertCardOptions = document.createElement("div");
			alertCardOptions.style.width="100%";
			alertCardOptions.style.textAlign="right";
			if(typeof(actions)=="undefined"||!actions){
				actions=[];
			}
			for(i=0;i!=choices.length;i++){
				alertCardOptionsText=document.createElement("p");
				alertCardOptionsText.style.cursor="pointer";
				alertCardOptionsText.style.color="#009688";
				alertCardOptionsText.style.display="inline-block";
				alertCardOptionsText.style.margin="15px";
				alertCardOptionsText.style.marginRight="25px";
				alertCardOptionsText.style.fontWeight="bold";
				alertCardOptionsText.innerText=choices[i];
				if(typeof(actions[i])=="undefined"||!actions[i]){
					actions[i]="dismissAlert()";
				}
				alertCardOptionsText.setAttribute("onclick",actions[i]);
				alertCardOptions.appendChild(alertCardOptionsText);
			}
			alertCard.appendChild(alertCardOptions);
		}
		alertCardOverlay.appendChild(alertCard);
		document.body.appendChild(alertCardOverlay);
	}

	dismissAlert=function(id){
		if(typeof(id)!="undefined"&&id){
			if(document.getElementsByClassName("alert"+id).length>0){
				document.body.removeChild(document.getElementsByClassName("alert"+id)[document.getElementsByClassName("alert"+id).length-1].parentNode);
			}else{
				console.warn("No alert to dismiss.");
			}
		}else{
			if(document.getElementsByClassName("alert").length>0){
				document.body.removeChild(document.getElementsByClassName("alert")[document.getElementsByClassName("alert").length-1].parentNode);
			}else{
				console.warn("No alert to dismiss.");
			}
		}
	}
}
notificationTools();