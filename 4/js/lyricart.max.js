var textDisplay  = document.getElementById('screen');	
var textDisplayContext = textDisplay.getContext('2d');
	
var currentText = "AL PACINO";
var currentSize = 30;

var starsDisplay = document.getElementById('stars');
var ctx = starsDisplay.getContext('2d');

var xMax = starsDisplay.width = $(window).width();
var yMax = starsDisplay.height = $(window).height();

var SoundBuffer;

var startedAt;
var pausedAt = 0;
var paused;
var timesOuts;

var hmTimes = Math.round(xMax + yMax);	
var stars;
function generateStars()
{
	stars = []
	var xMax = starsDisplay.width = $(window).width();
	var yMax = starsDisplay.height = $(window).height();
	for(var i=0; i<=hmTimes; i++) {
		var randomX = Math.floor((Math.random()*xMax)+1);
		var randomY = Math.floor((Math.random()*yMax)+1);
		var randomSize = Math.floor((Math.random()*2)+1);
		var randomOpacityOne = Math.floor((Math.random()*9)+1);
		var randomOpacityTwo = Math.floor((Math.random()*9)+1);
		var randomHue = Math.floor((Math.random()*360)+1);
		if(randomSize>1) {
			ctx.shadowBlur = Math.floor((Math.random()*15)+5);
			ctx.shadowColor = "white";
		}
		stars.push(new Array(randomHue,randomOpacityOne/10,randomX, randomY, randomSize, randomSize));
	}
}
generateStars();
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
function drawStars(rms, location)
{		
	var xMax = starsDisplay.width = $(window).width();
	var yMax = starsDisplay.height = $(window).height();
	for(var i=0; i<stars.length; i++) {
		var currentStars = stars[i];
		
		
		if(location > 0.99)		
		{
			currentStars[5]+=2;
			currentStars[4]-=0.1;
			currentStars[1]-=0.011;
			currentStars[1] = Math.max(currentStars[1], 0);
			rms = 0;
		}
		ctx.fillStyle = "hsla("+(currentStars[0])+", 30%, 80%,"+(currentStars[1])+")";
	
		if(i % 2 == 0)
		{
			currentStars[2]+=rms * 4 + (2 * location);
			currentStars[2] = currentStars[2] > xMax ? 0 : currentStars[2];
			ctx.fillRect(currentStars[2], currentStars[3], currentStars[4] + rms, currentStars[5] + rms);
		}
		else
		{
			currentStars[2]-=rms * 4 + (2 * location);
			currentStars[2] = currentStars[2] < 0 ? xMax : currentStars[2];
			ctx.fillRect(currentStars[2], currentStars[3], currentStars[4] + rms, currentStars[5] - rms);
		}
	}
}
var backTextLoc = 0;
var backText = "THREE MINUTES";
function drawText(text, size, radius)
{			
	text = text.toUpperCase();	
	
	if(text.trim().length == 0) return;
	
	textDisplay.height = $(window).height();
	
	var xMax = textDisplay.width = $(window).width();
	var yMax = textDisplay.height = $(window).height();	
	
	radius = Math.floor(radius / 2);
	radius += Math.floor(size / 2);
	
	
	//draw main text
	textDisplayContext.font = size + "px Oswald";
	textDisplayContext.fillStyle = "rgba(255, " + (255 - radius) + ", "  + (255 - radius) + ", 1)";				
	textDisplayContext.textAlign="center"; 
	textDisplayContext.fillText(text, textDisplay.width/2, (textDisplay.height/2) - 40);
	
	//draw big background text
	
	textDisplayContext.font = 500 + "px Oswald";
	textDisplayContext.fillStyle = "rgba(255,255,255,0.2)";				
	textDisplayContext.textAlign="left";			
	textDisplayContext.fillText(backText, backTextLoc+=2, textDisplay.height - (textDisplay.height/5));
	if(backTextLoc > textDisplay.width)
	{
		backTextLoc = -textDisplay.width;
		backText = text;
	}

}			
function findSentenceDuration(line)
{
	var words = line.find('s');	
	words = words.slice(1);	
	var sum = 0;
	words.each(function(index, word)
	{
		sum += $(word).attr('t');
	});
	return sum;
}
function getWordsAndTimes(data)
{
	var TimedWords = [];
	data.each(function(i, el)
	{					
		var line = $(el);	
		var pointZero = parseInt(line.attr('t'));
		if(line.text().trim() == "") return;									

		var words = line.find('s');	
			
		if($(words[0]).text()) TimedWords.push({"text": $(words[0]).text(), "time": pointZero});
		words = words.slice(1);				
		
		words.each(function(index, word)
		{	
			if(!word || !$(word).text()) return;
			var text = $(word).text().trim();;
			var time = pointZero + parseInt($(word).attr('t'));		
			if(text)
				TimedWords.push({"text": text, "time": time});
		});
	});
	return TimedWords;
}
var TimedWords;
function FetchSubtitles()
{
	timesOuts = [];
	var text = $.get('images/text.xml', function(data)
	{		
		var items = $(data).find('body').find('p');
		TimedWords = getWordsAndTimes(items);
	});
}
FetchSubtitles();
function QueueSubtitles()
{
	timesOuts = [];
	TimedWords.forEach(function(el, i)
	{
		if(el.time < pausedAt) return;
		timesOuts.push(setTimeout(function() { currentText = el.text; }, el.time - pausedAt));	
	});
}
var chunkSize = 0;
// Fix up prefixing
window.AudioContext = window.AudioContext || window.webkitAudioContext;
 context = new AudioContext();
var analyser;
var dataArray;
var duration = 0;
var source;
function playSound() {

	try
	{
		analyser = context.createAnalyser();
		source = context.createBufferSource(); // creates a sound source
		source.buffer = SoundBuffer;                    // tell the source which sound to play
		source.connect(context.destination);       // connect the source to the context's destination (the speakers)
		source.connect(analyser); 
		
		if (pausedAt > 0) {
		   startedAt = Date.now() - pausedAt;
		   source.start(0, pausedAt / 1000);
		}
		else {
		   startedAt = Date.now();
		   source.start(0);
		}		
		paused = false;
		duration = SoundBuffer.duration;
		analyser.fftSize = 1024;
		var bufferLength = analyser.frequencyBinCount;
		analyser.smoothingTimeConstant = 0.5;
		dataArray = new Uint8Array(bufferLength);
		render();	
	}
	catch(ex) {alert(ex);}
}
function loadSpeech(url) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
	
  // Decode asynchronously
  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
	 SoundBuffer = buffer;	
	 showStartButton();
    }, function(){});
  }
  request.send();
}
var canStart = false;
var started = false;
var playing = false;
function startGame()
{
	if(!canStart) return;
	
	if(!playing)
	{
		playSound();
		QueueSubtitles(); 
		playing = true;
	}
	else
	{
		stop();
		playing = false;
	}
}
loadSpeech("images/LyricArt.mp3");
//keep rendering text

function averageRMS(arr)
{
	i = 0;
	total = 0;
	while ( i < arr.size ) {
	var float = ( arr[i++] / 0x80 ) - 1;
	total += ( float * float );
  }
  return Math.sqrt(total / arr.size );
}
var frameCount = 0;
var currentRadius = 125;

function render()
{			
	if(paused) return;
	var location = (((pausedAt / 1000) + context.currentTime) / duration);
	requestAnimationFrame(render);
	 var total = i = 0
	    , percentage
	    , float
	    , rms
	    , db;
	  analyser.getByteTimeDomainData(dataArray);
	  while ( i < dataArray.length ) {
		floato = ( dataArray[i++] / 0x80 ) - 1;
		total += ( floato * floato );
	  }
	  rms = Math.sqrt(total / dataArray.length);
	  fontsize = Math.pow(location * 25, 1.5) + 40 + (currentSize * rms);
	
	if(location >= 1)
	{
		$('#like-btn').show('slow');
	}
	if(location < 0.99)
	{
		drawText(currentText, fontsize, rms * 255);
		currentSize += 0.01;
		drawStars((rms * 5), location);
	}
	else
	{
		drawText("Omar Alshaker - 2016", 30, rms * 255);
		drawStars((rms * 5), location);
	}
	
}
drawStars(0.2, 0.1);
var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
drawText("LOADING...", 20, 50);
function showStartButton()
{
	canStart = true;
	if(iOS) drawText("TOUCH TO START", 20, 50);
	else drawText("CLICK TO START", 20, 50);
}
function stop() {
    source.stop(0);
    pausedAt = Date.now() - startedAt;
    paused = true;
    timesOuts.forEach(function(el)
    {
	clearTimeout(el);
    });
};
$(window).resize(generateStars);