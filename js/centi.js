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
    this.ver = '0.3.8';
    this.name = name ? name : "ct";

    this.canvas = null;
    this.ctx = null;
    //DSP
    this.dsp = {
        enable: false,
        context: null,
        analyser: null,
        processor: null
    };
    this.sampleRate = 44100;
    this.fft = new Uint8Array(1024);
    this.waveUint = new Uint8Array(2048);
    this.wave = new Float32Array(2048);
    // 
    this.GOLD = (1+Math.sqrt(5))/2;
    //
    this.x=0;
    this.y=0;
    //
    this.c = 0;
    this.time = 0;
    this.w = 720;
    this.h = 360;
    this.sizeW = this.w;
    this.sizeH = this.h;
    this.cx = this.w/2;
    this.cy = this.h/2;
    //
    this.tempo = {
        bpm: 120,
        sec: 0.5,
        preSec: 0,
        divide:4
    };
    this.beat = 0;
    //
    this.initSec = this.now();
    //
    this.bgcolor = {r:0, g:0, b:0};
    this.bFill = true;
    this.kdtree;
    //
    this.setupMethod = '';
    this.drawMethod = '';
    this.beatMethod = '';
    this.dspMethod = '';
    this.setupFunc = null;
    this.drawFunc = null;
    this.beatFunc = null;
    this.dspFunc = null;
    //
    this.toGifFunc = null;
    //THREE
    this.b3d = false;

    this.pluginInstances = [];
};

Centi.plugins = [];

Centi.prototype.destroy = function(){
    if ( this.dsp.processor ) {
        this.dsp.processor.disconnect();
        this.dsp.processor.onaudioprocess = null;
        this.dsp.processor = null;
    }
    if ( this.dsp.analyser ) {
        this.dsp.analyser.disconnect();
        this.dsp.analyser = null;
    }
    if ( this.dsp.context ) {
        this.dsp.context.distination.disconnect();
    }
    this.dsp.context = null;
    this.canvas = null;
    this.ctx = null;
    this.dsp = null;
    this.tempo = null;

    this.toGifFunc = null;

    this.setupFunc = null;
    this.drawFunc = null;
    this.beatFunc = null;
    this.dspFunc = null;

    this.fft = null;
    this.wave = null;

    this.b3d = false;

    this.pluginInstances = null;
};

Centi.prototype.init = function(canvas, audioContext){
    this.canvas = canvas;
    
    this.initSec = this.now();
    this.time = 0;
    
    if ( audioContext ) {
        this.dsp.enable = true;
        this.dsp.context = audioContext;

        this.dsp.context.createScriptProcessor = this.dsp.context.createScriptProcessor || this.dsp.context.createJavaScriptNode;
        
        var getBufferSize = function() {
            if (/(Win(dows )?NT 6\.2)/.test(navigator.userAgent)) {
                return 1024;  //Windows 8
            } else if (/(Win(dows )?NT 6\.1)/.test(navigator.userAgent)) {
                return 1024;  //Windows 7
            } else if (/(Win(dows )?NT 6\.0)/.test(navigator.userAgent)) {
                return 2048;  //Windows Vista
            } else if (/Win(dows )?(NT 5\.1|XP)/.test(navigator.userAgent)) {
                return 4096;  //Windows XP
            } else if (/Mac|PPC/.test(navigator.userAgent)) {
                return /*1024*/4096;  //Mac OS X
            } else if (/Linux/.test(navigator.userAgent)) {
                return 8192;  //Linux
            } else if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                return 2048;  //iOS
            } else {
                return 16384;  //Otherwise
            }
        };

        this.dsp.analyser = this.dsp.context.createAnalyser();
        this.dsp.analyser.connect(this.dsp.context.destination);
        //console.log(this.dsp.analyser);
        this.sampleRate = this.dsp.context.sampleRate;
        var inc_time = 1.0/this.dsp.context.sampleRate;
        
        var processor = this.dsp.context.createScriptProcessor(getBufferSize(), 0, 2);
        this.dsp.processor = processor;
        var dummy = this.dsp.context.createBufferSource();
        dummy.connect(processor);
        processor.connect(this.dsp.analyser);

        var self = this;
        
        processor.onaudioprocess = function(event) {
            //self.time = self.now() - self.initSec;
            //var inputLs = event.inputBuffer.getChannelData(0);  
            //var inputRs = event.inputBuffer.getChannelData(1);  
            self.updateBeat();
            var outL = event.outputBuffer.getChannelData(0);
            var outR = event.outputBuffer.getChannelData(1);
            for (var i = 0; i < this.bufferSize; i++) {
                var t = self.time;
                var value = self.doDsp();
                outL[i] = value;
                outR[i] = value;
                self.time += inc_time;
            }
        };
    } else {
        this.dsp.enable = false;
    }

    for ( var i=0; i<Centi.plugins.length; i++ ){
        var plugin = new (Centi.plugins[i])(this);
        this.pluginInstances.push(plugin);
    }

    if ( canvas.getContext ) {
        //this.ctx = canvas.getContext("2d");
        //this.clear();
        return true;
    } else {
        return false;
    }
};

Centi.prototype.doDsp = function(){
    return ( this.dspFunc ) ? this.dspFunc() : 0;
};

Centi.prototype.parse = function(tw){
    
    tw = tw.replace(/\s/g, "");
    tw = tw.replace(/\b/g, "");
    tw = tw.replace(/(\))([A-Za-z0-9_\}])/g, ");$2");
    tw = tw.replace(/(for\()([A-Za-z_\-\.\(\)]+)(\,)([A-Za-z0-9_\-\.\(\)]+)(\,)([A-Za-z0-9_\-\.\(\)\*\+\/]+)(\))/g, "for($2=$4;$2<$6;$2++)");

    var frameMethod = this.getInnerExpression(tw.slice(tw.indexOf('frame(')));
    var beatMethod = this.getInnerExpression(tw.slice(tw.indexOf('beat(')));
    var dspMethod = this.getInnerExpression(tw.slice(tw.indexOf('dsp(')));

    var setupMethod = tw.replace('frame(){' + frameMethod + '}', '');
    setupMethod = setupMethod.replace('beat(){' + beatMethod + '}', '');
    setupMethod = setupMethod.replace('dsp(){' + dspMethod + '}', '');
    if ( /c3d\(\)/.test(setupMethod) ) this.c3d();
    else this.c2d();
    
    var forReg = new RegExp(this.name+".for\\(", "g");
    var whileReg = new RegExp(this.name+".while\\(", "g");
    var ifReg = new RegExp(this.name+".if\\(", "g");
    var elseReg = new RegExp(this.name+".else\\{", "g");
    var elseIfReg = new RegExp(this.name+".elseIf\\(", "g");
    var numbersReg = new RegExp("(" + this.name + ")\.([0-9\.]+)", "g");
    var valueReg = /([A-Za-z0-9_]+)([\.\!\~\|\%\&\:\(\)\{\}\;\=\+\-\<\>\*\/\[\]\,\^])/g;
    var funcReg = new RegExp(this.name+".func\\(", "g");
    var argmentReg = /(\$)([0-9]+)/g;
    var returnReg = new RegExp(this.name+".return\\(", "g");
    var objReg = new RegExp("\\." + this.name + "\\.", "g");
    var pluginInstances = this.pluginInstances;

    setupMethod = replace(setupMethod, this.name);
    setupMethod = this.modFunction(setupMethod);

    frameMethod = replace(frameMethod, this.name);
    frameMethod = this.modFunction(frameMethod);

    beatMethod = replace(beatMethod, this.name);
    beatMethod = this.modFunction(beatMethod);

    dspMethod = replace(dspMethod, this.name);
    dspMethod = this.modFunction(dspMethod);

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
        str = str.replace(returnReg, "return (");
        str = str.replace(objReg, ".");

        for ( var i=0; i<pluginInstances.length; i++ ) {
            var threeReg = new RegExp(name + "." + pluginInstances[i].prefix + ".", "g");
            str = str.replace(threeReg, pluginInstances[i].prefix + ".");
            if ( pluginInstances[i].shortPrefix ) {
                threeReg = new RegExp(name + "." + pluginInstances[i].shortPrefix + ".", "g");
                str = str.replace(threeReg, pluginInstances[i].prefix + ".");
            }
        }
        for ( var i=0; i<MATHS.length; i++ ) {
            var math_word = name + "." + MATHS[i] + "\\(";
            str = str.replace(new RegExp(math_word, "g"), "Math." + MATHS[i] + "(");
        }
        for ( var i=0; i<MATH_PROPS.length; i++ ) {
            str = str.replace(new RegExp(name + "." + MATH_PROPS[i], "g"), "Math." + MATH_PROPS[i]);
        }
        return str;
    }

    // console.log(setupMethod);
    // console.log(frameMethod);
    // console.log(beatMethod);
    // console.log(dspMethod);

    this.drawMethod = frameMethod;
    this.beatMethod = beatMethod;
    this.dspMethod = dspMethod;

    if ( this.drawMethod != '' ) {
        this.drawFunc = evalInContext('return (function(){' + this.drawMethod + '});', this);
    } else {
        this.drawFunc = null;
    }

    if ( this.beatMethod != '' ) {
        this.beatFunc = evalInContext('return (function(){' + this.beatMethod + '});', this);
    } else {
        this.beatFunc = null;
    }

    if ( this.dspMethod != '' ) {
        this.dspFunc = evalInContext('return (function(){' + this.dspMethod + '});', this);
    } else {
        this.dspFunc = null;
    }

    this.setupMethod = setupMethod;

    if ( this.setupMethod != '' ) {
        this.setupFunc = evalInContext('return (function(){' + this.setupMethod + '});', this);
    } else {
        this.setupFunc = null;
    }
    
    
    return true;
};

Centi.prototype.start = function(){
    for ( var i=0; i<this.pluginInstances.length; i++ ) {
        this.pluginInstances[i].preSetup();
    }
    if ( this.b3d == false ) {
        this.ctx = this.canvas.getContext("2d");
        this.clear();
    }
    this.reset();

    this.bg(0);
    this.bpm(120,4);
    
    if ( this.setupFunc ) this.setupFunc();

    for ( var i=0; i<this.pluginInstances.length; i++ ) {
        this.pluginInstances[i].postSetup();
    }

};

Centi.prototype.modFunction = function(_str){
    var funcNum = (_str.match(/function/g)||[]).length;
    if ( funcNum > 0 ) {
        var txt = _str;
        var current = 0;
        current = txt.indexOf("function", current) + 7;
        var flag = 0;
        var preFlag = flag;
        while ( current < txt.length ) {
            var s = txt.charAt(current);
            if ( s == '{' ) flag++;
            if ( s == '}' ) flag--;
            if ( preFlag == 1 && flag == 0 ) {
                txt = txt.slice(0, current+1) + ";" + txt.slice(current+1);
                funcNum--;
                if ( funcNum > 0 ) current = txt.indexOf("function", current) + 7;
                else if ( funcNum == 0 ) break;
            }
            preFlag = flag;
            current++;
        }
        _str = txt;
    }
    return _str;
};

Centi.prototype.getInnerExpression = function(_str){
    var txt = _str;
    var start = 0;
    var current = 0;
    start = current = txt.indexOf("{", current);
    if ( start == -1 ) return '';
    var flag = 0;
    var preFlag = flag;
    while ( current < txt.length ) {
        var s = txt.charAt(current);
        if ( s == '{' ) flag++;
        if ( s == '}' ) flag--;
        if ( preFlag == 1 && flag == 0 ) {
            txt = txt.slice(start+1, current);
            break;
        }
        preFlag = flag;
        current++;
    }
    if ( flag == 0 ) return txt;
    else return '';
};

Centi.prototype.update = function(){
    for ( var i=0; i<this.pluginInstances.length; i++ ) {
        this.pluginInstances[i].preUpdate();
    }
    

    if ( this.dsp.enable == false ) {
        this.time = this.now() - this.initSec;
        this.updateBeat();
    } else {
        this.dsp.analyser.getByteFrequencyData(this.fft); //Spectrum Data
        this.dsp.analyser.getByteTimeDomainData(this.waveUint); //Waveform Data
        for ( var i=0; i<this.waveUint.length; i++ ) {
            this.wave[i] = (this.waveUint[i]/255 - 0.5)*2.0;
        }
    }
    
    if ( this.drawFunc ) this.drawFunc();
    //if ( this.b3d && this.renderer ) this.renderer.render(this.scene, this.cam);  
    for ( var i=0; i<this.pluginInstances.length; i++ ) {
        this.pluginInstances[i].postUpdate();
    }
    this.c++;
    if ( this.toGifFunc != null ) this.toGifFunc(this.ctx);
};

Centi.prototype.updateBeat = function(){
    if ( this.time - this.tempo.preSec >= this.tempo.sec ) {
        if ( this.beatFunc ) this.beatFunc();
        //if ( this.beatMethod ) evalInContext(this.beatMethod, this);
        this.tempo.preSec = this.time;
        this.beat ++;
    }
};

Centi.prototype.reset = function(){
    this.c = 0;
    this.initSec = this.now();
    this.time = 0;
    this.bFill = true;
    this.lw(1);
    this.lj(0);
    this.lc(0);
    this.bm(0);
    //this.b3d = false;
};

//centi funcs

Centi.prototype.c2d = function(){ this.b3d = false; };
Centi.prototype.c3d = function(){ this.b3d = true; };


Centi.prototype.bg = function(){
    if ( this.ctx == null ) return;
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

Centi.prototype.lg = function(){ console.log(arguments); };
Centi.prototype.log = function(){ console.log(arguments); };

Centi.prototype.sz = function(_w, _h){ this.size(_w, _h); };
Centi.prototype.size = function(_w, _h){
    this.sizeW = _w;
    this.sizeH = _h;
    var w, h;
    if ( _w <= 1 ) w = window.innerWidth * _w;
    else w = _w;
       
    if ( _h <= 1 ) h = window.innerHeight * _h;
    else h = _h;

    this.w = w;
    this.h = h;
    this.canvas.width = this.w;
    this.canvas.height = this.h;
    this.cx = this.w/2;
    this.cy = this.h/2;
};

Centi.prototype.clr = function(){ this.clear(); };
Centi.prototype.clear = function(){
    if ( this.ctx == null ) return;
    var mode = this.ctx.globalCompositeOperation;
    this.ctx.globalCompositeOperation = 'source-over';
    //this.log(this.ctx.globalCompositeOperation, mode );
    this.ctx.fillStyle = "rgb("+this.bgcolor.r+","+this.bgcolor.g+","+this.bgcolor.b+")";
    this.ctx.fillRect(0,0,this.w, this.h);    
    this.ctx.globalCompositeOperation = mode;
};

Centi.prototype.Obj = function(){ return new Object(); };
Centi.prototype.obj = function(){ return new Object(); };

// Randomize

Centi.prototype.rnd = function(){ return this.rand.apply(this, arguments); };
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
    return this.noise.apply(this, arguments);
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

Centi.prototype.tri = function(){ };
Centi.prototype.tri = function(){
    if ( this.ctx == null ) return;
    if ( arguments.length == 6 ) {
        this.beginShape();
        this.moveTo(arguments[0], arguments[1]);
        this.lineTo(arguments[2], arguments[3]);
        this.lineTo(arguments[4], arguments[5]);
        this.lineTo(arguments[0], arguments[1]);
        this.endShape();
    } else if ( arguments.length == 3 ) {
        this.beginShape();
        this.moveTo(arguments[0].x, arguments[0].y);
        this.lineTo(arguments[1].x, arguments[1].y);
        this.lineTo(arguments[2].x, arguments[2].y);
        this.lineTo(arguments[0].x, arguments[0].y);
        this.endShape();
    }
};

Centi.prototype.rect = function(_x, _y, _w, _h){
    if ( this.ctx == null ) return;
    if ( this.bFill ) this.ctx.fillRect(_x, _y, _w, _h);
    else this.ctx.strokeRect(_x, _y, _w, _h);
};

Centi.prototype.oval = function(_x, _y, _rad, _res) {
    if ( this.ctx == null ) return;
    _res = _res || -1;
    if ( _res == -1 ) {
        this.ctx.beginPath();
        this.ctx.arc(_x, _y, _rad, 0, Math.PI * 2, true);
        if ( this.bFill ) this.ctx.fill();
        else this.ctx.stroke();
    } else {
        if ( _res < 3 ) _res = 3;
        var cr = Math.PI2/_res;
        this.ctx.beginPath();
        for ( var i=0; i<_res; i++ ) {
            var x1 = Math.cos(cr*i)*_rad + _x;
            var y1 = Math.sin(cr*i)*_rad + _y;
            var x2 = Math.cos(cr*(i+1))*_rad + _x;
            var y2 = Math.sin(cr*(i+1))*_rad + _y;
            this.lineTo(x1, y1);
            this.lineTo(x2, y2);
        }
        if ( this.bFill ) this.ctx.fill();
        else this.ctx.stroke();
    }
};

Centi.prototype.ln = function(_x1, _y1, _x2, _y2){ this.line(_x1, _y1, _x2, _y2); };
Centi.prototype.line = function(_x1, _y1, _x2, _y2){
    if ( this.ctx == null ) return;
    this.ctx.beginPath();
    this.ctx.moveTo(_x1, _y1);
    this.ctx.lineTo(_x2, _y2);
    this.ctx.stroke();
};

Centi.prototype.curve = function(){
    if ( this.ctx == null ) return;
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

Centi.prototype.moveTo = function(_x1, _y1){
    if ( this.ctx == null ) return;
    this.ctx.moveTo(_x1, _y1);
};

Centi.prototype.lineTo = function(_x1, _y1){
    if ( this.ctx == null ) return;
    this.ctx.lineTo(_x1, _y1);
};

Centi.prototype.curveTo = function(){
    if ( this.ctx == null ) return;
    if ( arguments.length == 6 ) {
        this.ctx.bezierCurveTo(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
    } else if ( arguments.length == 1 ) {
        if ( arguments[0].length && arguments[0].length == 6 ) {
            this.ctx.bezierCurveTo(arguments[0][0], arguments[0][1], arguments[0][2], arguments[0][3], arguments[0][4], arguments[0][5]);
        }
    }
};

Centi.prototype.beginShape = function(){
    if ( this.ctx == null ) return;
    this.ctx.beginPath();
};

Centi.prototype.endShape = function(){
    if ( this.ctx == null ) return;
    if ( this.bFill ) this.ctx.fill();
    else this.ctx.stroke();
};

Centi.prototype.me = function(){ this.drawMe.apply(this, arguments); };
Centi.prototype.drawMe = function(){
    if ( this.ctx == null ) return;
    var len = arguments.length;
    if ( len == 2 ) {
        this.ctx.drawImage(this.canvas, arguments[0], arguments[1]);
    } else if ( len == 4 ) {
        this.ctx.drawImage(this.canvas, arguments[0], arguments[1], arguments[2], arguments[3]);
    } else if ( len == 8 ) {
        this.ctx.drawImage(this.canvas, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7]);   
    }
};

Centi.prototype.lw = function(_w){ this.lineWidth(_w); };
Centi.prototype.lineWidth = function(_w){
    if ( this.ctx == null ) return;
    this.ctx.lineWidth = _w;
};

Centi.prototype.lj = function(_val){ this.lineJoin(_val); };
Centi.prototype.lineJoin = function(_val){
    if ( this.ctx == null ) return;
    if ( _val == 0 ) this.ctx.lineJoin = 'bevel';
    else if ( _val == 1 ) this.ctx.lineJoin = 'round';
    else if ( _val == 2 ) this.ctx.lineJoin = 'miter';
};

Centi.prototype.lc = function(_val){ this.lineCap(_val); };
Centi.prototype.lineCap = function(_val){
    if ( this.ctx == null ) return;
    if ( _val == 0 ) this.ctx.lineCap = 'butt';
    else if ( _val == 1 ) this.ctx.lineCap = 'round';
    else if ( _val == 2 ) this.ctx.lineCap = 'square';
};

Centi.prototype.bm = function(_val){ this.blendMode(_val); };
Centi.prototype.blendMode = function(_val){
    if ( this.ctx == null ) return;
    var mode = 'source-over';
    var modes = ['source-over', 'multiply', 'screen', 'overlay', 'darken', 'lighten','color-dodge', 'color-burn',
    'hard-light', 'soft-light','difference', 'exclusion', 'hue','saturation','color','luminosity'];
    if ( _val < modes.length ) {
        mode = modes[_val];
        this.ctx.globalCompositeOperation = mode;
    }
};

Centi.prototype.hcol = function(_hex){
    this.col( _hex >> 16 & 0xFF, _hex >> 8 & 0xFF, _hex & 0xFF);
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
    if ( this.ctx == null ) return;
    this.ctx.save();
};

Centi.prototype.pop = function(){
    if ( this.ctx == null ) return;
    this.ctx.restore();
};

Centi.prototype.rotate = function(_rota){
    if ( this.ctx == null ) return;
    this.ctx.rotate(_rota);
};

Centi.prototype.scale = function(_x, _y){
    if ( this.ctx == null ) return;
    this.ctx.scale(_x, _y);
};

Centi.prototype.translate = function(_x, _y){
    if ( this.ctx == null ) return;
    this.ctx.translate(_x, _y);
};

Centi.prototype.transform = function(_a, _b, _c, _d, _e, _f){
    if ( this.ctx == null ) return;
    this.ctx.transform(_a, _b, _c, _d, _e, _f);
};

// draw audio visualization

Centi.prototype.drawFFT = function(_x, _y, _w, _h, _skip, _barW){
    var barW = _barW || 2;
    var skip = _skip || 9;
    var n = this.fft.length;
    var cx = _w/n;
    var sc = _h/255;
    for ( var i=0; i<n; i+=skip ) {
        this.rect(_x + i*cx, _y + _h, barW, -this.fft[i]*sc);
    }
};

Centi.prototype.drawWave = function(_x, _y, _w, _h, _skip){
    var skip = _skip || 9;
    var n = this.wave.length;
    var cx = _w/(n-1);
    var sc = _h/2;
    this.beginShape();
    for ( var i=0; i<n; i+=skip ) {
        this.lineTo(_x + i * cx, _y + sc + this.wave[i] * sc);
    }
    this.endShape();
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

Centi.prototype.minmax = function(_a, _min, _max){ return this.minMax(_a, _min, _max); };
Centi.prototype.minMax = function(_a, _min, _max){
    return Math.min(_max, Math.max(_a, _min));
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

Centi.prototype.radToDeg = function(_radian) { return this.r2d(_radian); }; 
Centi.prototype.r2d = function(_radian) {
    return (_radian * 180) / Math.PI;
};

Centi.prototype.degToRad = function(_degree) { return this.d2r(_degree); }; 
Centi.prototype.d2r = function(_degree) {
    return (_degree * Math.PI) / 180;
};

// kdTree
Centi.prototype.tree = function(_pts){
    this.kdtree = new kdTree(_pts, distance, ["x", "y"]);
    function distance(a, b) {
        return Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y, 2);
    }
};

Centi.prototype.nears = function(_pt, _count, _distance){
    return this.kdtree.nearest(_pt, _count, _distance);
};

// BPM
Centi.prototype.bpm = function(_bpm, _divide){
    this.tempo.bpm = _bpm ? _bpm : 120;
    this.tempo.divide = _divide ? _divide : 4;
    this.tempo.sec = (60/this.tempo.bpm*4)/this.tempo.divide;
    this.tempo.preSec = this.time;
};
// --private


Centi.prototype.noteToFreq = function(_note) { return this.n2f(_note); };
Centi.prototype.n2f = function(_note) {
    return Math.pow(2, (_note - 69) / 12) * 440.0;
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

Centi.prototype.fold = function(_arr){
    if ( _arr.reduce ) {
        return _arr.reduce(function(a,b){return a+b;});
    } else {
        var a = 0;
        for ( var i=0; i<_arr.length; i++ ) a += _arr[i];
        return a;
    }
};

// Geometry

Centi.prototype.Vec2 = function(_x, _y){ return new Centi.Vec2(_x, _y); }
Centi.prototype.vec2 = function(_x, _y){ return new Centi.Vec2(_x, _y); }
// --private
Centi.Vec2 = function(_x, _y){
    this.x = _x;
    this.y = _y;
};

// Utils
Centi.prototype.now = function(){
    return new Date().getTime() / 1000;
};

// Generator
Centi.prototype.grid = function(_w, _h, _col, _row){
    var cw = _w/_col;
    var ch = _h/_row;
    var i, j;
    var a = [];
    for ( i=0; i<_col; i++ ) {
        for ( j=0; j<_row; j++ ) {
            a.push( {ix:i, iy:j, x:i*cw, y:j*ch, w:cw, h:ch} );
        }
    }
    return a;
};

// OOP
Centi.prototype.new = function(constructor, args){
    function F() { constructor.apply(this, args); }
    F.prototype = constructor.prototype;
    return new F();
};

// 7seg
Centi.prototype.seg = function(_num, _x, _y, _w, _h){
    var bin = [1,2,11,19,20,29,37];
    var data = [0x77,0x24,0x5D,0x6D,0x2E,0x6B,0x7B,0x25,0x7F,0x6F];
    if ( _num > 9 ) _num = 9;
    var n=(data[_num]);
    for(var i=0; i<7; i++){
        if( n & 1 ){
            var p = (bin[i] & 7);
            var q = (bin[i] >> 3);
            ct.line(_x+_w*(p & 1),_y+0.5*_h*( p >> 1),_x+_w*(q & 1),_y+0.5*_h*(q >> 1));
        }
        n=(n >> 1);
    }
};


// centi funcs

var CT_FUNCS = Object.getOwnPropertyNames(Centi.prototype);
