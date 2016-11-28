var canvas = document.getElementById('myCanvas');
canvas.setAttribute('width', window.innerWidth);
canvas.setAttribute('height', window.innerHeight);

var context = canvas.getContext('2d');
var centerx = window.innerWidth / 2;
var centery = window.innerHeight / 2;
var functionIndex = false;
var currentA = 0.5;
var currentB = 0.5;
var currentTime = Date.now();

var plotEquation = function() {

context.clearRect(0,0,window.innerWidth,window.innerHeight);        
context.moveTo(centerx, centery);

context.beginPath();
functions[+functionIndex](context, currentA, currentB);

context.strokeStyle = "#00bcbe";
context.stroke();
requestAnimationFrame(plotEquation);


};
function archimedeanSpiral(context, a, b)
{
    a = a * 100;
    b = b * 10;
    var shift = a;
    for (i = shift; i < shift + 720; i++) {
        angle = 0.1 * i;
        x = centerx + (a + b * angle) * Math.cos(angle);
        y = centery + (a + b * angle) * Math.sin(angle);

        context.lineTo(x, y);
    }
}
function polarFlower(context, a, b)
{
    a = a * 500;
    b = b * 10;
    for (i = 0; i < 720; i++) {

        angle = i / 360 * Math.PI;
        x = centerx + (a * Math.sin(b * angle)) * Math.cos(angle);
        y = centery + (a * Math.sin(b * angle)) * Math.sin(angle);

        context.lineTo(x, y);
    }
}
var functions = [polarFlower, archimedeanSpiral];
window.onmousemove = function()
{ 
    currentA = event.clientX / window.innerWidth;
    currentB = event.clientY / window.innerHeight;
};
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
window.ondeviceorientation = function()
{
    lastGammas.push(+event.gamma / 90);
    lastBetas.push(+event.beta / 90);

    currentA = avg(lastGammas) + 0.25;
    currentB = avg(lastBetas);
    
    //to circulate values
    if(lastGammas.length >= 20)
    {
        // removes the first element
        lastGammas.shift();
        lastBetas.shift();
    }  
}
window.onclick = function()
{
    plotEquation();
}
window.onresize = function()
{
    centerx = window.innerWidth / 2;
    centery = window.innerHeight / 2;
    canvas.setAttribute('width', window.innerWidth);
    canvas.setAttribute('height', window.innerHeight);
}
requestAnimationFrame(plotEquation);
