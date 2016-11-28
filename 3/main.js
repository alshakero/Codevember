(function() {var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var danceScaneX = window.innerWidth / 1280;
var danceScaneY = window.innerHeight / 720;

var centerx = canvas.width / 2;
var centery = canvas.height / 2;

currentMouseX = 0;
currentMouseY = 0;

window.AudioContext = window.AudioContext || window.webkitAudioContext;


var context = canvas.getContext('2d');
var SoundBuffer;
var audioContext;
var analyser;
var source;
var audioDataArray;
var audioFreqDataArray;

var currentRMS = 0;
var isStarted = false;
var availableFreqs = 0;
var clusteredFreqData = new Array(10);

function showStartButton()
{
    var div = document.getElementById('click-to-start');
    if(window.innerWidth < window.innerHeight)
    {
        div.innerHTML = 'Please rotate your device to watch horizontally ';
    }
    else
    {
        div.innerHTML = 'Start!';
        div.onclick = function() { playSound(); maxWindow() }
    }
}

function archimedeanSpiral(context, a, b)
{
    var pureA = a;
    a = a * 100;
    b = b * 10;

    context.beginPath();
    for (i = a; i < a + 5000; i++) {
        angle = 0.2 * i;
        x = (currentMouseX * 100) + centerx + (a + b * angle) * Math.cos(angle);
        y = (currentMouseY * 100) + centery + (a + b * angle) * Math.sin(angle);
        context.lineWidth= pureA * 40;
        context.lineTo(x, y);
    }
    context.strokeStyle = 'hsl('+ (currentRMS * 25) +',70%, 15%)';
    context.stroke();


    context.beginPath();
    for (i = a; i < a + 1200; i++) {
        angle = 0.1 * i;
        x = (currentMouseX * 100) + centerx  + (a + b * angle) * Math.cos(angle);
        y = (currentMouseY * 100) + centery + (a + b * angle) * Math.sin(angle);
        context.lineWidth= pureA * 40;
        context.lineTo(x, y);
    }
    context.strokeStyle = 'hsl('+ (currentRMS * 65) +',100%,20%)';
    context.stroke();
}

function drawBackground(context)
{
    context.beginPath();         
    //context.moveTo(0, 0);      
            
    for(var x = 0; x < canvas.width; x++)
    {       
        var theta =  (x / canvas.width) * 40;
        context.lineWidth =  currentRMS * 5;
        var y =  (canvas.height / 2) + (canvas.width / x) * Math.cos(theta) * canvas.height / 2 * currentRMS;
        x *=  danceScaneX;
        y *=  danceScaneY;
        context.lineTo(x,y);
    }
    context.strokeStyle = 'hsl('+ (currentRMS * 180) +',100%,10%)';

    for(var x = 0; x < canvas.width; x++)
    {       
        var theta =  (x / canvas.width) * 40;
        context.lineWidth =  currentRMS * 5;
        var y =  (canvas.height / 2) + (canvas.width / x) * Math.cos(theta) * canvas.height / 2 * currentRMS;
        x *=  danceScaneX;
        y *=  danceScaneY;
        context.lineTo(x,y);
    }


    //context.closePath();
    context.strokeStyle = 'hsl('+ (currentRMS * 120) +',100%,10%)';
    context.stroke();
    
}
function drawCopies(frame)
{
    var RMSCache = currentRMS;
    for(var v = -9; v <9; v+=2)
    {
        var shift = v * 100;
        var color = 360 / (v + 1);
        for(var i = 0; i < frame.polygons.length; i++)
        {
            context.beginPath();
            var RMSCache = currentRMS;

            for(var j = 1; j < frame.polygons[i].points.length; j++)
            {
                var x =  frame.polygons[i].points[j].x * danceScaneX;
                var y =  frame.polygons[i].points[j].y * danceScaneY;

                context.lineTo(x + shift, y);
            }
            context.fillStyle = 'hsl('+ (color) +',100%,' + (RMSCache * 90) +'%)';
            context.fill();
        }
    }
}
var lastBomb = -100;
function drawFrame(frame, index)
{
    context.clearRect(0, 0, canvas.width, canvas.height);

    if(index - lastBomb < 100)
    {
        drawCopies(frame);   
    }    
    if(clusteredFreqData[8] > 100)
    {
        drawCopies(frame);
        lastBomb = index;
    }
    archimedeanSpiral(context, clusteredFreqData[5] / 120, 0.5);
    
    for(var i = 0; i < frame.polygons.length; i++)
    {
        context.beginPath();
        var minX = 5000;
        var maxX = 0;


        for(var j = 1; j < frame.polygons[i].points.length; j++)
        {
                var x =  frame.polygons[i].points[j].x * danceScaneX;
                var y =  frame.polygons[i].points[j].y * danceScaneY;

                if(x < minX) minX = x;
                if(y > maxX) maxX = x;

                context.lineTo(x, y);
        }
        centerx = (minX + maxX) / 2;    
        
        context.closePath();

        context.fillStyle = 'hsl('+ (currentRMS * 360) +',100%,60%)';
        context.fill();
    }
    
    
}
var currentIndex = 0;

function loadAudio(url) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
	
  // Decode asynchronously
  request.onload = function() {
    audioContext = new AudioContext();
    audioContext.decodeAudioData(request.response, function(buffer) {
	 SoundBuffer = buffer;	
	 showStartButton();
     console.log('decoded');     
    }, function(){});
  }
  request.send();
}

loadAudio('audio.mp3');

function maxWindow() {

    var isInFullScreen = (document.fullScreenElement && document.fullScreenElement !==     null) ||    // alternative standard method  
            (document.mozFullScreen || document.webkitIsFullScreen);

    var docElm = document.documentElement;
    if (!isInFullScreen) {

        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        }
        else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        }
        else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        }
    }
}

function playSound() {

    if(isStarted) return;
    audioContext = new AudioContext();
    isStarted = true;

    document.getElementById('click-to-start').style.display = 'none';
	try
	{
		analyser = audioContext.createAnalyser();
		source = audioContext.createBufferSource(); // creates a sound source
		source.buffer = SoundBuffer;                    // tell the source which sound to play
		source.connect(audioContext.destination);       // connect the source to the audioContext's destination (the speakers)
		source.connect(analyser); 

        source.start(0);
	
		duration = SoundBuffer.duration;
		analyser.fftSize = 1024;
		var bufferLength = analyser.frequencyBinCount;
		analyser.smoothingTimeConstant = 0.5;
		audioDataArray = new Uint8Array(bufferLength);
        availableFreqs = analyser.frequencyBinCount;
        audioFreqDataArray = new Uint8Array(availableFreqs);

        source.onended = function()
        {
             var div =  document.getElementById('click-to-start');
             div.innerHTML ="Thank you for watching! Please watch the original video <a href='https://www.youtube.com/watch?v=qb37OjClUAg' target='blank'>here</a>";
            div.innerHTML +='<div><div class="fb-share-button" data-href="https://www.omaralshaker.com/Codevember/3/" data-layout="button_count" data-size="small" data-mobile-iframe="true"><a class="fb-xfbml-parse-ignore" target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.omaralshaker.com%2FCodevember%2F3%2F&amp;src=sdkpreparse">Share</a></div><div>';
            try
            {
                    FB.XFBML.parse();
            }
            catch(e){};
             div.style.display = 'block';    
        }
        render();

	}
	catch(ex) {alert(ex);}
}

function render()
{
    var total = 0;
    var i = 0;

	  analyser.getByteTimeDomainData(audioDataArray);
	  while ( i < audioDataArray.length ) {
		floato = ( audioDataArray[i++] / 0x80 ) - 1;
		total += ( floato * floato );
	  }
	  currentRMS = Math.sqrt(total / audioDataArray.length);     

      var frame = Math.floor(audioContext.currentTime * 20.1);
      if(frame < data.length)
      {
            drawFrame(data[frame], frame);
        
            analyser.getByteFrequencyData(audioFreqDataArray);
            for(var bar = 0; bar < 10 ; bar++)
            {
                clusteredFreqData[bar] = 0;
                var start = bar * 10;
                var end = start + (bar * (availableFreqs / 10));
                var avg = 0;
                for(var i = start; i < end; i++)
                {
                        avg += audioFreqDataArray[i];
                }
                avg = avg / audioFreqDataArray.length;
                clusteredFreqData[bar] = avg;
            }
            requestAnimationFrame(render);
      }
}
window.onmousemove = function()
{
    currentMouseX = event.clientX / window.innerWidth;
    currentMouseY = event.clientY / window.innerHeight;
}
window.ondeviceorientation = function()
{
    currentMouseX = event.beta / 90;
    currentMouseY = event.gamma / 90;
}
window.onresize = function()
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    centerx = canvas.width / 2;
    centery = canvas.height / 2;

    danceScaneX = window.innerWidth / 1280;
    danceScaneY = window.innerHeight / 720;

    var div = document.getElementById('click-to-start');

    if(window.innerWidth < window.innerHeight)
    {
        div.innerHTML = 'Please rotate your device to watch horizontally';
    }
    else
    {
        div.innerHTML = 'Start!';
        div.onclick = function() { playSound(); maxWindow() }
    }    
}
})()