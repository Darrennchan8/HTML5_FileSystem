'use strict';
var fab;
function fabTools(){
	var overlayFAB,overlayFABImage,fabOverlay,smallFabImage,smallFab,fabImage,queue,right,bottom,fabIndex,tempFabIndex;
	fabIndex = 0;
	tempFabIndex = 0;
	queue=[];
	right=31;
	bottom=20;
	fab={
		/*fab.close(); //Closes fab menu if open*/
		/*fab.open(); //Opens fab menu if closed. Also updates*/
		/*fab.add({
			priority:-999-1000, //higher int & older fab is closer to origin
			id:"identity",
			color:"#FFFFFF",
			img:"/path/to/image",
			position:"horizontal"||"vertical", //Optional, horizontal assumed; vertical for persistent actions, horizonatal for temporary
			onclick:function(){alert("clicked");}, //Optional
			title:"infoText while hovering", //Optional
		});*/
		/*fab.remove("stockHome","stockHome","stockMusicTab","stockVideoTab",...); //Removes all fabs with corresponding identities. Strings Only.*/
		close:function(){
			try{
				document.body.style.overflow="auto";
				fabOverlay.parentNode.removeChild(fabOverlay);
				overlayFAB.style.display="inline-block";
				for(tempFabIndex=0; tempFabIndex!=document.getElementsByClassName("smallFab").length;tempFabIndex++){
					document.getElementsByClassName("smallFab")[tempFabIndex].style.display="none";
				}
				fab.style.display="none";
			}catch(err){}
		},
		open:function(event){
			fab.update();
			if(typeof(event)=="object"){
				event.stopPropagation();
			}
			document.body.style.overflow="hidden";
			overlayFAB.style.display="none";
			try{
				document.getElementById("fab").style.display="inline-block";
			}catch(err){}
			for(tempFabIndex=0; tempFabIndex!=document.getElementsByClassName("smallFab").length;tempFabIndex++){
				document.getElementsByClassName("smallFab")[tempFabIndex].style.display="inline-block";
			}
			fabOverlay = document.createElement("div");
			fabOverlay.setAttribute("class","overlay");
			fabOverlay.style.zIndex = "3";
			fabOverlay.style.backgroundColor="rgba(0,0,0,0.25)";
			fabOverlay.addEventListener("click",fab.close);
			document.body.appendChild(fabOverlay);
		},
		add:function(){
			for(let i=0;i!=arguments.length;i++){
				queue[queue.length]=arguments[i];
			}
		},
		remove:function(){
			for(let i=0;i!=arguments.length;i++){
				for(let index=0;index!=queue.length;index++){
					if(queue[index].id==arguments[i]&&typeof(arguments[i])=="string"){
						queue.splice(index,1);
						index--;
					}
				}
			}
		},
		update:function(){
			/*Remove all existing FABs*/
				while(document.getElementsByClassName("smallFab").length!==0){
					document.getElementsByClassName("smallFab")[0].parentNode.removeChild(document.getElementsByClassName("smallFab")[0]);
				}
				if(document.getElementById("fab")){
					document.getElementById("fab").parentNode.removeChild(document.getElementById("fab"));
				}

			/*Sort all FAB options by priority*/
				var tempArray=[];
				while(queue.length!==0){
				let maxPriority=0;
					for(let i=0;i!=queue.length;i++){
						if(queue[i].priority>queue[maxPriority].priority){
							maxPriority=i;
						}
					}
					tempArray[tempArray.length]=queue[maxPriority];
					queue.splice(maxPriority,1);
				}
				queue=tempArray;

			/*Print out big maxpriority FAB*/
				if(queue.length!=0){
					let bigFAB = document.createElement("div");
					bigFAB.style.display="inline-block";
					bigFAB.setAttribute("class","fab");
					bigFAB.setAttribute("id","fab");
					bigFAB.style.background=queue[0].color;
					let fabImage = document.createElement("img");
					fabImage.style.height="100%";
					fabImage.style.width="28px";
					fabImage.style.display="inline-block";
					fabImage.setAttribute("src",queue[0].img);
					fabImage.setAttribute("draggable","false");
					bigFAB.addEventListener("click",queue[0].onclick);
					bigFAB.appendChild(fabImage);
					document.body.appendChild(bigFAB);

			/*Print out small FABs*/
					right = 31;
					bottom = 20;
					for(let i=1;i!=queue.length;i++){
						if(queue[i]!==undefined){
							let smallFab = document.createElement("div");
							if(overlayFAB.style.display=="none"){
								smallFab.style.display="inline-block";
							} else {
								smallFab.style.display="none";
							}
							smallFab.setAttribute("class","smallFab");
							smallFab.style.background=queue[i].color;
							if(typeof(queue[i].onclick)=="function"){
								smallFab.addEventListener("click",queue[i].onclick);
							}
							if(queue[i].position=="vertical"){
								bottom += 68;
								smallFab.style.right="31px";
								smallFab.style.bottom=bottom+"px";
							}else{
								right += 68;
								smallFab.style.bottom="20px";
								smallFab.style.right=right+"px";
							}
							smallFabImage = document.createElement("img");
							smallFabImage.style.height="100%";
							smallFabImage.style.width="24px";
							smallFabImage.style.display="inline-block";
							smallFabImage.setAttribute("src",queue[i].img);
							smallFabImage.setAttribute("draggable","false");
							smallFab.appendChild(smallFabImage);
							document.body.appendChild(smallFab);
						}
				}
			}
		}
	};
	overlayFAB = document.createElement("div");
	overlayFAB.setAttribute("class","fab");
	overlayFAB.setAttribute("style","background:#F44336; cursor:pointer; z-index:5;");
	overlayFAB.addEventListener("click",fab.open);
	overlayFABImage = document.createElement("img");
	overlayFABImage.setAttribute("style","height: 100%; width: 28px; display: inline-block;");
	overlayFABImage.setAttribute("src","../system/res/addLight.svg");
	overlayFAB.appendChild(overlayFABImage);
	document.body.appendChild(overlayFAB);
}
fabTools();