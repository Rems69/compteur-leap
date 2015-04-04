var canvas_compteur,
	ctx_compteur,
	canvas_vitesse,
	ctx_vitesse;

var vitesse,
	duree;

var sonKlaxon,
	sonVictoire,
	sonAcceleration;


var current_hand_pos,
	hand_direction,
	previous_hand_direction,
	hand_position,
	previous_hand_position,
	hand_velocity,
	hand_grab,
	left_hand_present;

function drawCompteur() {

	// Big circle
	ctx_compteur.beginPath();
	ctx_compteur.rect(0, 0, 800, 450);
	ctx_compteur.fillStyle = '#ecf0f1';
	ctx_compteur.fill();


	// Small circle
	ctx_compteur.beginPath();
	ctx_compteur.arc(400, 300, 200, 0.8*Math.PI, 0.2*Math.PI);
	ctx_compteur.fillStyle = "#ecf0f1";
	ctx_compteur.strokeStyle = "#2c3e50";
	ctx_compteur.lineWidth=4;
	ctx_compteur.fill();
	ctx_compteur.stroke();

	// km/h text
	ctx_compteur.font = "14pt Arial";
	ctx_compteur.fillStyle = "#2c3e50";
	ctx_compteur.fillText("KM/H", 377, 250);

	// Graduations
	ctx_compteur.save(); // Saving context
	ctx_compteur.translate(400, 300);
	ctx_compteur.rotate(Math.PI / 1.2);
	for (i = 0; i < 41; i++) {
		ctx_compteur.beginPath();
		ctx_compteur.moveTo(200, 0);  // First point
		if(i%2 == 0){
			ctx_compteur.lineWidth = "4";
			ctx_compteur.lineTo(180, 0); // Second point
		} else {
			ctx_compteur.lineWidth = "3";
			ctx_compteur.lineTo(190, 0); // Second point
		}
		ctx_compteur.strokeStyle = "#2c3e50";
		ctx_compteur.stroke();

		ctx_compteur.rotate(Math.PI / 30);
	}
	ctx_compteur.restore(); // Restore context

	// Graduations labels
	var graduations = [
		{value:"0", x:250, y:390},
		{value:"20", x:230, y:323},
		{value:"20", x:230, y:323},
		{value:"40", x:235, y:252},
		{value:"60", x:270, y:200},
		{value:"80", x:325, y:160},
		{value:"100", x:384, y:145},
		{value:"120", x:450, y:160},
		{value:"140", x:500, y:200},
		{value:"160", x:530, y:252},
		{value:"180", x:537, y:323},
		{value:"200", x:517, y:390}];

	graduations.forEach(function(gr) {
		ctx_compteur.fillText(gr.value, gr.x, gr.y);
	});

	function roundRect(context, x, y, w, h, radius) {
		var r = x + w;
		var b = y + h;

		context.beginPath();
		context.moveTo(x+radius, y);
		context.lineTo(r-radius, y);
		context.quadraticCurveTo(r, y, r, y+radius);
		context.lineTo(r, y+h-radius);
		context.quadraticCurveTo(r, b, r-radius, b);
		context.lineTo(x+radius, b);
		context.quadraticCurveTo(x, b, x, b-radius);
		context.lineTo(x, y+radius);
		context.quadraticCurveTo(x, y, x+radius, y);
		context.closePath();
		context.fillStyle = "#ecf0f1";
		context.strokeStyle = "#2c3e50";
		context.lineWidth=4;
		context.fill();
		context.stroke();
	}

	roundRect(ctx_compteur, 350, 363, 100, 40, 20);
}

function drawVitesse() {
	if (vitesse >= 0){
		vitesse_cpt = Math.round(5 * vitesse);
	}

	// Digital counter
	ctx_vitesse.font = "14pt Arial";
	ctx_vitesse.fillStyle = "#2c3e50";
	if(vitesse_cpt > 99) {
		ctx_vitesse.fillText(vitesse_cpt, 385, 390);
	} else if(vitesse_cpt > 9) {
		ctx_vitesse.fillText(vitesse_cpt, 390, 390);
	} else {
		ctx_vitesse.fillText(vitesse_cpt, 395, 390);
	}

	ctx_vitesse.save();

	// Hand
	ctx_vitesse.translate(400, 300);

	ctx_vitesse.rotate((Math.PI / 30) * (25 + vitesse));

	ctx_vitesse.beginPath();
	ctx_vitesse.moveTo(-50, -8);
	ctx_vitesse.lineTo(130, 0);
	ctx_vitesse.lineTo(-50, 8);
	ctx_vitesse.closePath();
	ctx_vitesse.lineWidth = "4";
	ctx_vitesse.strokeStyle = "#2c3e50";
	ctx_vitesse.fillStyle = "#ecf0f1";
	ctx_vitesse.fill();
	ctx_vitesse.stroke();
	ctx_vitesse.restore();

	// Hand support
	ctx_vitesse.beginPath();
	ctx_vitesse.arc(400, 300, 30, 0, Math.PI * 2);
	ctx_vitesse.fillStyle = "#ecf0f1";
	ctx_vitesse.strokeStyle = "#2c3e50";
	ctx_vitesse.lineWidth=4;
	ctx_vitesse.fill();
	ctx_vitesse.stroke();
}

function moveVitesse() {
	duree++;
	if (keydown.down || left_hand_present) {
		if (vitesse > 0.3) {
			vitesse = vitesse - 0.3;
		} else {
			vitesse = 0;
		}
	} else if (keydown.up || (hand_position < previous_hand_position && hand_grab < 0.8)) {
		if (vitesse <= 39.7) {
			vitesse = vitesse + 0.3;
		} else {
			vitesse = 40;
		}
	} else {
		if (vitesse > 0) {
			vitesse = vitesse - 0.1;
		} else {
			vitesse = 0;
		}
	}
	previous_hand_position = hand_position;
}

function animationLoop() {
	ctx_vitesse.clearRect(0,0,600,600)
	moveVitesse();
	drawVitesse();
}

function init_compteur() {
	duree = 0;
	vitesse = 0;
	vitesse_cpt = 0;
	canvas_compteur  = document.querySelector('#compteur');
	canvas_vitesse  = document.querySelector('#vitesse');
	ctx_compteur = canvas_compteur.getContext('2d');
	ctx_vitesse = canvas_vitesse.getContext('2d');

	drawCompteur();

	setInterval(animationLoop, 1000 / 60);
}

function init_leap(){
	current_hand_pos = 0;
	Leap.loop(function (frame) {
		// If there's at least one hand
		if(frame.hands.length > 0) {
			frame.hands.forEach(function(hand, index) {
				// If it's left hand
				if(hand.type == "left") {
					left_hand_present = true;
				} else {
					left_hand_present = false;
					// Get right hand informations on Z axis
					hand_position = Math.round(hand.palmPosition[2]);
					hand_grab = hand.grabStrength;
				}
			});
		} else {
			left_hand_present = false;
		}
	});
}

window.onload = function() {
	$("main").css("margin-top", ($(window).height() - $("main").height() ) / 2);
	init_compteur();
	init_leap();
};
