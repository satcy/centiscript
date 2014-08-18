

var KEYWORDS = ["bg", "size", "col", "frame", "w", "h", "rect", "clear", "for", "c"];
var MATH_PROPS = ["E", "LN2", "LN10", "LOG2E", "LOG10E", "PI", "SQRT1_2", "SQRT2"];
var MATHS = ["abs", "acos", "asin", "atan", "atan2",
           "ceil", "cos", "exp", "floor", "imul", "log", "max", "min", "pow", "random", "round", "sin", "sqrt", "tan"];
var CTX_FUNCS = Object.getOwnPropertyNames(CanvasRenderingContext2D.prototype);

var canvas = null;
var ctx = null;

//
var x=0;
var y=0;
//
var c = 0;
var w = 400;
var h = 400;
var cx = w/2;
var cy = h/2;
Math.PI2 = Math.PI*2;
//
var encoder;
var bToGif = false;
var gifFrameCnt = 0;
var maxGifFrameNum = 90;
var imageUrl;

var bgcolor = {r:0, g:0, b:0};

var bFill = true;

var timer;

var drawMethod = '(function(){ctx.fillStyle="rgb(200, 0, 0)";ctx.fillRect(0, 0, 600, 40);})()';
drawMethod = 'clear();for(i=0; i<w; i++ ){x=(i);y=(noise(x*0.01,c*0.01));y*=(h/2);col(255);rect(x,h/2,1,y);}';



function parse(tw){
    
    tw = tw.replace(/\s/g, "");
    tw = tw.replace(/\b/g, "");
    tw = tw.replace(/(\))([A-Za-z0-9_\}])/g, ");$2");
    tw = tw.replace(/(for\()([A-Za-z_\-\.\(\)]+)(\,)([A-Za-z0-9_\-\.\(\)]+)(\,)([A-Za-z0-9_\-\.\(\)]+)(\))/g, "for($2=$4;$2<$6;$2++)");
    for ( var i=0; i<MATHS.length; i++ ) {
        var math_word = "" + MATHS[i] + "\\(";
        tw = tw.replace(new RegExp(math_word, "g"), "Math." + MATHS[i] + "(");
    }
    for ( var i=0; i<MATH_PROPS.length; i++ ) {
        tw = tw.replace(new RegExp(MATH_PROPS[i], "g"), "Math." + MATH_PROPS[i]);
    }
//    for ( var i=0; i<CTX_FUNCS.length; i++ ) {
//        var math_word = "" + CTX_FUNCS[i] + "\\(";
//        tw = tw.replace(new RegExp(math_word, "g"), "ctx." + CTX_FUNCS[i] + "(");
//    }
    var frameReg = /frame[A-Za-z0-9_\%\&\:\(\)\{\}\;\=\+\-\<\>\*\.\,\/\[\]]+/i;
    var setupMethod = tw.replace(frameReg, "");
    var frameMethod = frameReg.test(tw) ? tw.match(frameReg)[0] : "frame(){}";
    frameMethod = frameMethod.slice(frameMethod.indexOf("{")+1, frameMethod.lastIndexOf("}"));

    drawMethod = frameMethod;
    //console.log(setupMethod);
    //console.log(drawMethod);
    bg(0);
    evalInContext(setupMethod, this);
    return true;

}

function start(){
    if ( timer ) cancelAnimationFrame(timer);
    timer = requestAnimationFrame(onFrame);
}

function onFrame(){
    timer = requestAnimationFrame(onFrame);
    evalInContext(drawMethod, this);
    c++;
    if ( bToGif ) {
        encoder.addFrame(ctx);
        gifFrameCnt ++;
        if ( gifFrameCnt > maxGifFrameNum ) {
            endToGif();
        }
    }
}

//centi funcs

function bg(){
    var len = arguments.length;
    if ( len == 1 ) {
        bgcolor.r = parseInt(arguments[0]);
        bgcolor.g = parseInt(arguments[0]);
        bgcolor.b = parseInt(arguments[0]); 
    } else if ( len == 3 ) {
        bgcolor.r = parseInt(arguments[0]);
        bgcolor.g = parseInt(arguments[1]);
        bgcolor.b = parseInt(arguments[2]);     
    }
    clear();
}

function lg(){
    console.log(arguments);
}

function arr(target){
    target = [];
}

function sz(_w, _h){ size(_w, _h); }
function size(_w, _h){
    w = parseInt(_w);
    h = parseInt(_h);
    canvas.width = w;
    canvas.height = h;
    cx = w/2;
    cy = h/2;
}

function clr(){ clear(); }
function clear(){
    ctx.fillStyle = "rgb("+bgcolor.r+","+bgcolor.g+","+bgcolor.b+")";
    ctx.fillRect(0,0,w, h);    
}

function rnd(){
    var len = arguments.length;
    if ( len == 1 ) {
        return Math.random()*arguments[0];   
    } else if ( len == 2 ) {
        return Math.random()*(arguments[1] - arguments[0]) + arguments[0];
    } else {
        return Math.random();
    }
}
function rand(){
    var len = arguments.length;
    if ( len == 1 ) {
        return Math.random()*arguments[0];   
    } else if ( len == 2 ) {
        return Math.random()*(arguments[1] - arguments[0]) + arguments[0];
    } else {
        return Math.random();
    }
}

function nz() {
    var len = arguments.length;
    if ( len == 1 ) {
        return perlin.perlin2(arguments[0], 0);   
    } else if ( len == 2 ) {
        return perlin.perlin2(arguments[0], arguments[1]);
    } else if ( len == 3 ) {
        return perlin.perlin3(arguments[0], arguments[1], arguments[2]);   
    }
    return 0; 
}
function noise(){
    var len = arguments.length;
    if ( len == 1 ) {
        return perlin.perlin2(arguments[0], 0);   
    } else if ( len == 2 ) {
        return perlin.perlin2(arguments[0], arguments[1]);
    } else if ( len == 3 ) {
        return perlin.perlin3(arguments[0], arguments[1], arguments[2]);   
    }
    return 0;
}


function col(){
    var len = arguments.length;
    var s = "rgb(0,0,0)";
    if ( len == 1 ) {
        s = "rgb(" + parseInt(arguments[0]) + "," + parseInt(arguments[0]) + "," + parseInt(arguments[0]) + ")";
    } else if ( len == 2 ) {
        s = "rgba(" + parseInt(arguments[0]) + "," + parseInt(arguments[0]) + "," + parseInt(arguments[0]) + "," + parseInt(arguments[1])/255.0 + ")";
    } else if ( len == 3 ) {    
        s = "rgb(" + parseInt(arguments[0]) + "," + parseInt(arguments[1]) + "," + parseInt(arguments[2]) + ")";
    } else if ( len == 4 ) {
        s = "rgba(" + parseInt(arguments[0]) + "," + parseInt(arguments[1]) + "," + parseInt(arguments[2]) + "," + parseInt(arguments[3])/255.0 + ")";
    }
    ctx.fillStyle = s;
    ctx.strokeStyle = s;
}

function fill(){
    bFill = true;
}

function strk(){ stroke(); }
function stroke(){
    bFill = false;
}

function rect(_x, _y, _w, _h){
    if ( bFill ) ctx.fillRect(_x, _y, _w, _h);
    else ctx.strokeRect(_x, _y, _w, _h);
}

function ln(_x1, _y1, _x2, _y2){ line(_x1, _y1, _x2, _y2); }
function line(_x1, _y1, _x2, _y2){
    ctx.beginPath();
    ctx.moveTo(_x1, _y1);
    ctx.lineTo(_x2, _y2);
    ctx.stroke();
}

function oval(_x, _y, _rad) {
    ctx.beginPath();
    ctx.arc(_x, _y, _rad, 0, Math.PI * 2, true);
    if ( bFill ) ctx.fill();
    else ctx.stroke()
}

function interp(a, b, rate){
    return b + (a-b)*rate;
}

// centi funcs

function reset(){
    c = 0;
    bFill = true;
}