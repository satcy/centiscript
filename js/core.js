

var KEYWORDS = ["x", "y", "cx", "cy", "bg", "size", "col", "frame", "w", "h", "rect", "clear", "for", "c"];
var MATH_PROPS = ["E", "LN2", "LN10", "LOG2E", "LOG10E", "PI", "PI2", "SQRT1_2", "SQRT2"];
var MATHS = ["abs", "acos", "asin", "atan", "atan2",
           "ceil", "cos", "exp", "floor", "imul", "log", "max", "min", "pow", "random", "round", "sin", "sqrt", "tan"];
var CTX_FUNCS = Object.getOwnPropertyNames(CanvasRenderingContext2D.prototype);

PI2 = Math.PI2 = Math.PI*2.0;

var Centi = function(name){
    this.name = name ? name : "ct";

    this.canvas = null;
    this.ctx = null;
    
    this.x=0;
    this.y=0;
    //
    this.c = 0;
    this.w = 720;
    this.h = 360;
    this.cx = this.w/2;
    this.cy = this.h/2;
    //
    

    this.bgcolor = {r:0, g:0, b:0};

    this.bFill = true;

    this.drawMethod = '';

    this.toGifFunc = null;

    

};

Centi.prototype.init = function(canvas){
    this.canvas = canvas;

    if ( canvas.getContext ) {
        this.ctx = canvas.getContext("2d");
        this.clear();
        return true;
    } else {
        return false;
    }
};



Centi.prototype.parse = function(tw){
    
    tw = tw.replace(/\s/g, "");
    tw = tw.replace(/\b/g, "");
    tw = tw.replace(/(\))([A-Za-z0-9_\}])/g, ");$2");
    tw = tw.replace(/(for\()([A-Za-z_\-\.\(\)]+)(\,)([A-Za-z0-9_\-\.\(\)]+)(\,)([A-Za-z0-9_\-\.\(\)\*\+\/]+)(\))/g, "for($2=$4;$2<$6;$2++)");
    // for ( var i=0; i<MATHS.length; i++ ) {
    //     var math_word = "" + MATHS[i] + "\\(";
    //     tw = tw.replace(new RegExp(math_word, "g"), "Math." + MATHS[i] + "(");
    // }
    // for ( var i=0; i<MATH_PROPS.length; i++ ) {
    //     tw = tw.replace(new RegExp(MATH_PROPS[i], "g"), "Math." + MATH_PROPS[i]);
    // }
//    for ( var i=0; i<CTX_FUNCS.length; i++ ) {
//        var math_word = "" + CTX_FUNCS[i] + "\\(";
//        tw = tw.replace(new RegExp(math_word, "g"), "ctx." + CTX_FUNCS[i] + "(");
//    }
    var frameReg = /frame[A-Za-z0-9_\%\&\:\(\)\{\}\;\=\+\-\<\>\*\.\,\/\[\]]+/i;
    var setupMethod = tw.replace(frameReg, "");
    var frameMethod = frameReg.test(tw) ? tw.match(frameReg)[0] : "frame(){}";
    frameMethod = frameMethod.slice(frameMethod.indexOf("{")+1, frameMethod.lastIndexOf("}"));

    var forReg = new RegExp(this.name+".for\\(", "g");
    var ifReg = new RegExp(this.name+".if\\(", "g");
    var numbersReg = new RegExp("(" + this.name + ")\.([0-9\.]+)", "g");
    //var valueReg = /(^[A-Za-z_][A-Za-z0-9_]+)([\%\&\:\(\)\{\}\;\=\+\-\<\>\*\/\[\]\,])/g;
    var valueReg2 = /([A-Za-z0-9_]+)([\%\&\:\(\)\{\}\;\=\+\-\<\>\*\/\[\]\,\^])/g;
    setupMethod = setupMethod.replace(valueReg2, this.name + "."+"$1"+"$2");
    //setupMethod = setupMethod.replace(valueReg, this.name + "."+"$1"+"$2");
    //setupMethod = setupMethod.replace(new RegExp(this.name + "." + this.name, "g"), this.name);
    setupMethod = setupMethod.replace(numbersReg, "$2");
    setupMethod = setupMethod.replace(forReg, "for(");
    setupMethod = setupMethod.replace(ifReg, "if(");
    for ( var i=0; i<MATHS.length; i++ ) {
        var math_word = this.name + "." + MATHS[i] + "\\(";
        setupMethod = setupMethod.replace(new RegExp(math_word, "g"), "Math." + MATHS[i] + "(");
    }
    for ( var i=0; i<MATH_PROPS.length; i++ ) {
        setupMethod = setupMethod.replace(new RegExp(this.name + "." + MATH_PROPS[i], "g"), "Math." + MATH_PROPS[i]);
    }
    //console.log(setupMethod);

    frameMethod = frameMethod.replace(valueReg2, this.name + "."+"$1"+"$2");
    //frameMethod = frameMethod.replace(valueReg, this.name + "."+"$1"+"$2");
    //frameMethod = frameMethod.replace(new RegExp(this.name + "." + this.name, "g"), this.name);
    frameMethod = frameMethod.replace(numbersReg, "$2");
    frameMethod = frameMethod.replace(forReg, "for(");
    frameMethod = frameMethod.replace(ifReg, "if(");
    for ( var i=0; i<MATHS.length; i++ ) {
        var math_word = this.name + "." + MATHS[i] + "\\(";
        frameMethod = frameMethod.replace(new RegExp(math_word, "g"), "Math." + MATHS[i] + "(");
    }
    for ( var i=0; i<MATH_PROPS.length; i++ ) {
        frameMethod = frameMethod.replace(new RegExp(this.name + "." + MATH_PROPS[i], "g"), "Math." + MATH_PROPS[i]);
    }
    //console.log(frameMethod);

    this.drawMethod = frameMethod;
    //console.log(setupMethod);
    //console.log(drawMethod);
    this.bg(0);
    evalInContext(setupMethod, this);
    return true;

};

Centi.prototype.update = function(){
    evalInContext(this.drawMethod, this);
    this.c++;
    if ( this.toGifFunc != null ) this.toGifFunc(this.ctx);
};

//centi funcs

Centi.prototype.bg = function(){
    var len = arguments.length;
    if ( len == 1 ) {
        this.bgcolor.r = parseInt(arguments[0]);
        this.bgcolor.g = parseInt(arguments[0]);
        this.bgcolor.b = parseInt(arguments[0]); 
    } else if ( len == 3 ) {
        this.bgcolor.r = parseInt(arguments[0]);
        this.bgcolor.g = parseInt(arguments[1]);
        this.bgcolor.b = parseInt(arguments[2]);     
    }
    this.clear();
};

Centi.prototype.lg = function(){
    console.log(arguments);
};

Centi.prototype.sz = function(_w, _h){ this.size(_w, _h); };
Centi.prototype.size = function(_w, _h){
    this.w = parseInt(_w);
    this.h = parseInt(_h);
    this.canvas.width = this.w;
    this.canvas.height = this.h;
    this.cx = this.w/2;
    this.cy = this.h/2;
};

Centi.prototype.clr = function(){ this.clear(); };
Centi.prototype.clear = function(){
    this.ctx.fillStyle = "rgb("+this.bgcolor.r+","+this.bgcolor.g+","+this.bgcolor.b+")";
    this.ctx.fillRect(0,0,this.w, this.h);    
};

// Randomize

Centi.prototype.rnd = function(){
    var len = arguments.length;
    if ( len == 1 ) {
        return Math.random()*arguments[0];   
    } else if ( len == 2 ) {
        return Math.random()*(arguments[1] - arguments[0]) + arguments[0];
    } else {
        return Math.random();
    }
};
Centi.prototype.rand = function(){
    var len = arguments.length;
    if ( len == 1 ) {
        return Math.random()*arguments[0];   
    } else if ( len == 2 ) {
        return Math.random()*(arguments[1] - arguments[0]) + arguments[0];
    } else {
        return Math.random();
    }
};

Centi.prototype.nz = function() {
    var len = arguments.length;
    if ( len == 1 ) {
        return perlin.perlin2(arguments[0], 0);   
    } else if ( len == 2 ) {
        return perlin.perlin2(arguments[0], arguments[1]);
    } else if ( len == 3 ) {
        return perlin.perlin3(arguments[0], arguments[1], arguments[2]);   
    }
    return 0; 
};
Centi.prototype.noise = function(){
    var len = arguments.length;
    if ( len == 1 ) {
        return perlin.perlin2(arguments[0], 0);   
    } else if ( len == 2 ) {
        return perlin.perlin2(arguments[0], arguments[1]);
    } else if ( len == 3 ) {
        return perlin.perlin3(arguments[0], arguments[1], arguments[2]);   
    }
    return 0;
};

// draw

Centi.prototype.rect = function(_x, _y, _w, _h){
    if ( this.bFill ) this.ctx.fillRect(_x, _y, _w, _h);
    else this.ctx.strokeRect(_x, _y, _w, _h);
};

Centi.prototype.ln = function(_x1, _y1, _x2, _y2){ this.line(_x1, _y1, _x2, _y2); };
Centi.prototype.line = function(_x1, _y1, _x2, _y2){
    this.ctx.beginPath();
    this.ctx.moveTo(_x1, _y1);
    this.ctx.lineTo(_x2, _y2);
    this.ctx.stroke();
};

Centi.prototype.lw = function(_w){ this.lineWidth(_w); };
Centi.prototype.lineWidth = function(_w){
    this.ctx.lineWidth = _w;
};

Centi.prototype.moveTo = function(_x1, _y1){
    this.ctx.moveTo(_x1, _y1);
};

Centi.prototype.lineTo = function(_x1, _y1){
    this.ctx.lineTo(_x1, _y1);
};

Centi.prototype.oval = function(_x, _y, _rad) {
    this.ctx.beginPath();
    this.ctx.arc(_x, _y, _rad, 0, Math.PI * 2, true);
    if ( this.bFill ) this.ctx.fill();
    else this.ctx.stroke()
};

Centi.prototype.beginShape = function(){
    this.ctx.beginPath();
};

Centi.prototype.endShape = function(){
    if ( this.bFill ) this.ctx.fill();
    else this.ctx.stroke();
};

Centi.prototype.drawMe = function(){
    var len = arguments.length;
    if ( len == 2 ) {
        this.ctx.drawImage(this.canvas, arguments[0], arguments[1]);
    } else if ( len == 4 ) {
        this.ctx.drawImage(this.canvas, arguments[0], arguments[1], arguments[2], arguments[3]);
    } else if ( len == 8 ) {
        this.ctx.drawImage(this.canvas, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7]);   
    }
};

// transform

Centi.prototype.push = function(){
    this.ctx.save();
};

Centi.prototype.pop = function(){
    this.ctx.restore();
};

Centi.prototype.rotate = function(_rota){
    this.ctx.rotate(_rota);
};

Centi.prototype.scale = function(_x, _y){
    this.ctx.scale(_x, _y);
};

Centi.prototype.translate = function(_x, _y){
    this.ctx.translate(_x, _y);
};

// util

Centi.prototype.col = function(){
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
    this.ctx.fillStyle = s;
    this.ctx.strokeStyle = s;
};

Centi.prototype.fill = function(){
    this.bFill = true;
};

Centi.prototype.strk = function(){ this.stroke(); };
Centi.prototype.stroke = function(){
    this.bFill = false;
};

Centi.prototype.interp = function(a, b, rate){
    return b + (a-b)*rate;
};

Centi.prototype.sortNum = function(_arr){
    _arr.sort(
        function(a,b){
            if( a < b ) return -1;
            if( a > b ) return 1;
            return 0;
        }
    );
}

Centi.prototype.reverse = function(_arr){
    _arr.reverse();
}

Centi.prototype.vec2 = function(_x, _y){
    return new Centi.Vec2(_x, _y);
};
Centi.Vec2 = function(_x, _y){
    this.x = _x;
    this.y = _y;
};;

// centi funcs

Centi.prototype.reset = function(){
    this.c = 0;
    this.bFill = true;
};

var CT_FUNCS = Object.getOwnPropertyNames(Centi.prototype);

