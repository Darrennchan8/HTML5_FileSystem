'use strict';
var pushAlert,notifyPrompt,dismissAlert;
function notificationTools(){
	var alertCardOverlay,alertCardText,alertCard,i,alertCardOptions,alertCardOptionsText,alertCardTitle,alertCardTitleText,id,params;

	/*pushAlert({
		priority:1234567890(Higher is higher priority),
		dismissable:[true/false],
		title:"Title dialogue box",
		message:"Message dialogue box",
		choices:"dismiss"/["Accept","Decline","more text to display","..."],
		actions:"action1()",["action1()","action2()","action3()","..."]
	})
	ex:pushAlert({priority:0,dismissable:false,title:"Test Alert",message:"This is a test alert. Click dismiss to dismiss.",choices:["dismiss","dismiss"],actions:["dismissAlert('0')","dismissAlert('0')"]});*/
	pushAlert=function(params){
		alertCardOverlay = document.createElement("div");
		alertCardOverlay.setAttribute("class","overlay");
		alertCardOverlay.style.zIndex="6";
		if(typeof(params.priority)=="undefined"||!params.priority){
			params.priority="";
		}
		if(typeof(params.priority)=="number"){
			alertCardOverlay.style.zIndex=(6+params.priority).toString();
		}
		if(typeof(params.dismissable)=="undefined"||params.dismissable==false||!params.dismissable){
			alertCardOverlay.setAttribute("onclick","dismissAlert()");
		}
		alertCard = document.createElement("div");
		alertCard.setAttribute("class","alert"+params.priority);
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

		if(typeof(params.title)!="undefined"&&params.title){
			alertCardTitle=document.createElement("div");
			alertCardTitle.style.margin="15px";
			alertCardTitle.style.textAlign="left";
			alertCardTitleText=document.createElement("p");
			alertCardTitleText.style.fontWeight="bold";
			alertCardTitleText.innerText=params.title;
			alertCardTitle.appendChild(alertCardTitleText);
			alertCard.appendChild(alertCardTitle);
		}

		if(typeof(params.message)!="undefined"&&params.message){
			alertCardMessage=document.createElement("div");
			alertCardMessage.style.margin="15px";
			alertCardMessage.style.marginBottom="5px";
			alertCardMessage.style.textAlign="left";
			alertCardText=document.createElement("p");
			alertCardText.style.marginBottom="5px";
			alertCardText.innerText=params.message;
			alertCardMessage.appendChild(alertCardText);
			alertCard.appendChild(alertCardMessage);
		}

		if(typeof(params.choices)!="undefined"&&params.choices){
			if(typeof(params.choices)=="string"){
				params.choices = [params.choices];
			}
			if(typeof(params.actions)=="string"){
				params.actions = [params.actions];
			}
			alertCardOptions = document.createElement("div");
			alertCardOptions.style.width="100%";
			alertCardOptions.style.textAlign="right";
			if(typeof(params.actions)=="undefined"||!params.actions){
				params.actions=[];
			}
			for(i=0;i!=params.choices.length;i++){
				alertCardOptionsText=document.createElement("p");
				alertCardOptionsText.style.cursor="pointer";
				alertCardOptionsText.style.color="#009688";
				alertCardOptionsText.style.display="inline-block";
				alertCardOptionsText.style.margin="15px";
				alertCardOptionsText.style.marginRight="25px";
				alertCardOptionsText.style.fontWeight="bold";
				alertCardOptionsText.innerText=params.choices[i];
				if(typeof(params.actions[i])=="undefined"||!params.actions[i]){
					params.actions[i]="dismissAlert()";
				}
				alertCardOptionsText.setAttribute("onclick",params.actions[i]);
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