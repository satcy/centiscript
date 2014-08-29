/*
The MIT License (MIT)

Copyright (c) 2014 Satoshi HORII

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var MATH_PROPS = ["E", "LN2", "LN10", "LOG2E", "LOG10E", "PI", "PI2", "SQRT1_2", "SQRT2"];
var MATHS = ["abs", "acos", "asin", "atan", "atan2",
           "ceil", "cos", "exp", "floor", "imul", "log", "max", "min", "pow", "random", "round", "sin", "sqrt", "tan"];
var CTX_FUNCS = Object.getOwnPropertyNames(CanvasRenderingContext2D.prototype);

PI2 = Math.PI2 = Math.PI*2.0;

var Centi = function(name){
    this.name = name ? name : "ct";

    this.canvas = null;
    this.ctx = null;

    this.GOLD = (1+Math.sqrt(5))/2;
    
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

    this.kdtree;
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

    var frameReg = /frame\([\w\W]+/i;
    var setupMethod = tw.replace(frameReg, "");
    var frameMethod = frameReg.test(tw) ? tw.match(frameReg)[0] : "frame(){}";
    frameMethod = frameMethod.slice(frameMethod.indexOf("{")+1, frameMethod.lastIndexOf("}"));

    var forReg = new RegExp(this.name+".for\\(", "g");
    var whileReg = new RegExp(this.name+".while\\(", "g");
    var ifReg = new RegExp(this.name+".if\\(", "g");
    var elseReg = new RegExp(this.name+".else\\{", "g");
    var elseIfReg = new RegExp(this.name+".elseIf\\(", "g");
    var numbersReg = new RegExp("(" + this.name + ")\.([0-9\.]+)", "g");
    var valueReg = /([A-Za-z0-9_]+)([\.\!\~\|\%\&\:\(\)\{\}\;\=\+\-\<\>\*\/\[\]\,\^])/g;
    var funcReg = new RegExp(this.name+".func\\(", "g");
    var argmentReg = /(\$)([0-9]+)/g;
    var returnReg = new RegExp(this.name+".return\\(([\\w\\W]+)", "g");
    var objReg = new RegExp("\\." + this.name + "\\.", "g");

    setupMethod = replace(setupMethod, this.name);
    setupMethod = this.modFunction(setupMethod);

    frameMethod = replace(frameMethod, this.name);
    frameMethod = this.modFunction(frameMethod);

    function replace(str, name){
        str = str.replace(valueReg, name + "."+"$1"+"$2");
        str = str.replace(numbersReg, "$2");
        str = str.replace(forReg, "for(");
        str = str.replace(whileReg, "while(");
        str = str.replace(ifReg, "if(");
        str = str.replace(elseReg, "else{");
        str = str.replace(elseIfReg, "else if(");
        str = str.replace(funcReg, "function(");
        str = str.replace(argmentReg, "arguments[" + '$2' + ']');
        str = str.replace(returnReg, "return "+'($1');
        str = str.replace(objReg, ".");
        for ( var i=0; i<MATHS.length; i++ ) {
            var math_word = name + "." + MATHS[i] + "\\(";
            str = str.replace(new RegExp(math_word, "g"), "Math." + MATHS[i] + "(");
        }
        for ( var i=0; i<MATH_PROPS.length; i++ ) {
            str = str.replace(new RegExp(name + "." + MATH_PROPS[i], "g"), "Math." + MATH_PROPS[i]);
        }
        return str;
    }

    //console.log(setupMethod);
    //console.log(frameMethod);

    this.drawMethod = frameMethod;

    this.bg(0);
    evalInContext(setupMethod, this);
    return true;

};

Centi.prototype.modFunction = function(_str){
    var funcNum = (_str.match(/function/g)||[]).length;
    if ( funcNum > 0 ) {
        var txt = _str;
        var index = 0;
        var current = txt.indexOf("function", index) + 7;
        var flag = 0;
        var preFlag = flag;
        while ( current < txt.length ) {
            var s = txt.charAt(current);
            if ( s == '{' ) flag++;
            if ( s == '}' ) flag--;
            if ( preFlag == 1 && flag == 0 ) {
                txt = txt.slice(0, current+1) + ";" + txt.slice(current+1);
            }
            preFlag = flag;
            current++;
        }
        _str = txt;
    }
    return _str;
};


Centi.prototype.update = function(){
    evalInContext(this.drawMethod, this);
    this.c++;
    if ( this.toGifFunc != null ) this.toGifFunc(this.ctx);
};

Centi.prototype.reset = function(){
    this.c = 0;
    this.bFill = true;
    this.lw(1);
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

Centi.prototype.obj = function(){
    return new Object();
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

// Draw

Centi.prototype.rect = function(_x, _y, _w, _h){
    if ( this.bFill ) this.ctx.fillRect(_x, _y, _w, _h);
    else this.ctx.strokeRect(_x, _y, _w, _h);
};

Centi.prototype.oval = function(_x, _y, _rad) {
    this.ctx.beginPath();
    this.ctx.arc(_x, _y, _rad, 0, Math.PI * 2, true);
    if ( this.bFill ) this.ctx.fill();
    else this.ctx.stroke()
};

Centi.prototype.ln = function(_x1, _y1, _x2, _y2){ this.line(_x1, _y1, _x2, _y2); };
Centi.prototype.line = function(_x1, _y1, _x2, _y2){
    this.ctx.beginPath();
    this.ctx.moveTo(_x1, _y1);
    this.ctx.lineTo(_x2, _y2);
    this.ctx.stroke();
};

Centi.prototype.curve = function(){
    if ( arguments.length == 8 ) {
        this.beginShape();
        this.moveTo(arguments[0], arguments[1]);
        this.curveTo(arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7]);
        this.endShape();
    } else if ( arguments.length == 1 ) {
        if ( arguments[0].length && arguments[0].length == 8 ) {
            this.curve(arguments[0][0], arguments[0][1], arguments[0][2], arguments[0][3], arguments[0][4], arguments[0][5], arguments[0][6], arguments[0][7])
        }
    } 
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

Centi.prototype.curveTo = function(){
    if ( arguments.length == 6 ) {
        this.ctx.bezierCurveTo(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
    } else if ( arguments.length == 1 ) {
        if ( arguments[0].length && arguments[0].length == 6 ) {
            this.ctx.bezierCurveTo(arguments[0][0], arguments[0][1], arguments[0][2], arguments[0][3], arguments[0][4], arguments[0][5]);
        }
    }
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

// Transform

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

Centi.prototype.transform = function(_a, _b, _c, _d, _e, _f){
    this.ctx.transform(_a, _b, _c, _d, _e, _f);
};

// Math

Centi.prototype.interp = function(a, b, rate){
    return b + (a-b)*rate;
};

Centi.prototype.dist = function(){
    var len = arguments.length;
    if ( len == 4 ) {
        var dx = (arguments[0] - arguments[2]);
        var dy = (arguments[1] - arguments[3]);
        return Math.sqrt(dx*dx + dy*dy);
    } else if ( len == 2 && arguments[0].hasOwnProperty("x") && arguments[0].hasOwnProperty("y") && arguments[1].hasOwnProperty("x") && arguments[1].hasOwnProperty("y") ) {
        return this.dist(arguments[0].x, arguments[0].y, arguments[1].x, arguments[1].y);
    }
};

Centi.prototype.wrap = function(_a, _min, _max){
    var d = _max - _min;
    if ( d > 0 ) {
        if ( _a < _min ) _a += d;
        if ( _a > _max ) _a -= d;
        return _a;
    } else {
        return _a;
    }
};

Centi.prototype.minMax = function(_a, _min, _max){
    return Math.min(_min, Math.max(_a, _max));
};

Centi.prototype.map = function(_num, _in_min, _in_max, _out_min, _out_max){
    return ((_num - _in_min)/(_in_max - _in_min))*(_out_max - _out_min) + _out_min;
};

Centi.prototype.zmap = function(_num, _in_min, _in_max, _out_min, _out_max){
    return this.minMax(this.map(_num, _in_min, _in_max, _out_min, _out_max), _out_min, _out_max);
};

Centi.prototype.avg = function(_arr){
    if ( _arr && _arr.length > 0 ) {
        var l = _arr.length;
        var val = 0;
        for ( var i=0; i<l; i++ ) {
            val += _arr[i];
        }
        return val/l;
    } else {
        return 0;
    }
};


Centi.prototype.cent = function() {
    var len        = arguments.length;
    if ( len == 1 && arguments[0].length > 1 ) {
        len = arguments[0].length;
        var center      = { x: 0, y: 0 };
        var area          = 0;
        
        for (var i = 0; i < len; i++ ) {
            var p1 = arguments[0][i];
            var p2 = arguments[0][(i+1)%len];
            
            center.x += (p1.x + p2.x) * (p1.x*p2.y - p2.x*p1.y);
            center.y += (p1.y + p2.y) * (p1.x*p2.y - p2.x*p1.y);
            
            area += (p1.x*p2.y - p2.x*p1.y);
        }
        
        area = area / 2.0;
        
        center.x = center.x / (6 * area);
        center.y = center.y / (6 * area);
        
        return center;
    } else {
        return {x:0, y:0};
    }
    
};

Centi.prototype.curves = function() {
    var len = arguments.length;
    if ( len == 9 ) {
        return this.getPointsOnCurve(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8]);
    } else if ( len == 2 ) {
        if ( arguments[1].length && arguments[1].length == 8 ) {
            return this.getPointsOnCurve(arguments[0], arguments[1][0], arguments[1][1], arguments[1][2], arguments[1][3], arguments[1][4], arguments[1][5], arguments[1][6], arguments[1][7]);
        }
    } else if ( len == 1 ) {
        if ( arguments[0].length && arguments[0].length == 9 ) {
            return this.getPointsOnCurve( arguments[0][0], arguments[0][1], arguments[0][2], arguments[0][3], arguments[0][4], arguments[0][5], arguments[0][6], arguments[0][7], arguments[0][8]);
        }
    }
};

Centi.prototype.getPointsOnCurve = function(_div, _x1, _y1, _cp1x, _cp1y, _cp2x, _cp2y, _x2, _y2) {
    if ( _div < 2 ) _div = 2;
    var arr = [];
    for ( var i=0; i<_div; i++ ) {
        var r = i/(_div-1.0);
        arr.push(this.getPointOnCubicBezier(r, _x1, _cp1x, _cp2x, _x2));
        arr.push(this.getPointOnCubicBezier(r, _y1, _cp1y, _cp2y, _y2));
    }
    return arr;
};

Centi.prototype.getPointOnCubicBezier = function(_t, _a, _b, _c, _d) {
    var _k = 1 - _t;
    return (_k * _k * _k * _a) + (3 * _k * _k * _t * _b) + (3 * _k * _t * _t * _c) + (_t * _t * _t * _d);
};

Centi.prototype.tree = function(_pts){
    this.kdtree = new kdTree(_pts, distance, ["x", "y"]);
    function distance(a, b) {
        return Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y, 2);
    }
};

Centi.prototype.nears = function(_pt, _count, _distance){
    return this.kdtree.nearest(_pt, _count, _distance);
};

Centi.prototype.r2d = function(_radian){
    return (_radian * 180) / Math.PI;
};

Centi.prototype.d2r = function(_degree){
    return (_degree * Math.PI) / 180;
};

// Array

Centi.prototype.sortNum = function(_arr){
    _arr.sort(
        function(a,b){
            if( a < b ) return -1;
            if( a > b ) return 1;
            return 0;
        }
    );
};

Centi.prototype.reverse = function(_arr){
    _arr.reverse();
};

// Geometry

Centi.prototype.vec2 = function(_x, _y){
    return new Centi.Vec2(_x, _y);
}
Centi.Vec2 = function(_x, _y){
    this.x = _x;
    this.y = _y;
};

// centi funcs

var CT_FUNCS = Object.getOwnPropertyNames(Centi.prototype);
