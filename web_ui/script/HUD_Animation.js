
function canvas_draw () {
    var canvas=document.getElementById("canvasDemo");
	if (canvas.getContext('2d')){
		context = canvas.getContext('2d');
		updateCanvas(context);
                //context.fillStyle = "#99cccc";
                //context.fillRect (0, 0, 280, 105);
	}
}

function test_context_pass(context){
        context.fillStyle = "#99cccc";
        context.fillRect (0, 0, 280, 105);
        context.fillStyle = "#cc9966";
        context.fillRect (0, 105, 280, 210);
	context.strokeStyle="#ffffff";
	context.lineWidth="2";
	context.moveTo(-10,105);
	context.lineTo(280,105);
	context.stroke();

}

function updateCanvas(){
    if(window.current_uav > -1){
	  drawHorizon(context);
    }
    setTimeout(function () { updateCanvas(); }, 1000);
}

function drawHorizon(context){
	var pitch = window.uavs[window.current_uav].pitch;
	var roll = window.uavs[window.current_uav].roll;
	//start simple, calculate line position based on roll
	sin_theta = Math.sin(roll);
	cos_theta = Math.cos(roll);
	adj_length = 140;
	hypotenuse = adj_length / cos_theta;
	opp_length = hypotenuse * sin_theta;
	left_y_ = 105 + Math.round(opp_length);
	right_y = 105 - Math.round(opp_length);
    
    //draw
	context.strokeStyle="#000000";
	context.lineWidth="2";
	context.moveTo(0 , left_y);
	context.lineTo(280,right_y);
	context.stroke();
}

