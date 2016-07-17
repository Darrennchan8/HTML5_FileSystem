'use strict';
var hamburgerMenu;
function hambMenu(){
	var newHamburgerMenu,hamburgerMenuIco,overlay,menu,header;
	hamburgerMenu={
		/*hamburgerMenu.remove("stockHome","stockHome","stockMusicTab","stockVideoTab",...);*/
		/*hamburgerMenu.add({
			priority:-999-1000, //higher int is farther down in list
			id:"identity",
			title:"text to display to user",
			img:"/path/to/image",
			onclick:function(){alert("clicked");}, //Optional
			position:"top"||"bottom", //Optional
			color:"#FFFFFF", //Optional
			unload:function(){alert("user is navigating away");} //Optional
		});*/
		/*header.appendChild(hamburgerMenu.newHamburgerMenu());*/
		queue:[],
		leave:function(){
			fab.remove("newFile","newFolder","stockUpload");
		},
		newIcon:function(){
			newHamburgerMenu=document.createElement("div");
			newHamburgerMenu.style.display="inline-block";
			newHamburgerMenu.style.position="relative";
			newHamburgerMenu.style.height="24px";
			newHamburgerMenu.style.float="left";
			newHamburgerMenu.style.padding="15px";
			newHamburgerMenu.style.paddingRight="0px";
			newHamburgerMenu.style.cursor="pointer";
			newHamburgerMenu.style.color="#EEEDED";
			newHamburgerMenu.addEventListener("click",hamburgerMenu.open);
			hamburgerMenuIco=document.createElement("img");
			hamburgerMenuIco.setAttribute("src","system/res/menuLight.svg");
			newHamburgerMenu.appendChild(hamburgerMenuIco);
			return newHamburgerMenu;
		},
		open:function(){
			overlay.addEventListener("click",hamburgerMenu.close);
			newHamburgerMenu.style.zIndex="6";
			overlay.style.display="block";
			hamburgerMenu.update();
		},
		close:function(){
			newHamburgerMenu.addEventListener("click",hamburgerMenu.open);
			newHamburgerMenu.style.zIndex="0";
			overlay.style.display="none";
		},
		add:function(){
			for(let i=0;i!=arguments.length;i++){
				hamburgerMenu.queue[hamburgerMenu.queue.length]=arguments[i];
			}
		},
		remove:function(){
			for(let i=0;i!=arguments.length;i++){
				for(let index=0;index!=hamburgerMenu.queue.length;index++){
					if(hamburgerMenu.queue[index].id==arguments[i]&&typeof(arguments[i])=="string"){
						hamburgerMenu.queue.splice(index,1);
						index--;
					}
				}
			}
		},
		update:function(){
			/*Remove All Menu Objects*/
				while(menu.childNodes.length!==0){
					menu.removeChild(menu.childNodes[0]);
				}

			/*Sort new hamburger options by priority*/
				var tempArray=[];
				while(hamburgerMenu.queue.length!==0){
				let maxPriority=0;
					for(let i=0;i!=hamburgerMenu.queue.length;i++){
						if(hamburgerMenu.queue[i].priority>hamburgerMenu.queue[maxPriority].priority){
							maxPriority=i;
						}
					}
					tempArray[tempArray.length]=hamburgerMenu.queue[maxPriority];
					hamburgerMenu.queue.splice(maxPriority,1);
				}
				hamburgerMenu.queue=tempArray;		

			/*Print out Hamburger menu's Header*/
				header=document.createElement("div");
				menu.appendChild(header);

			/*Print out hamburger options*/
				var bottom=0;//workaround for deficiency in CSS
				let scrollContainer = document.createElement("div");
				scrollContainer.style.width="100%";
				for(let i=0;i!=hamburgerMenu.queue.length;i++){
					let tempOption,tempIco,tempText;
					tempOption=document.createElement("div");
					tempOption.style.display="block";
					tempOption.style.width="100%";
					if(typeof(hamburgerMenu.queue[i].onclick)=="function"){//set click event
						let tempFunction=new Function([],"hamburgerMenu.leave();hamburgerMenu.queue["+i+"].onclick();if(typeof(hamburgerMenu.queue["+i+"].unload)=='function'){hamburgerMenu.leave=hamburgerMenu.queue["+i+"].unload;}else{hamburgerMenu.leave=function(){};}");
						/*Should edit this later, this is considered a form of eval.*/
						tempOption.addEventListener("click", tempFunction);
						tempOption.style.cursor="pointer";
					}else{
						tempOption.style.cursor="default";
					}
					tempOption.style.height="50px";
					tempOption.style.borderTop="solid 1px rgba(0,0,0,.23)";
					tempIco = document.createElement("img");
					tempIco.setAttribute("src",hamburgerMenu.queue[i].img);
					tempIco.style.display="inline-block";
					tempIco.style.padding="13px";
					tempIco.style.verticalAlign="middle";
					tempOption.appendChild(tempIco);
					tempText = document.createElement("div");
					tempText.style.fontFamily="Roboto,sans-serif";
					tempText.style.padding="10px";
					tempText.innerText=hamburgerMenu.queue[i].title;
					tempText.style.display="inline-block";
					tempOption.appendChild(tempText);
					if(typeof(hamburgerMenu.queue[i].color)=="string"){
						tempOption.style.backgroundColor=hamburgerMenu.queue[i].color;
						tempText.style.color="white";
					}
					if(hamburgerMenu.queue[i].position=="bottom"){
						tempOption.style.position="absolute";
						tempOption.style.bottom=bottom+"px";
						bottom+=50;
						menu.appendChild(tempOption);
					} else {
						scrollContainer.appendChild(tempOption);
					}
				}
				scrollContainer.style.maxHeight=window.innerHeight-bottom+"px";
				scrollContainer.style.overflow="scroll";
				menu.appendChild(scrollContainer);
		}
	};
	overlay = document.createElement("div");
	overlay.setAttribute("class","overlay");
	overlay.style.display="none";
	overlay.style.zIndex="6";
	menu = document.createElement("div");
	menu.style.width="300px";
	menu.style.backgroundColor="white";
	menu.style.left="0px";
	menu.style.height="100%";
	menu.style.textAlign="left";
	menu.setAttribute("onclick","event.stopPropagation()");
	menu.style.position="relative";
	overlay.appendChild(menu);
	overlay.addEventListener("click",hamburgerMenu.close);
	document.body.appendChild(overlay);
}
hambMenu();