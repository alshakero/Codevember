var canvas = document.getElementById('myCanvas');
canvas.setAttribute('width', window.innerWidth);
canvas.setAttribute('height', window.innerHeight);

var rightOscillator;
var leftOscillator;

var context = canvas.getContext('2d');
var centerx = window.innerWidth / 2;
var centery = window.innerHeight / 2;
var functionIndex = false;
var currentA = 1;
var currentB = 1;
var currentPureA = 0;
var currentPureB = 0;
var volume = 0;
var panNode;

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();

var plotEquation = function() {

context.clearRect(0,0,window.innerWidth,window.innerHeight);        
context.moveTo(centerx, centery);

context.beginPath();

archimedeanSpiral(context, currentA, currentB);

context.strokeStyle = 'hsl('+ (currentPureA * 360) +',100%,60%)';
context.stroke();
requestAnimationFrame(plotEquation);

};
function archimedeanSpiral(context, a, b)
{
    var pureA = a;
    a = a * 100;
    b = b * 10;
    for (i = a; i < a + 6000; i++) {
        angle = 0.1 * i;
        x = centerx + (a + b * angle) * Math.cos(angle);
        y = centery + (a + b * angle) * Math.sin(angle);
        context.lineWidth=pureA * 40;
        context.lineTo(x, y);
    }
}
function bindall()
{
    window.onmousemove = function()
    { 
        
        currentPureA = event.clientX / window.innerWidth;
        currentPureB = event.clientY / window.innerHeight;
        
        currentA = Math.pow(currentPureA + 0.5, 2);
        currentB = Math.pow(currentPureB + 0.5, 2);
        try
        {
            leftOscillator.frequency.value = 50 + (currentPureB * 400); // value in hertz
            rightOscillator.frequency.value = 50 + (currentPureA * 500); // value in hertz
        }
        catch(e) {}
        // from [-1, 1]
        if(typeof panNode !== 'undefined') panNode.pan.value = 2 * ((currentPureA) - 0.5);
        
    };
    window.ondeviceorientation = function()
    {
        currentPureA = event.gamma / 90;
        currentPureB = event.beta / 90;
        
        currentA = Math.pow(currentPureA + 0.5, 2);
        currentB = Math.pow(currentPureB + 0.5, 2);
        
        try
        {
            rightOscillator.frequency.value = Math.abs(50 + ((currentPureA + currentPureB / 2)  * 400)); // value in hertz
            leftOscillator.frequency.value = Math.abs(350 - rightOscillator.frequency.value);

        }
        catch(e) {}
    }
}
// to prevent bouncing on iOS touch
window.ontouchmove = function()
{   
    event.preventDefault();
};

//this is to smoothen the senser data. Too sketchy without it.
var lastGammas = [];
var lastBetas = [];
function avg(arr)
{
    var sum = 0;
    for(var i = 0 ;i < arr.length; i++)
        sum += arr[i];
    return sum / arr.length;
}

window.onresize = function()
{
    centerx = window.innerWidth / 2;
    centery = window.innerHeight / 2;
    canvas.setAttribute('width', window.innerWidth);
    canvas.setAttribute('height', window.innerHeight);
}
try
{
    // create web audio api context
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var gainNode = audioCtx.createGain();

    // create left channel Oscillator node
    leftOscillator = audioCtx.createOscillator();
    leftOscillator.type = 'sine';
    leftOscillator.channelCountMode = 'explicit';
    leftOscillator.channelCount = 1;
    leftOscillator.frequency.value = 500; // value in hertz

    // create right channel Oscillator node
    rightOscillator = audioCtx.createOscillator();
    rightOscillator.type = 'sine';
    rightOscillator.channelCountMode = 'explicit';
    rightOscillator.channelCount = 1;
    rightOscillator.frequency.value = 100; // value in hertz

    var merger = audioCtx.createChannelMerger(2);
    
    console.log('conecting left');    
    leftOscillator.connect(merger, 0, 0);

    console.log('conecting right');
    rightOscillator.connect(merger, 0, 1);
    
    console.log('Both connected!');

    merger.connect(gainNode);
    
    gainNode.connect(audioCtx.destination);
    canvas.onclick = function()
    {
        if(started) gainNode.gain.value = Math.abs(gainNode.gain.value - 1);
        plotEquation();
    }    

}
catch(ex)
{
    console.log(ex);
}
var started = false;
document.getElementById('click-to-start').onclick = function()
{
    if(!started) {started= true; leftOscillator.start(); rightOscillator.start();  bindall(); plotEquation() }
    this.style.display = 'none';
}