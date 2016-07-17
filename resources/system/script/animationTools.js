var popIn,popOut;
function animationTools(){
	var elements,index,x,y,deltaX,deltaY,transIndex;
	popIn=function(elements){
		if(typeof(elements[0])=="undefined"){
			elements=[elements];
		}
		index=0;
		function shiftElement(){
			y[index]=elements[index].clientHeight;
			x[index]=elements[index].clientWidth;
			deltaY[index]=0;
			deltaX[index]=0;
			index++;
			transistion(index);
			if(index!=elements.length){
				setTimeout(shiftElement,100);
			}
		}
		function transistion(transIndex){
			elements[transIndex].style.height=deltaY[transIndex]+"px";
			elements[transIndex].style.width=deltaX[transIndex]+"px";
			deltaY[transIndex]+y/20;
			deltaX[transIndex]+y/20;
			if(deltaY[transIndex]!=y[transIndex]&&deltaX[transIndex]!=x[transIndex]){
				setTimeout(transistion,10,transIndex);
			}
		}
	}
}
animationTools();