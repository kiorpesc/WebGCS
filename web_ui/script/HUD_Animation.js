
function canvas_draw () {
    var canvas=document.getElementById("hud_canvas");
	if (canvas.getContext('2d')){
		context = canvas.getContext('2d');
		updateCanvas(canvas, context);
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

function updateCanvas(canvas, context){
    if(window.current_uav > -1){
      //context.beginPath();
      context.clearRect(0,  0, canvas.width, canvas.height);
	  drawHorizon(canvas, context);
    }
    setTimeout(function () { updateCanvas(canvas, context); }, 250);
}

function drawHorizon(canvas, context){
	var pitch = window.uavs[window.current_uav].pitch;
	var roll = window.uavs[window.current_uav].roll;
	//start simple, calculate line position based on roll
	var sin_theta = Math.sin(roll);
	var cos_theta = Math.cos(roll);
	var adj_length = canvas.width/2;
	var hypotenuse = adj_length / cos_theta;
	var opp_length = hypotenuse * sin_theta;
	var left_y = canvas.height/2 + Math.round(opp_length);
	var right_y = canvas.height/2 - Math.round(opp_length);
	var pitch_offset = Math.sin(pitch) * adj_length;
    
    //draw
    context.beginPath();
	context.strokeStyle="#000000";
	context.lineWidth="2";
	context.moveTo(0 , left_y + pitch_offset);
	context.lineTo(280, right_y + pitch_offset);
	context.stroke();
}

