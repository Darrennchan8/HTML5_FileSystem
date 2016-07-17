'use strict';
/*
* This is a dependency.  printTools  is  used to set the UI
* that  plugins  will  need  to  display  main information.
* ui.static  keys  are  objects  that normally shouldn't be
* called upon directly.  ui.header  and  ui.body  should be
* enough  for  normal  use.  You  may  be  able  to use the
* ui.effects object to control effects, though.
*/
var ui;
function printTools(){
	var header,wrapper,cardNum,menuOverlay;
	menuOverlay=null;
	cardNum=0;
	ui={
		/*
		ui.header.reset({
			color:"black"||"#FFFFFF"||rgba(x,x,x,x) //Optional, default #00BCD4 (material blue)
		}//Optional);
		ui.header.add({
			message:"Text to add to header",
			onclick:function(){"This gets executed after the user clicks your section of title"},//Optional
			color:"black"||"#FFFFFF"||rgba(x,x,x,x), //Optional, default white
		},{
			message:"Text to add to header",
			onclick:function(){"This gets executed after the user clicks your section of title"},//Optional
			color:"black"||"#FFFFFF"||rgba(x,x,x,x), //Optional, default white
		});
		ui.body.reset({
			color:"black"||"#FFFFFF"||rgba(x,x,x,x) //Optional, default #eeeded (material greyish-white)
		}//Optional);


		ui.body.add({
			message:"Text to card",
			color:"black"||"#FFFFFF"||rgba(x,x,x,x), //Optional, default plain white
			onclick:function(){"This gets executed after clicked"}, //Optional
			img:[{
				src:"/path/to/image",
				align:"left"||"right",
				visible:"hover" //Optional, default always visible
			}]//Optional
			longPress:function(){"This gets executed after the user long presses your card."} //Optional
		},{
			message:"Text to card",
			color:"black"||"#FFFFFF"||rgba(x,x,x,x), //Optional, default material light-grey
			onclick:function(){"This gets executed after clicked"}, //Optional
			img:[{
				src:"/path/to/image",
				align:"left"||"right",
				visible:"hover" //Optional, default always visible
				onclick:function(event){} //Optional, add to get cursor
			}]//Optional
			longPress:function(){"This gets executed after the user long presses your card."} //Optional
		});


		ui.contextMenu.add({
			x:123, //Origin x-pos
			y:123, //Origin y-pos
			items:[{
				message:"1st item",
				img:"/path/to/image",
				color:"white"||"rgba(x,x,x,x)", //Optional, default inherit
				onclick:function(){} //Optional, gets executed after clicked.
			}],
			color: "white"||"#FFFFFF" //Optional, default white
		});
		ui.contextMenu.remove();


		ui.effects.fadeIn({
			target:(DOM element),
			speed:(positive int) //optional multiplier, 250 ms=1
		},{
			target:(DOM element),
			speed:(positive int) //optional multiplier, 250 ms=1
		});
		ui.effects.fadeOut({
			target:(DOM element),
			speed:(positive int) //optional multiplier, 250 ms=1
		},{
			target:(DOM element),
			speed:(positive int) //optional multiplier, 250 ms=1
		});
		*/
		header:{
			reset:function(params){
				try{
					document.body.removeChild(header);
				}catch(err){}
				header = document.createElement("header");
				header.setAttribute("class","wrapperHeader");
				header.appendChild(hamburgerMenu.newIcon());
				if(typeof(params)=="object"&&params!=null){
					if(typeof(params.color)=="string"){
						header.style.background=params.color;
					}
				}
				document.body.appendChild(header);
			},
			add:function(){
				for(let x=0;x!=arguments.length;x++){
					let newText = document.createElement("p");
					newText.innerText=arguments[x].message;
					if(typeof(arguments[x].onclick)!="function"){
						newText.setAttribute("class","wrapperHeaderTitle");
					}else{
						newText.setAttribute("class","wrapperHeaderTitleClickable");
						newText.addEventListener("click",arguments[x].onclick);
					}
					if(typeof(arguments[x].color)=="string"){
						newText.style.color=arguments[x].color;
					}
					header.appendChild(newText);
				}
			}
		},
		body:{
			reset:function(attributes){
				try{
					document.body.removeChild(wrapper);
				}catch(err){}
				wrapper = document.createElement("div");
				wrapper.setAttribute("class","fullWrapper");
				if(typeof(attributes)=="object"&&attributes!=null){
					if(typeof(attributes.color)=="string"){
						document.body.style.background=attributes.color;
					}
				}
				cardNum=0;
				document.body.appendChild(wrapper);
			},
			add:function(){
				for(let index=0;index!=arguments.length;index++){
					let cardElement = document.createElement("div");
					let cardText=document.createElement("p");
					cardText.setAttribute("class","cardText");
					cardText.innerText=arguments[index].message
					cardElement.setAttribute("class","longCard");
					if(typeof(arguments[index].onclick)=="function"){
						cardElement.addEventListener("click",arguments[index].onclick);
					}
					if(typeof(arguments[index].color)=="string"){
						cardElement.style.background=arguments[index].color;
					}
					if(Array.isArray(arguments[index].img)){
						for(let i=0;i!=arguments[index].img.length;i++){
							let img=document.createElement("img");
							img.src=arguments[index].img[i].src;
							if(arguments[index].img[i].align=="left"){
								img.setAttribute("class","actionLeft");
							}
							if(arguments[index].img[i].align=="right"){
								img.setAttribute("class","actionRight");
							}
							if(arguments[index].img[i].visible=="hover"){
								img.className+=" fadeIn";
								cardElement.addEventListener("mouseenter",Function([],"ui.static.fadeIn("+cardNum+")"));
								cardElement.addEventListener("mouseleave",Function([],"ui.static.fadeOut("+cardNum+")"));
							}
							if(typeof(arguments[index].img[i].onclick)=="function"){
								img.addEventListener("click",function(e){e.stopPropagation();});
								img.style.cursor="pointer";
								img.addEventListener("click",arguments[index].img[i].onclick);
							}
							cardElement.appendChild(img);
						}
					}
					if(typeof(arguments[index].longPress)=="function"&&/*The smallest form of security we could deploy.*/typeof(ui.static.longPresses.length)=="number"){
						cardElement.addEventListener("mousedown",Function([],"ui.static.timeoutPress=setTimeout(ui.static.longPresses["+ui.static.longPresses.length+"],500);"));
						cardElement.addEventListener("mouseup",function(){window.clearInterval(ui.static.timeoutPress)});
						cardElement.addEventListener("mouseout",function(){window.clearInterval(ui.static.timeoutPress)});
						ui.static.longPresses[ui.static.longPresses.length]=arguments[index].longPress;
					}
					cardElement.appendChild(cardText);
					wrapper.appendChild(cardElement);
					cardNum++;
				}
			}
		},
		contextMenu:{
			add:function(menuObject){
				let right,top,menuHeight,menuWidth;
				menuWidth=240;
				menuHeight=0;
				menuOverlay=document.createElement("div");
				menuOverlay.style.position="fixed";
				menuOverlay.style.width="100%";
				menuOverlay.style.height="100%";
				menuOverlay.style.top="0px";
				menuOverlay.style.left="0px";
				menuOverlay.style.zIndex="5";
				menuOverlay.addEventListener("click",ui.contextMenu.remove);
				for(let index=0;index!=menuObject.items.length;index++){
					menuHeight+=40;
				}
				if(menuObject.x<window.innerWidth/2){
					right=true;
				}else{
					right=false;
				}
				if(menuObject.y<window.innerHeight/2){
					top=false;
				}else{
					top=true;
				}
				var menu=document.createElement("div");
				menu.style.zIndex="6";
				menu.style.position="absolute";
				if(typeof(menuObject.color)=="string"){
					menu.style.backgroundColor=menuObject.color;
				}else{
					menu.style.backgroundColor="#ECEFF1";
				}
				if(top){
					//flexbox chronological vertical
					//drop up menu
					menu.style.top=menuObject.y-menuHeight+"px";
				}else{
					//flexbox opposite vertical
					//drop down menu
					menu.style.top=menuObject.y+"px";
				}
				if(right){
					menu.style.left=menuObject.x+"px";
				}else{
					menu.style.left=menuObject.x-menuWidth+"px";
				}
				menu.style.height=menuHeight+"px";
				menu.style.width=menuWidth+"px";
				menu.style.boxShadow="0 3px 6px rgba(0,0,0,0.32), 0 3px 6px rgba(0,0,0,0.46)";
				menu.addEventListener("click",function(e){e.stopPropagation();});
				for(let i=0;i!=menuObject.items.length;i++){
					let item,itemIco,itemText;
					item=document.createElement("div");
					item.style.borderBottom="solid 1px rgba(0,0,0,0.23)";
					item.style.height="40px";
					item.style.display="flex";
					item.style.width="240px";
					if(typeof(menuObject.items[i].color)=="string"){
						menuObject.style.backgroundColor=menuObject.items[i].color;
					}
					if(typeof(menuObject.items[i].onclick)=="function"){
						item.addEventListener("click",menuObject.items[i].onclick);
						item.style.cursor="pointer";
					}else{
						item.style.cursor="default";
					}
					itemIco=document.createElement("img");
					itemIco.setAttribute("src",menuObject.items[i].img);
					itemIco.style.float="left";
					itemIco.style.padding="8px";
					itemIco.style.display="inline-block";
					itemIco.style.borderRight="solid 1px rgba(0,0,0,0.1)";
					itemText=document.createElement("p");
					itemText.innerText=menuObject.items[i].message;
					itemText.style.fontFamily="Roboto, sans-serif";
					itemText.style.display="inline-block";
					itemText.style.float="left";
					itemText.style.whiteSpace="nowrap";
					itemText.style.lineHeight="10px";
					itemText.style.paddingLeft="10px";
					itemText.style.width="195px";
					itemText.style.textAlign="left";
					item.appendChild(itemIco);
					item.appendChild(itemText);
					menu.appendChild(item);
				}
				document.body.style.overflowY="hidden";
				menuOverlay.appendChild(menu);
				document.body.appendChild(menuOverlay);
			},
			remove:function(){
				document.body.style.overflowY=null;
				try{
					document.body.removeChild(menuOverlay);
				}catch(err){}
			}
		},
		effects:{
			fadeIn:function(){
				for(let i=0;i!=arguments.length;i++){
					arguments[i].target.style.opacity="1";
				}
			},
			fadeOut:function(){
				for(let i=0;i!=arguments.length;i++){
					arguments[i].target.style.opacity="0";
				}
			}
		},
		static:{
			timeoutPress:0,
			longPresses:[],
			fadeIn:function(index){
				var predecessor=document.getElementsByClassName("longCard")[index].childNodes;
				var fadeThese=[];
				/*Convert the object into an array*/
				for(let i=0;i!=predecessor.length;i++){
					fadeThese[i]=predecessor[i];
				}
				/*Filter down to those that need to be handled*/
				for(let i=0;i!=fadeThese.length;i++){
					if(!fadeThese[i].classList.contains("fadeIn")){
						fadeThese.splice(i,1);
						i--;
					}
				}
				for(let i=0;i!=fadeThese.length;i++){
					ui.effects.fadeIn({
						target:fadeThese[i]
					});
				}
			},
			fadeOut:function(index){
				var predecessor=document.getElementsByClassName("longCard")[index].childNodes;
				var fadeThese=[];
				/*Convert the object into an array*/
				for(let i=0;i!=predecessor.length;i++){
					fadeThese[i]=predecessor[i];
				}
				/*Filter down to those that need to be handled*/
				for(let i=0;i!=fadeThese.length;i++){
					if(!fadeThese[i].classList.contains("fadeIn")){
						fadeThese.splice(i,1);
						i--;
					}
				}
				for(let i=0;i!=fadeThese.length;i++){
					ui.effects.fadeOut({
						target:fadeThese[i]
					});
				}
			}
		}
	}
	header = document.createElement("header");
	header.setAttribute("class","wrapperHeader");
	header.appendChild(hamburgerMenu.newIcon());
	document.body.appendChild(header);
	wrapper = document.createElement("div");
	wrapper.setAttribute("class","fullWrapper");
	document.body.appendChild(wrapper);
}
printTools();