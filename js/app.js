if ( !window.requestAnimationFrame ) {

    window.requestAnimationFrame = ( function() {

        return window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

            window.setTimeout( callback, 1000 / 60 );

        };

    } )();

}
window.cancelAnimationFrame = window.cancelAnimationFrame ||
  window.mozCancelAnimationFrame ||
  window.webkitCancelAnimationFrame ||
  window.msCancelAnimationFrame;

if (!window.XMLHttpRequest){
  XMLHttpRequest = function () {
    try {
      return new ActiveXObject("Msxml2.XMLHTTP.6.0");
    } catch (e) {}
    try {
      return new ActiveXObject("Msxml2.XMLHTTP.3.0");
    } catch (e) {}
    try {
      return new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {}
    throw new Error("This browser does not support XMLHttpRequest.");
  };
}

var KEYWORDS = ["bg", "size", "col", "frame", "w", "h", "rect", "clear", "for", "c"];
var MATH_PROPS = ["E", "LN2", "LN10", "LOG2E", "LOG10E", "PI", "SQRT1_2", "SQRT2"];
var MATHS = ["abs", "acos", "asin", "atan", "atan2",
           "ceil", "cos", "exp", "floor", "imul", "log", "max", "min", "pow", "random", "round", "sin", "sqrt", "tan"];
var CTX_FUNCS = Object.getOwnPropertyNames(CanvasRenderingContext2D.prototype);

var canvas = null;
var ctx = null;

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

var editor;

var bFill = true;

var timer;

var drawMethod = '(function(){ctx.fillStyle="rgb(200, 0, 0)";ctx.fillRect(0, 0, 600, 40);})()';
drawMethod = 'clear();for(i=0; i<w; i++ ){x=(i);y=(noise(x*0.01,c*0.01));y*=(h/2);col(255);rect(x,h/2,1,y);}';

function run(){
    var tw;
    tw = editor.value;
    //console.log(tw);
    reset();
    if ( parse(tw) ) {
        start();   
    } else {
        alert("unsuccess");   
    }
}

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
    } else if ( len == 3 ) {    
        s = "rgb(" + parseInt(arguments[0]) + "," + parseInt(arguments[1]) + "," + parseInt(arguments[2]) + ")";
    } else if ( lend == 4 ) {
        s = "rgba(" + parseInt(arguments[0]) + "," + parseInt(arguments[1]) + "," + parseInt(arguments[2]) + "," + parseInt(arguments[3]) + ")";
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

// centi funcs

function reset(){
    c = 0;
}

function init(){
    
    canvas = document.getElementById("canvas0");
    if ( canvas.getContext ) {
        ctx = canvas.getContext("2d");
        clear();
    } else {
        document.getElementById('editor').value = "disable canvas.";
    }
    
    editor = document.getElementById('editor');
}

function tweet(){
    var code;
    code = editor.value;
    code = code.replace(/\s/g, "");
    if ( !code ) {
        return;
    }
    if ( gifFrameCnt > 0 ) {
        var blob = window.dataURLtoBlob && window.dataURLtoBlob(imageUrl);
        postData(blob);
    } else if ( canvas.toBlob ) {
        canvas.toBlob( postData, "image/png");
    }

    function postData(blob){
        var formData = new FormData();

        var url = "http://ex.rzm.co.jp/centiscript/?c="+escape(code);

        formData.append("image", blob );
        formData.append("tweet", "(centiscript) " + url);
        formData.append("url", url);
        
        var xhr = new XMLHttpRequest;
        xhr.open( "POST", "http://ex.rzm.co.jp/centiscript/p/upload.php" );
        xhr.onreadystatechange = function(){
            //console.log(xhr.readyState, xhr.status);
            if (xhr.readyState === 4 && xhr.status === 200){
              //console.log(1, xhr.responseText);
                eval(xhr.responseText);
            }
            if (xhr.readyState === 4 && xhr.status === 0){
              //console.log(2, xhr.responseText);
                eval(xhr.responseText);
            }
        };
        xhr.send(formData);
    }
}

function togif(){
    if ( !bToGif ) {
        encoder = new GIFEncoder();
        bToGif = true;
        gifFrameCnt = 0;
        encoder.setRepeat(0);
        encoder.setDelay(33);
        encoder.start();
        document.getElementById('togif').innerHTML = "Stop REC";
    } else {
        endToGif();
    }
}

function endToGif(){
    bToGif = false;
    encoder.finish();
    imageUrl = 'data:image/gif;base64,'+encode64(encoder.stream().getData());
    document.getElementById('gif_image').src = imageUrl;
    document.getElementById('togif').innerHTML = "REC";
    encoder = null;
}

function setSample(str){
    //console.log(str);
    editor.value = "";
    editor.value = str;
    strlength(str);
    run();
}

function evalInContext(source, context) {
    source = '(function(' + Object.keys(context).join(', ') + ') {' + source + '})';
    
    var compiled = eval(source);
    return compiled.apply(context, values());
    // you likely don't need this - use underscore, jQuery, etc
    function values() {
        var result = [];
        for (var property in context)
            if (context.hasOwnProperty(property))
                result.push(context[property]);
        return result;
    }
}

function strlength(str) {
    str = str.replace(/\s/g, "");
	document.getElementById("idStrlength").innerHTML = (str.length);
}

function get_url_vars(){
  var vars = new Object();
  var params;
  var temp_params = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for(var i = 0; i <temp_params.length; i++) {
    params = temp_params[i].split('=');
    
    if(params.length == 2) {
        //vars[params[0]] = params[1];
        vars[decodeURIComponent(params[0])] = decodeURIComponent(params[1]);
    }
  }
  return vars;
}

window.onload = function(){
    init();
    var params = get_url_vars();
    
	if ( params["c"] ) {
        editor.value = unescape(params["c"]);
        run();
    }
    strlength(editor.value);
};

