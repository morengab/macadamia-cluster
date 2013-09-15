$j = jQuery.noConflict();
jQuery.fx.interval = 5;
var bpm = 134;
var speed = (1000/(bpm/60))*8;
var height = 800;
var width = 180;
var beat = (60000/bpm);
var started = false;
var gameloop;
var tupleloop = [];
var game;
var selectedIcons;
var userSelected = [];
var currentIcon = 0;

$j(document).ready(function () {
	
	//show modal on page load
	$j('#my-modal').reveal({
     animation: 'fade',                   //fade, fadeAndPop, none
     animationspeed: 300,                       //how fast animtions are
     closeonbackgroundclick: false
     });

	$j('#my-modal').trigger('reveal:open');

	//create game objects
	//selectedIcons = $j.get("getShortcuts.php", { app_name: "Photoshop" }, {} ,  );
	
	$j.ajax({
		url: "getShortcuts.php",
		data: {app_name: "Photoshop"},
		success: function (response) {
			selectedIcons = response;
		},
		dataType: "json"
	});
	
	
	$j("#music").jPlayer({
		ready: function () {
			$j(this).jPlayer("setMedia", {
				mp3: "media/magicposition.mp3"
			});
			},
		swfPath: "js",
		loop: false,
		repeat: function(event) {
			if (event.jPlayer.options.loop)
			{
				
			} else {
				$j(this).unbind(".jPlayerRepeat");
				if (started){
					game.gameWon();
				}
			}
		},
		supplied: "mp3",
	});

	//clicking start will close the modal
	// and start the game
	$j("#start").click(function () {
		if (userSelected.length == 4)
		{
		$j("#my-modal").trigger('reveal:close');
		resetScoring();
		$j("#lifebar").css("background", "rgba(13, 33, 54, 1.0)");
		$j("#gameOver").remove();
		$j("#music").jPlayer("play", 0);

		$j("#col1-board .icon-background").css("background-image", "url('" + selectedIcons[userSelected[0]].image + "')" );
		$j("#col2-board .icon-background").css("background-image", "url('" + selectedIcons[userSelected[1]].image + "')" );
		$j("#col3-board .icon-background").css("background-image", "url('" + selectedIcons[userSelected[2]].image + "')" );
		$j("#col4-board .icon-background").css("background-image", "url('" + selectedIcons[userSelected[3]].image + "')" );
		game = new Game();
		game.runGame();
		started = true;
		}
		else
		{
			alert("Choose 4 icons");
		}
	});

	//create keyboard mapping
	$j("#new-game").click(function () {
		//userSelected = [];
		
		$j('#my-modal').reveal({
	    	animation: 'fade',                   //fade, fadeAndPop, none
	    	animationspeed: 300,                       //how fast animtions are
	    	closeonbackgroundclick: false
	    });
		$j('#my-modal').trigger('reveal:open');
		
		game.endGame();
		$j(".icon").remove();
		resetScoring();
		$j("#lifebar").css("background", "rgba(13, 33, 54, 1.0)");
		$j("#gameOver").remove();
		$j("#music").jPlayer("stop");
		started = false;

	});
	
	//create modal handler
	$j("#reset").click(function () {
		//$("#my-modal").modal(); 
		
		
			game.endGame();
			$j(".icon").remove();
			resetScoring();
			$j("#lifebar").css("background", "rgba(13, 33, 54, 1.0)");
			$j("#gameOver").remove();
			game = new Game();
			game.runGame();
			$j("#music").jPlayer("play", 0);
			started = true;

	});
	
	$j("#icon_holder").on("click", ".icon_selector", function () {
		console.log(this);
		if (!$j(this).hasClass("active") && userSelected.length < 4) {
			userSelected[currentIcon] = $j(this).attr("data-id");			
			$j(".active-selections").append("<li id=\"" + $j(this).attr("data-id") + "\">"+ $j(this).attr("data-name") + " (" + $j(this).attr("data-shortcut") + ")</li>");
			$j(this).addClass("active");
			currentIcon++;	
		} else if ($j(this).hasClass("active")) {
			$j(this).removeClass("active");
			$j("#" + $j(this).attr("data-id")).remove();
			
			userSelected.remove($j(this).attr("data-id"));
			currentIcon--;
		}
		
		console.log(userSelected);
	});
});

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};
	

function Game() {
	//parameters
	//icons being used
	//
}


Game.prototype.animate = function(current) {
	var self = current;
	$j(current.icon).animate({
		"top" : "-200"	
		}, {
			easing: "linear",
			duration: speed,
			complete: function () {
				 $j(this).remove();
				 current.removeKeyMap();
			},
			step: function(now, fx) {
				var pos = $j(fx.elem).position();
				if (parseInt(pos.top) <= 50 && parseInt(pos.top) >= -50 && self.state == 0)
				{
					$j(this).addClass("active");
					self.setActive();
				}
				else if (parseInt(pos.top) <= -50 && self.state != 2)
				{
					// missed!
					scoreWrongAnswer();
					self.state = 2;
					if (isGameOver()){
						game.endGame();
						$j(".icon").remove();
						$j("#lifebar").css("background", "#5f2136");
						$j("#board").append("<span class='points' id=\"gameOver\"style=\"margin-top:400px; font-size: 5em; color:white;\"><center><b>GAME OVER</b><center></span>");
						$j("#music").jPlayer("stop");
						started = false;
					}
				}
			
			}	
			
		});		
		 
		
}


Game.prototype.endGame = function () {
	
	clearInterval(gameloop);
	for (var i = 0; i < tupleloop.length; i++)
	{
		clearTimeout(tupleloop[i]);
	}
	
	
}


Game.prototype.runGame = function () {
		var self = this;
		gameloop = setInterval(function () {self.setLoop()}, beat * 4);
}

Game.prototype.gameWon = function () {
	
		//game is over!
	
}

Game.prototype.setLoop = function (i) {
	//create the beat tuples widths
	var tuple1 = [0, width, width*2, width*3];
	var tuple2 = [0, 0, width, width];
	var tuple3 = [width, width*2, 0, width*3];
	var tuple4 = [width*3, width*3, width, width];
	var tuple5 = [width*2, width*3, width*1, 0];
	var random_tuple = [tuple1, tuple2, tuple3, tuple4, tuple5];
	var setRandom = Math.ceil(Math.random()*4);
	for (var i = 0; i <= 3; i++)
	{
		this.runLoop(random_tuple[setRandom], i);
	}		
}

Game.prototype.runLoop = function (set_tuple, runCount) {
	var self = this;
	tupleloop[runCount] = setTimeout(function () {
		var swimlane = set_tuple[runCount] / width;
		var currIcon = selectedIcons[userSelected[swimlane]];
		var icon = new Icon(currIcon.shortcut, currIcon.name, currIcon.image);
		icon.setKeyMap();
		icon.draw(set_tuple[runCount], height);
		self.animate(icon);
	}, runCount * beat);
}
	
//assign icons
function Icon(keymap, label, image) {
	this.uniq = new Date().getUTCMilliseconds();
	//Ctrl+S
	this.keymap = keymap;
	
	//active, inactive
	this.state = 0;
	
	//position (x,y)
	this.positionX = 0;
	this.positionY = 0;
	
	//label
	this.label = label;
	this.image = image;
	this.value = 10;
	this.value_neg = -5;
	this.icon = 0;
}



Icon.prototype.setKeyMap = function () {
	var el = this;
	$j(document).bind("keypress", el.keymap, function () {
		if (el.state == 1)
		{

			$j("#" + el.uniq).addClass("press");
			el.state = 2;
			scoreCorrectAnswer();
			debugScoring();
		}
	});	

}


Icon.prototype.removeKeyMap = function () {
	this.state = 0;
}

Icon.prototype.draw = function (x, y) {
	
	var icon_item = $j("<div/>", {
		id: this.uniq,
		class: "icon"
	});
	
	icon_item.html("<span>" + this.keymap + "</span>");
	
	icon_item.css("left", parseInt(x + 30) + "px");
	icon_item.css("top", y + "px");
	icon_item.css("background", "url('" + this.image + "') top left no-repeat transparent");
	icon_item.css("background-size", "cover");
	this.icon = icon_item;
	$j("#board").append(icon_item);
}

Icon.prototype.setActive = function () {
	
	this.state = 1;
	
}

//play audio

