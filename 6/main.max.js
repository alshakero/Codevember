'use strict';
(function()
{
var div =  document.getElementById('click-to-start');

    var canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    var danceScaneX = window.innerWidth / 1280;
    var danceScaneY = window.innerHeight / 720;

    var duration;

    var centerx = canvas.width / 2;
    var centery = canvas.height / 2;

    var context = canvas.getContext('2d');
    var SoundBuffer;
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContext = new AudioContext();
    var analyser;
    var source;
    var audioDataArray;
    var audioFreqDataArray;

    var currentRMS = 0;
    var isStarted = false;
    var availableFreqs = 0;
    var clusteredFreqData = new Array(10);
    var currentFrame;
    var blendModes = ['source-over', 'source-in', 'source-out', 'source-atop', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'lighter', 'copy', 'xor', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'];


    function showStartButton()
    {
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
    function drawBackground()
    {
        context.fillStyle = currentRMS > 0.6 ? '#999' : '#111';
        context.fillRect(0,0, canvas.width, canvas.height);

        for (var i = 1; i < 9; i++) 
        {
        context.beginPath();
        var x = window.innerWidth / 9;
        x = i * x;
        context.fillStyle = 'hsl(' +  (250 + clusteredFreqData[i] / 2) +',100%,20%)';
        context.arc(x, window.innerHeight / 2 , window.innerHeight / 6  + clusteredFreqData[i] , 0, 2 * Math.PI);
        context.fill();
        }

        var a = currentRMS * 900;
        var b = currentRMS * 20;
        context.beginPath();
        for (var i = 0; i < 720; i++) {

            var angle = i / 360 * Math.PI;
            var x = centerx + (a * Math.sin(b * angle)) * Math.cos(angle);
            var y = centery + (a * Math.sin(b * angle)) * Math.sin(angle);
            context.lineWidth= currentRMS * 10;
            context.lineTo(x, y);
        }
        context.strokeStyle = 'hsl('+ (currentRMS * 200) +',100%,70%)';
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
        currentFrame = index;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.globalCompositeOperation = blendModes[Math.floor(context.currentTime / 240) * 25];
        drawBackground();

        if(index - lastBomb < 100)
        {
            drawCopies(frame);   
        }    
        if(clusteredFreqData[4] > 190)
        {
            drawCopies(frame);
            lastBomb = index;
        }

        
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

            context.fillStyle = '#00b0c6';
            context.fill();
        }
        
        
    }
    var currentIndex = 0;

    function loadAudio(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    
    request.onprogress = function(oEvent)
    {        
        var percentComplete = oEvent.loaded / 7756854
        div.innerHTML = 'Loading music (' + (80 + Math.floor(percentComplete * 20)) + '%)';
    }
    request.onerror = function(event) {        
        div.innerHTML = "Couldn't load music, please reload the page";
    };

    request.onload = function() {
        audioContext.decodeAudioData(request.response, function(buffer) {
        SoundBuffer = buffer;	
        showStartButton();
        }, function(){});
    }
    request.send();
    }    

    function maxWindow() {
        var isInFullScreen = (document.fullScreenElement && document.fullScreenElement !== null) ||    // alternative standard method  
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
                div.innerHTML ="Thank you for watching! Please watch the original video <a href='https://www.youtube.com/watch?v=0ORaAnJYROg' target='blank'>here</a>";
                div.innerHTML +='<div><div class="fb-share-button" data-href="https://www.omaralshaker.com/Codevember/4/" data-layout="button_count" data-size="small" data-mobile-iframe="true"><a class="fb-xfbml-parse-ignore" target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.omaralshaker.com%2FCodevember%2F4%2F&amp;src=sdkpreparse">Share</a></div><div>';
                try
                {
                        FB.XFBML.parse();
                }
                catch(e){};
                div.style.display = 'block';    
            }
            render();

        }
        catch(ex) {console.log(ex)}
    }

    function render()
    {
        var total = 0;
        var i = 0;
        var floato;
        
        analyser.getByteTimeDomainData(audioDataArray);
        while ( i < audioDataArray.length ) {
            var floato = ( audioDataArray[i++] / 0x80 ) - 1;
            total += ( floato * floato );
        }
        currentRMS = Math.sqrt(total / audioDataArray.length);     

        var frame = Math.floor(audioContext.currentTime * 27.1);
        if(frame < data.length)
        {
                drawFrame(window.data[frame], frame);            
                analyser.getByteFrequencyData(audioFreqDataArray);
                for(var bar = 0; bar < 10 ; bar++)
                {
                    clusteredFreqData[bar] = 0;
                    var start = bar * 10;
                    var end = start + (bar * (availableFreqs / 10));
                    var avg = 0;
                    for(var i = start; i < end; i++)
                    {
                            avg += audioFreqDataArray[i]|0;
                    }
                    avg = avg / (end - start);
                    clusteredFreqData[bar] = avg;
                }
                requestAnimationFrame(render);
        }
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
function loadDanceData()
{
    var req = new XMLHttpRequest();
    // report progress events
    req.addEventListener("progress", function(event) {
        var percentComplete = event.loaded / 16396407;
        div.innerHTML = 'Loading dance data (' + (Math.floor(percentComplete * 80)) + '%)';        
    }, false);

    // load responseText into a new script element
    req.onload = function(event) {        
        eval(req.responseText);
        loadAudio('audio.mp3');
    }

    req.onerror = function(event) {        
        div.innerHTML = "Couldn't load dance data, please reload the page";
    }
    
    req.open("GET", "dancing_data.js");
    req.send();
}
loadDanceData()})();