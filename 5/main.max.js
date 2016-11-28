'use strict';
(function()
{
    var div =  document.getElementById('click-to-start');

    var canvas = document.getElementById('canvas');
    var bgCanvas = document.getElementById('bgCanvas');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;

    var danceScaneX = window.innerWidth / 1280;
    var danceScaneY = window.innerHeight / 720;

    var duration;

    var centerx = canvas.width / 2;
    var centery = canvas.height / 2;

    var context = canvas.getContext('2d');
    var bgContext = bgCanvas.getContext('2d');

    var gameOver = false;
    
    var stopPlayRateInterval;

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
    var currentTime = Date.now();
    var startTime = Date.now();
    var secondsPassed = 0;

    var currentBoostFactor = 0.1;
    var currentBirdY = window.innerHeight / 2;
    var mouseDown = false;

    function playGameAgain()
    {
        gameOver = false;
        console.log(window);
        currentTime = Date.now();
        startTime = Date.now();        
        secondsPassed = 0;
        currentBirdY = window.innerHeight / 2;
        currentBoostFactor = 0.1;
        currentFrame = 0;
        playSound();
        gameOver = false;
        
        console.log("PG: " + gameOver);
    }

    function showStartButton()
    {
        if(window.innerWidth < window.innerHeight)
        {
            div.innerHTML = 'Please rotate your device to watch horizontally ';
        }
        else
        {
            div.innerHTML = "<div><p>Tap, click, or press any key to fly! That's it :D</p></div>";
            var h3 = document.createElement('h3');
            h3.innerHTML = '[ Go! ]';
            h3.addEventListener('click', divOnclick);
            div.appendChild(h3);
        }
    }
    var stars = [];
    function generateStars()
    {
        var xMax = window.innerWidth;
        var yMax = window.innerHeight;
        
        var hmTimes = Math.round(xMax + yMax);	
        stars = [];
        for(var i=0; i<=hmTimes; i++) {
            var randomX = Math.floor((Math.random()*xMax)+1);
            var randomY = Math.floor((Math.random()*yMax)+1);
            var randomSize = Math.floor((Math.random()*2)+1);
            var randomOpacityOne = Math.floor((Math.random()*9)+1);
            var randomOpacityTwo = Math.floor((Math.random()*9)+1);
            var randomHue = Math.floor((Math.random()*360)+1);

            stars.push([randomX, randomY, randomSize, randomOpacityOne, randomOpacityTwo, randomHue, Math.floor((Math.random()*15)+5)]);            
        }
    }
    generateStars();
    function drawStars()
    {
       bgContext.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
       for(var i=0; i<stars.length; i++) {
            stars[i][0] = stars[i][0] > 1 ? stars[i][0] - (4 + (secondsPassed / 5)) : window.innerWidth;
            bgContext.fillStyle = "hsla("+ stars[i][5]+", 30%, 10%, ."+ stars[i][3]+stars[i][4]+")";
            bgContext.fillRect(stars[i][0], stars[i][1],  stars[i][2], stars[i][2]);
        }
    }
    function dist(x1,y1, x2, y2)
    {
       return Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
    }
    function drawBackground(frame, pos)
    {       
       // context.clearRect(0, 0, canvas.width, canvas.height);
        drawStars();

        var tempTime = Date.now() - currentTime;
        var minutesPassed = tempTime / 60000;
        var hardness = 5 - minutesPassed;

        var minLevel = window.innerHeight /  hardness;        
        
        var angleShift = Math.PI * (tempTime / (700 - secondsPassed));
        
        var amplitude = minLevel;

        context.beginPath();
        context.moveTo(0, 0);
        for (var i = 0; i <= window.innerWidth + 10; i+=10) 
        {           
            var angle = 10 * (i / window.innerWidth) * Math.PI;
            var x = i * 2;
            var y = minLevel + Math.cos(angle + angleShift) * currentRMS * amplitude;
            
            if(y < 0 || dist(x,y, pos[0], pos[1]) < (secondsPassed / 10)  + window.innerHeight / 30) {
                gameOver = true;
            }
            context.lineTo(x,y);             
        }
        context.lineTo(window.innerWidth, 0);     
        context.fillStyle = '#5abdd2'; //hsl(' +  (250 + clusteredFreqData[i] / 2) +',100%,20%)';
        context.fill();
        minLevel = window.innerHeight - (window.innerHeight / hardness);        

        context.beginPath();
        context.moveTo(0, window.innerHeight);
        for (var i = 0; i <= window.innerWidth + 10; i+=10) 
        {           
            var angle = 10 * (i / window.innerWidth) * Math.PI;
            var x = i * 2;
            var y = minLevel + Math.sin(angle + angleShift) * currentRMS * amplitude;
            if(y > window.innerHeight || dist(x,y, pos[0], pos[1]) < (secondsPassed / 10)  + window.innerHeight / 30) {
                gameOver = true;
            }
            context.lineTo(x,y);             
        }
        context.lineTo(window.innerWidth, window.innerHeight);     
        context.fillStyle = '#147891'; //hsl(' +  (250 + clusteredFreqData[i] / 2) +',100%,20%)';
        context.fill();

        //stop sound effect
        if(gameOver)
        {
            stopPlayRateInterval = setInterval(function()
            {
                if(source.playbackRate.value < 0) {                    
                    clearInterval(stopPlayRateInterval);
                    source.stop();
                }
                source.playbackRate.value -= 0.01;
            }, 10);
        }
        
        //draw score
        context.fillStyle = '#6eff6b';
        context.font = window.innerWidth / 50 + "px Coiny";
        context.fillText("Score: " + Math.floor(10 * secondsPassed), 10, window.innerWidth / 50);        
    }
    var lastFrameTime = Date.now();
    function drawBird()
    {
        var radius = (secondsPassed / 10)  + window.innerHeight / 30;
        context.beginPath();
        var x = window.innerWidth / 9 + (secondsPassed / 230) * (window.innerWidth / 2);
        context.arc(x, currentBirdY, radius, 0, Math.PI * 2);
        context.fillStyle = '#ff005a'; 
        context.fill();    

        if(secondsPassed > 8)
        {
            currentBirdY += currentBoostFactor;    
            
            var pureFactor = (Date.now() - lastFrameTime) / radius;

            if(mouseDown)     
            {
                if(currentBoostFactor > -10)
                    currentBoostFactor += -pureFactor;
            }  
            else if(currentBoostFactor < 10)             
            {
                currentBoostFactor += pureFactor;
            }

            lastFrameTime = Date.now();
        }
        else
        {
            lastFrameTime = Date.now();
            context.fillStyle = '#6eff6b';
            context.font = window.innerWidth / 10 + "px Coiny";
            context.fillText(Math.floor(8 - secondsPassed), window.innerWidth /2 - window.innerWidth / 20, window.innerHeight / 2);
        }        

        return [x, currentBirdY];
    }
    window.onmousedown = function()
    {
       mouseDown = true;
    }
    window.onmouseup = function()
    {
       mouseDown = false;
    }
    window.onkeydown = function()
    {
       mouseDown = true;
    }
    window.onkeyup = function()
    {
       mouseDown = false;
    }
    window.ontouchstart = function()
    {
       mouseDown = true;
    }
    window.ontouchend = function()
    {
       mouseDown = false;
    }
    window.onclick = function()
    {
        if(event.target.id === 'playagain')
            playGameAgain();
    }
    function drawFrame(frame)
    {        
        context.clearRect(0, 0, canvas.width, canvas.height);
        var birdPos = drawBird();
        drawBackground(frame, birdPos);        
    }
    var currentIndex = 0;

    function loadAudio(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    
    request.onprogress = function(oEvent)
    {        
        var percentComplete = oEvent.loaded / 4759968;
        div.innerHTML = 'Loading music (' + Math.floor(percentComplete * 100) + '%)';
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

        console.log("playSound: " + gameOver);

        if(isStarted) return;
        isStarted = true;

        document.getElementById('click-to-start').style.display = 'none';
        //try
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
                isStarted = false;
                
                div.innerHTML ="<h3>Your score is <strong> " + Math.floor(secondsPassed * 10) + "</strong>!";
                var btn = document.createElement('button');
                btn.id = 'playagain';
                
                btn.innerHTML = "Play Again";
                div.appendChild(btn);

                div.innerHTML +='<div><div class="fb-share-button" data-href="https://www.omaralshaker.com/Codevember/5/" data-layout="button_count" data-size="small" data-mobile-iframe="true"><a class="fb-xfbml-parse-ignore" target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.omaralshaker.com%2FCodevember%2F5%2F&amp;src=sdkpreparse">Share</a></div><div>';
                try
                {
                        FB.XFBML.parse();
                }
                catch(e){};
                div.style.display = 'block';    
            }
            currentTime = Date.now();
            startTime = Date.now();
            secondsPassed = 0;
            render();

        }
        //catch(ex) {console.log(ex)}
    }
    function render()
    {
        if(gameOver) return;
        
        secondsPassed = (Date.now() - startTime) / 1000;
        var total = 0;
        var i = 0;
        var floato;
        
        analyser.getByteTimeDomainData(audioDataArray);
        while ( i < audioDataArray.length ) {
            var floato = ( audioDataArray[i++] / 0x80 ) - 1;
            total += ( floato * floato );
        }
        currentRMS = Math.sqrt(total / audioDataArray.length);     

        if(audioContext.currentTime < 240)
        {
                drawFrame();            
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
                setTimeout(render, 1000/60);
        }
    }
    window.onresize = function()
    {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight; 

        centerx = canvas.width / 2;
        centery = canvas.height / 2;

        generateStars();

        currentBirdY = window.innerHeight / 2;

        danceScaneX = window.innerWidth / 1280;
        danceScaneY = window.innerHeight / 720;

        var div = document.getElementById('click-to-start');

        if(window.innerWidth < window.innerHeight)
        {
            div.innerHTML = 'Please rotate your device to watch horizontally';
        }
        else if(!gameOver)
        {
            div.innerHTML = "<div><p>Tap, click, or press any key to fly! That's it :D</p></div>";
            var h3 = document.createElement('h3');
            h3.innerHTML = '[ Go! ]';
            h3.addEventListener('click', divOnclick);
            div.appendChild(h3);
        }    
    }
    var divOnclick = function() { playSound(); maxWindow() }
loadAudio('audio.mp3');
})();
