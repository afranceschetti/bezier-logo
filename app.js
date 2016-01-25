var container = $("#container");
var canvas;

var logocontainer;
var loadingPanel;
var numOfColor;
var mask;
var maskStructure;
var showstructure;
var showlogo;

var colors = [];
var baseColors = ["#55b9fc","#916ab1","#f04090","#8fca40","#fff43b","#f29524"];

$(document).ready(function() {
    init();
});

var showStructure = false;

var init = function() {
	canvas = document.getElementById("logocanvas");
	logocontainer = $("#logocontainer");
	loadingPanel = $("#loadingPanel");
	numOfColor = $("#numOfColor");	
	mask = $("#mask");
	maskStructure = $("#maskStructure");
	showstructure = $("#showstructure");
	showlogo =  $("#showlogo");
	setTimeout(drawLogo, 1000);

	showstructure.on("click",function(){
		showStructure = true;
		showstructure.hide();
		showlogo.show();
		maskStructure.show();
		showLoading(true);	
		setTimeout(drawLogo, 1000);
		mask.hide();
	});	
	
	showlogo.on("click",function(){
		showStructure = false;
		showstructure.show();
		showlogo.hide();
		maskStructure.hide();
		showLoading(true);	
		setTimeout(drawLogo, 1000);
		mask.show();
	});	
	
	$( "#refreshBtn" ).click(function( event ) {
		showLoading(true);	
 		setTimeout(drawLogo, 1000);
	});
	$("#close_toolbar_link").on("click", function(){$('#toolbar').fadeOut();});
	$("#open_credits_link").on("click", function(){$('#credits-panel').fadeIn();});
	$("#close_credits_link").on("click", function(){$('#credits-panel').fadeOut();});

};


var showLoading = function(loading){
	if(loading){
		logocontainer.hide();
		loadingPanel.show();
	}
	else{
		loadingPanel.hide();
		logocontainer.show();
	}
};


var createColors = function(){
	var numOfColors = numOfColor.val();
	baseColors = [];
	colors = [];
	for(var i=0; i<numOfColors;i++){
		baseColors.push($("#color_"+i).val());
	}
	
	var delta = .2;
	var lum  = -.2;
	for(colorIndex = 0; colorIndex<baseColors.length; colorIndex++){
		delta = (lum ==-.2)?delta = .2:delta = -.2;  
		for(lumIndex = 0; lumIndex<2; lumIndex++){
			colors.push(ColorLuminance(baseColors[colorIndex], lum));
			lum += delta;
		}
	}
}


var drawLogo = function(){
	showLoading(true);
	createColors();
	(function(drawfunctions) { 
		with(drawfunctions) { 
			with(Math) {
				var canvasSize = canvas.width;
				var maxLines = $("#numOfLines").val();
				var linesDelta = canvasSize/maxLines;
				var hLines = [];
				var vLines = [];
				var C_CONSTANT = 0.551915024494;
				var circle = [];
				var intersections = [];
				var circleRay = canvasSize/2;
				var stretchH = $("#stretchH").val()/10;
				var stretchV = $("#stretchV").val()/10;
				for(var lineIndex = 0; lineIndex <maxLines; lineIndex++){
					hLines.push(new Bezier(0 ,0 +linesDelta*lineIndex*1.5, 
											50*stretchH,-100+linesDelta*lineIndex*2*stretchH, 
											110*stretchH,10+linesDelta*lineIndex*.8*stretchH, 
											canvasSize,100+linesDelta*lineIndex*1.5));
					vLines.push(new Bezier(0 +linesDelta*lineIndex*1.5, 
											0,50+linesDelta*lineIndex*.8*stretchV,
											100*stretchV, -100+linesDelta*lineIndex*1.5*stretchV,10*stretchV , 
											100+linesDelta*lineIndex*1.5,canvasSize));
				}
				
				circle.push(new Bezier(canvasSize/2 ,canvasSize, canvasSize/2 + canvasSize/2*C_CONSTANT,canvasSize, canvasSize,canvasSize/2 + canvasSize/2*C_CONSTANT, canvasSize,canvasSize/2));
				circle.push(new Bezier(canvasSize ,canvasSize/2, canvasSize, canvasSize/2 - canvasSize/2*C_CONSTANT, canvasSize/2 + canvasSize/2*C_CONSTANT,0, canvasSize/2,0));
				circle.push(new Bezier(canvasSize/2 ,0, canvasSize/2 - canvasSize/2*C_CONSTANT, 0, 0,canvasSize/2 - canvasSize/2*C_CONSTANT, 0,canvasSize/2));
				circle.push(new Bezier(0 ,canvasSize/2, 0, canvasSize/2 + canvasSize/2*C_CONSTANT, canvasSize/2 - canvasSize/2*C_CONSTANT,canvasSize, canvasSize/2,canvasSize));
				
				var draw = function() {
					if(showStructure){
						setColor("lightgray");
						setLineWidth(1);
						for(var lineIndex = 0; lineIndex <maxLines; lineIndex++){
							drawCurve(hLines[lineIndex]);
							drawCurve(vLines[lineIndex]);
							//drawSkeleton(lines[lineIndex]);
						}
						/*
						for(var circleIndex = 0; circleIndex <circle.length; circleIndex++){
							drawCurve(circle[circleIndex]);
							//drawSkeleton(circle[circleIndex]);
						}
						*/	
					}
					else{
						setColor($("#lineColor").val());
						setLineWidth(4);
					
						var lastKey = "";
						for(var hLineIndex = 0; hLineIndex <maxLines; hLineIndex++){
							var hLine = hLines[hLineIndex];
							for(var vLineIndex = 1; vLineIndex <maxLines; vLineIndex++){
								var vLine = vLines[vLineIndex];
								hLine.intersects(vLine).forEach(function(pair) { 
									var t = pair.split("/").map(function(v) { 
										return parseFloat(v); 
										}); 
								
									//drawPoint(hLine.get(t[0])); 
									var key = hLineIndex + "-" + vLineIndex;
									if(key!=lastKey){ // intersects return two values
										intersections.push({key:key, point: hLine.get(t[0])});
										lastKey = key;								
									}
								});
							}
						}
						var colorIndex = 0;
						for(var hLineIndex = 0; hLineIndex <maxLines; hLineIndex++){
							for(var vLineIndex = 0; vLineIndex <maxLines; vLineIndex++){
								var nextHIndex = hLineIndex + 1;
								var nextVIndex = vLineIndex + 1;
								var p1 = getKey(intersections, hLineIndex + "-" + vLineIndex);
								var p2 = getKey(intersections, hLineIndex + "-" + nextVIndex);
								var p3 = getKey(intersections, nextHIndex + "-" + vLineIndex);
								var p4 = getKey(intersections, nextHIndex + "-" + nextVIndex);
								if(p1!=null && p2!=null && p3 !=null && p4 != null){
									var square = "";
									var topLine = hLines[hLineIndex].split(getT(hLines[hLineIndex], p1.point),getT(hLines[hLineIndex], p2.point));
									var rightLine = vLines[vLineIndex+1].split(getT(vLines[vLineIndex+1], p2.point), getT(vLines[vLineIndex+1], p4.point));
									var bottomLine = hLines[hLineIndex+1].split(getT(hLines[hLineIndex+1], p4.point),getT(hLines[hLineIndex+1], p3.point));
									var leftLine = vLines[vLineIndex].split( getT(vLines[vLineIndex], p3.point),getT(vLines[vLineIndex], p1.point));
									setFill(colors[colorIndex]);
									drawCurves([topLine,rightLine,bottomLine,leftLine]);
									colorIndex = (colorIndex<colors.length?colorIndex +1:0);
								}
							}
						}
					}
				}
				draw();
				showLoading(false);
				//handleInteraction(getCanvas(), curve).onupdate = function() { reset(); draw(); }
				//handleInteraction(getCanvas(), curve2).onupdate = function() { reset(); draw(); }
			}
		}
	} (bindDrawFunctions( canvas )) )
}


var getKey = function(map, value){
    var flag=false;
    var keyVal;
    for (obj in map){
         if (map[obj].key == value){
             flag=true;
             keyVal=map[obj];
             break;
         }
    }

    if(flag){
         return keyVal;
    }
    else{
         return null;
    }
}

var ColorLuminance = function(hex, lum) {

	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
}


var getT = function(line, point){
	var minT = 0;
	var minDelta = 4000;
	for(var tIndex = 0; tIndex<1; tIndex += 0.01){
		var extrapolatedPoint = line.get(tIndex);
		var delta = Math.abs(extrapolatedPoint.x - point.x) + Math.abs(extrapolatedPoint.y - point.y);
		if(delta < minDelta){
			minDelta = delta;
			minT = tIndex;
		}
	}
	return minT;
}