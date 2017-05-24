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

var MATH_PROPS = ["E", "LN2", "LN10", "LOG2E", "LOG10E", "PI", "PI2", "HALF_PI", "SQRT1_2", "SQRT2"];
var MATHS = ["abs", "acos", "asin", "atan", "atan2",
           "ceil", "cos", "exp", "floor", "imul", "log", "max", "min", "pow", "random", "round", "sin", "sqrt", "tan"];
var CTX_FUNCS = Object.getOwnPropertyNames(CanvasRenderingContext2D.prototype);

Math.PI2 = Math.PI*2.0;
Math.HALF_PI = Math.PI/2.0;

var CT_PROPS;

var Centi = function(name, editor){
    this.ver = '0.4.9k';
    this.name = name ? name : "ct";
    this.editor = editor ? editor : null;

    this.canvas = null;
    this.ctx = null;

    this.tempCanvas = null;
    this.tempCtx = null;
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
    //mouse
    this.mx = 0;
    this.my = 0;
    this.down = false;
    this.mouseScale = 1;
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
    this.bgcolor = {r:0, g:0, b:0, a:255};
    this.drawcolor = {r:0, g:0, b:0, a:255};
    this.bFill = true;
    this.gradient = null;
    this.kdtree;
    //
    this.centiCode;
    this.setupMethod = '';
    this.drawMethod = '';
    this.beatMethod = '';
    this.dspMethod = '';
    this.setupFunc = null;
    this.drawFunc = null;
    this.beatFunc = null;
    this.dspFunc = null;

    this.mouseMoveMethod = '';
    this.mouseDownMethod = '';
    this.mouseUpMethod = '';
    this.mouseMove = null;
    this.mouseDown = null;
    this.mouseUp = null;
    //
    this.toGifFunc = null;
    //THREE
    this.b3d = false;

    this.pluginInstances = [];

    for ( var i=0; i<MATHS.length; i++ ) {
        this[MATHS[i]] = Math[MATHS[i]];
    }
    for ( var i=0; i<MATH_PROPS.length; i++ ) {
        this[MATH_PROPS[i]] = Math[MATH_PROPS[i]];
    }

    // Tween
    this.ease = TWEEN.Easing;
    this.Linear = TWEEN.Easing.Linear.None;
    this.eases = [this.Linear];
    var short_eases = ["Quad", "Cubic", "Quart", "Quint", "Sine", 
    "Expo", "Circ", "Elastic", "Back", "Bounce"];
    var eases = ["Quadratic", "Cubic", "Quartic", "Quintic", "Sinusoidal", 
    "Exponential", "Circular", "Elastic", "Back", "Bounce"];
    for ( var i = 0; i<short_eases.length; i++ ) {
        this[short_eases[i]+"In"] = TWEEN.Easing[eases[i]].In;
        this[short_eases[i]+"Out"] = TWEEN.Easing[eases[i]].Out;
        this[short_eases[i]+"InOut"] = TWEEN.Easing[eases[i]].InOut;
        this.eases.push(this[short_eases[i]+"In"]
            ,this[short_eases[i]+"Out"]
            ,this[short_eases[i]+"InOut"]);
    }
    

    //staticies

    if ( !CT_PROPS ) {
        var props = [];
        for(var prop in this){
            if ( CT_FUNCS.indexOf(prop) == -1 ) props.push(prop);
        }
        CT_PROPS = props;
    }
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
        //this.dsp.context.distination.disconnect();
    }
    this.dsp.context = null;
    this.canvas = null;
    this.ctx = null;
    this.tempCanvas = null;
    this.tempCtx = null;

    this.dsp = null;
    this.tempo = null;

    this.toGifFunc = null;

    this.setupFunc = null;
    this.drawFunc = null;
    this.beatFunc = null;
    this.dspFunc = null;

    this.mouseMove = null;
    this.mouseDown = null;
    this.mouseUp = null;

    this.fft = null;
    this.wave = null;

    this.b3d = false;

    this.pluginInstances = null;
};

Centi.prototype.init = function(canvas, audioContext){
    this.canvas = canvas;

    this.tempCanvas = document.createElement("canvas"),
    this.tempCtx = this.tempCanvas.getContext("2d");
    
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
            var isNumber = (typeof self.doDsp() == 'number');
            for (var i = 0; i < this.bufferSize; i++) {
                var t = self.time;
                var value = self.doDsp();
                if ( isNumber ) {
                    outL[i] = value;
                    outR[i] = value;
                } else if ( value.length == 2 ) {
                    outL[i] = value[0];
                    outR[i] = value[1];
                }
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

Centi.prototype.feedback = function(value){
    if ( !this.editor ) return;
    var value_str = valueToString(value);
    
    for(var pname in this){
        if ( CT_PROPS.indexOf(pname) == -1 && this[pname] === value ){
            this.centiCode = insertValue(this.centiCode, pname, value_str);
            this.editor.setValue(this.centiCode);
            break;
        }
    }

    function valueToString(value){
        var s = "";
        if ( is("Array", value) ) {
            s = "[";
            if ( value.length > 0 ) {
                for ( var i=0; i<value.length; i++ ) {
                    s += valueToString(value[i]) + ",";
                }
                s = s.slice(0, - 1);
            }
            s += "]";
        } else if ( is("Number", value) ) {
            s = value.toString();
        } else if ( is("Object", value) ) {
            s = objToString(value);
        } else if ( is("Boolean", value) ) {
            s = (value) ? "1" : "0";
        }
        return s;
    }

    function objToString(obj){
        var s = "{";
        for ( var pname in obj ) {
            s += pname + ":" + obj[pname] + ",";
        }
        if ( s.length > 1 ) {
            s = s.slice(0, - 1);
        }
        s += "}";
        return s;
    }

    function is(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }

    function insertValue(src, name, val_str){
        var txt = src;
        if ( txt.length > 0 ) {
            var current = 0;
            current = txt.indexOf(name+"=");
            if ( current == -1 ) current = txt.indexOf(name+" =");
            if ( current > -1 ) {
                var start = current;
                var flag = 0;
                var preFlag = flag;
                while ( current < txt.length ) {
                    var s = txt.charAt(current);
                    if ( s == '(' ) flag++;
                    if ( s == ')' ) flag--;
                    if ( preFlag == 1 && flag == 0 ) {
                        txt = txt.slice(0, start+name.length) + "=(" + val_str + ")" + txt.slice(current+1);
                        break;
                    }
                    preFlag = flag;
                    current++;
                }
            }
        }
        return txt;
    }
}

Centi.prototype.parse = function(tw){
    this.centiCode = tw;

    tw = tw.replace(/\s/g, "");
    tw = tw.replace(/\b/g, "");
    tw = tw.replace(/(\))([A-Za-z0-9_\}])/g, ");$2");
    tw = tw.replace(/(for\()([A-Za-z_\-\.\(\)]+)(\,)([A-Za-z0-9_\-\.\(\)]+)(\,)([A-Za-z0-9_\-\.\(\)\*\+\/]+)(\))/g, "for($2=$4;$2<$6;$2++)");

    var frameMethod = this.getInnerExpression(tw.slice(tw.indexOf('frame(){')));
    var beatMethod = this.getInnerExpression(tw.slice(tw.indexOf('beat(){')));
    var dspMethod = this.getInnerExpression(tw.slice(tw.indexOf('dsp(){')));

    var mouseMoveMethod = this.getInnerExpression(tw.slice(tw.indexOf('move(){')));
    var mouseDownMethod = this.getInnerExpression(tw.slice(tw.indexOf('down(){')));
    var mouseUpMethod = this.getInnerExpression(tw.slice(tw.indexOf('up(){')));

    var setupMethod = tw.replace('frame(){' + frameMethod + '}', '');
    setupMethod = setupMethod.replace('beat(){' + beatMethod + '}', '');
    setupMethod = setupMethod.replace('dsp(){' + dspMethod + '}', '');
    setupMethod = setupMethod.replace('move(){' + mouseMoveMethod + '}', '');
    setupMethod = setupMethod.replace('down(){' + mouseDownMethod + '}', '');
    setupMethod = setupMethod.replace('up(){' + mouseUpMethod + '}', '');
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

    mouseMoveMethod = replace(mouseMoveMethod, this.name);
    mouseMoveMethod = this.modFunction(mouseMoveMethod);

    mouseDownMethod = replace(mouseDownMethod, this.name);
    mouseDownMethod = this.modFunction(mouseDownMethod);

    mouseUpMethod = replace(mouseUpMethod, this.name);
    mouseUpMethod = this.modFunction(mouseUpMethod);

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
        /*
        for ( var i=0; i<MATHS.length; i++ ) {
            var math_word = name + "." + MATHS[i] + "\\(";
            str = str.replace(new RegExp(math_word, "g"), "Math." + MATHS[i] + "(");
        }*/
        /*for ( var i=0; i<MATH_PROPS.length; i++ ) {
            str = str.replace(new RegExp(name + "." + MATH_PROPS[i] + "([\.\!\~\|\%\&\:\(\)\{\}\;\=\+\-\<\>\*\/\[\]\,\^])", "g"), "Math." + MATH_PROPS[i]);
        }*/

        var BUILDIN_STATICIES = ["Infinity", "NaN", "undefined", "null", "this", "true", "false"];
        for ( var i=0; i<BUILDIN_STATICIES.length; i++ ) {
            str = str.replace(new RegExp(name + "." + BUILDIN_STATICIES[i], "g"), BUILDIN_STATICIES[i]);
        }

        var NUMBER_STATICIES = ["MAX_VALUE", "MIN_VALUE", "POSITIVE_INFINITY", "NEGATIVE_INFINITY"];
        for ( var i=0; i<NUMBER_STATICIES.length; i++ ) {
            str = str.replace(new RegExp(name + "." + NUMBER_STATICIES[i], "g"), "Number." + NUMBER_STATICIES[i]);
        }

        var objParamsReg = new RegExp(name + "\.([A-Za-z0-9_]+)(\:)([A-Za-z0-9_\.\(\)]+)(\,)", "g");
        str = str.replace(objParamsReg, "$1" + ":" + "$3" + ",");
        var objParamsReg2 = new RegExp(name + "\.([A-Za-z0-9_]+)(\:)([A-Za-z0-9_\.\(\)]+)(\})", "g");
        str = str.replace(objParamsReg2, "$1" + ":" + "$3" + "}");
        return str;
    }

    // console.log(setupMethod);
    // console.log(frameMethod);
    // console.log(beatMethod);
    // console.log(dspMethod);
    // console.log(mouseMoveMethod);
    // console.log(mouseDownMethod);
    // console.log(mouseUpMethod);

    this.drawMethod = frameMethod;
    this.beatMethod = beatMethod;
    this.dspMethod = dspMethod;

    this.mouseMoveMethod = mouseMoveMethod;
    this.mouseDownMethod = mouseDownMethod;
    this.mouseUpMethod = mouseUpMethod;

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

    if ( this.mouseMoveMethod != '' ) {
        this.mouseMove = evalInContext('return (function(){' + this.mouseMoveMethod + '});', this);
    } else {
        this.mouseMove = null;
    }

    if ( this.mouseDownMethod != '' ) {
        this.mouseDown = evalInContext('return (function(){' + this.mouseDownMethod + '});', this);
    } else {
        this.mouseDown = null;
    }

    if ( this.mouseUpMethod != '' ) {
        this.mouseUp = evalInContext('return (function(){' + this.mouseUpMethod + '});', this);
    } else {
        this.mouseUp = null;
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

    this.col(255);

    if ( this.canvas.addEventListener ) {
        this.canvas.removeEventListener("mousemove", this);
        this.canvas.removeEventListener("mousedown", this);
        this.canvas.removeEventListener("mouseup", this);

        this.canvas.addEventListener("mousemove", this, false);
        this.canvas.addEventListener("mousedown", this, false);
        this.canvas.addEventListener("mouseup", this, false);
    }

    if ( this.canvas.addEventListener && document.addEventListener ) {
        this.canvas.removeEventListener("touchstart", this);
        this.canvas.removeEventListener("touchmove", this);
        document.removeEventListener("touchend", this);
        document.removeEventListener("touchcancel", this);

        this.canvas.addEventListener("touchstart", this, false);
        this.canvas.addEventListener("touchmove", this, false);
        
        document.addEventListener("touchend", this, false);
        document.addEventListener("touchcancel", this, false);
    }

};

Centi.prototype.handleEvent = function(e){
    var self = this;
    switch ( e.type ) {
        case "mousedown":
            setMousePosition(e);
            this.down = true;
            if ( this.mouseDown ) this.mouseDown(e);
            break;
        case "mousemove":
            setMousePosition(e);
            if ( this.mouseMove ) this.mouseMove(e);
            break;
        case "mouseup":
            setMousePosition(e);
            this.down = false;
            if ( this.mouseUp ) this.mouseUp(e);
            break;

        case "touchstart":
            serTouchPosition(e);
            this.down = true;
            if ( this.mouseDown ) this.mouseDown(e);
            break;
        case "touchmove":
            serTouchPosition(e);
            if ( this.mouseMove ) this.mouseMove(e);
            e.preventDefault();
            break;
        case "touchend":
        case "touchcancel":
            serTouchPosition(e);
            this.down = false;
            if ( this.mouseUp ) this.mouseUp(e);
            break;
    }
    function setMousePosition(e){
        var rect = self.canvas.getBoundingClientRect();
        self.mx = (e.clientX - rect.left)*self.mouseScale;
        self.my = (e.clientY - rect.top)*self.mouseScale;
    }

    function serTouchPosition(e){
        self.mx = e.layerX * self.mouseScale;
        self.my = e.layerY * self.mouseScale;   
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

        _str = _str.replace(';};);', ';});');
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

    TWEEN.update();
    
    this.ctx.shadowBlur = 0;

    this.push();
    if ( this.drawFunc ) this.drawFunc();
    this.pop();
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
    this.bg(0);
    this.col(255);
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
        this.bgcolor.a = 255; 
    } else if ( len == 2 ) {
        this.bgcolor.r = parseInt(arguments[0]);
        this.bgcolor.g = parseInt(arguments[0]);
        this.bgcolor.b = parseInt(arguments[0]); 
        this.bgcolor.a = parseInt(arguments[1]); 
    } else if ( len == 3 ) {
        this.bgcolor.r = parseInt(arguments[0]);
        this.bgcolor.g = parseInt(arguments[1]);
        this.bgcolor.b = parseInt(arguments[2]);  
        this.bgcolor.a = 255;   
    } else if ( len == 4 ) {
        this.bgcolor.r = parseInt(arguments[0]);
        this.bgcolor.g = parseInt(arguments[1]);
        this.bgcolor.b = parseInt(arguments[2]); 
        this.bgcolor.a = parseInt(arguments[3]);     
    }
    this.clear();
};

Centi.prototype.lg = function(){ console.log(arguments); };
Centi.prototype.log = function(){ console.log(arguments); };

Centi.prototype.sz = 
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

    this.tempCanvas.width = this.w;
    this.tempCanvas.height = this.h;
};

Centi.prototype.clr = 
Centi.prototype.clear = function(){
    if ( this.ctx == null ) return;
    var mode = this.ctx.globalCompositeOperation;
    this.ctx.globalCompositeOperation = 'source-over';
    //this.log(this.ctx.globalCompositeOperation, mode );
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.ctx.fillStyle = "rgba("+this.bgcolor.r+","+this.bgcolor.g+","+this.bgcolor.b+","+(this.bgcolor.a/255.0)+")";
    this.ctx.fillRect(0,0,this.w, this.h);    
    this.ctx.globalCompositeOperation = mode;
    this.col(255);
};

Centi.prototype.Obj = 
Centi.prototype.obj = function(){ return new Object(); };

// Randomize

Centi.prototype.rnd = 
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

Centi.prototype.nz = 
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
Centi.prototype.pixel = function(_x, _y, _snap){
    if ( this.ctx == null ) return;
    _snap = _snap === undefined ? true : _snap;
    if ( _snap ) this.rect(Math.floor(_x),Math.floor(_y),1,1);
    else this.rect(_x,_y,1,1);
};

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
        var int_res = parseInt(_res);
        for ( var i=0; i<_res; i++ ) {
            var r1 = cr*i;
            var r2 = cr*(i+1);
            if ( i > int_res - 1 ) r2 = 0; 
            var x1 = Math.cos(r1)*_rad + _x;
            var y1 = Math.sin(r1)*_rad + _y;
            var x2 = Math.cos(r2)*_rad + _x;
            var y2 = Math.sin(r2)*_rad + _y;
            this.lineTo(x1, y1);
            this.lineTo(x2, y2);
        }
        if ( this.bFill ) this.ctx.fill();
        else this.ctx.stroke();
    }
};

Centi.prototype.arc = function(_x, _y, _rad, _start, _end, _anticlockwise) {
    if ( this.ctx == null ) return;
    if ( _anticlockwise == undefined ) _anticlockwise = false;
    this.ctx.beginPath();
    this.ctx.arc(_x, _y, _rad, _start, _end, _anticlockwise);
    if ( this.bFill ) this.ctx.fill();
    else this.ctx.stroke();
};

Centi.prototype.ln = 
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

Centi.prototype.lines = function(_pts, _closed){
    _closed = _closed || false;
    var l = _pts.length;
    if ( l >= 2 ) {
        var arr = _pts;
        var first = arr[0];
        var isPoint = ( first.hasOwnProperty("x") && first.hasOwnProperty("y") );
        if ( isPoint ) {
            var pt;
            for ( var i=0; i<l; i++ ) {
                pt = arr[i];
                if ( i==0 ) this.moveTo(pt.x, pt.y);
                else this.lineTo(pt.x, pt.y);
            }
            if ( _closed ) {
                pt = arr[0];
                this.lineTo(pt.x, pt.y);
            }
        } else {
            var x,y;
            for ( var i=0; i<l; i+=2 ) {
                x = arr[i];
                y = arr[i+1];
                if ( i==0 ) this.moveTo(x, y);
                else this.lineTo(x, y);
            }
            if ( _closed ) {
                x = arr[0];
                y = arr[1];
                this.lineTo(x, y);
            }
        }
    }
};

Centi.prototype.text = function(){
    if ( this.ctx == null ) return;
    var len = arguments.length;
    if ( len == 1 ) {
        if ( this.bFill ) this.ctx.fillText(arguments[0], 0, 0);
        else this.ctx.strokeText(arguments[0], 0, 0);
    } else if ( len == 2 ) {
        if ( this.bFill ) this.ctx.fillText(arguments[0], arguments[1], arguments[2]);
        else this.ctx.strokeText(arguments[0], arguments[1], arguments[2]);
    } else if ( len == 3 ) {
        if ( this.bFill ) this.ctx.fillText(arguments[0], arguments[1], arguments[2]);
        else this.ctx.strokeText(arguments[0], arguments[1], arguments[2]);
    } else if ( len == 4 ) {
        if ( this.bFill ) this.ctx.fillText(arguments[0], arguments[1], arguments[2], arguments[3]);
        else this.ctx.strokeText(arguments[0], arguments[1], arguments[2], arguments[3]);
    }
    
}

Centi.prototype.font = function(){//font, size, bold, italic
    var len = arguments.length;
    if ( len == 1 ) {
        if ( arguments[0] instanceof String ) {
            this.ctx.font = "12px " + arguments[0];
        } else {
            this.ctx.font = arguments[0] + "px 'Helvetica'";
        }    
        
    } else if ( len == 2 ) {
        this.ctx.font = arguments[1] + "px " + arguments[0];
    } else if ( len == 3 ) {
        this.ctx.font = (arguments[2] ? "bold " : "") + arguments[1] + "px " + arguments[0];
    } else if ( len == 4 ) {
        this.ctx.font = (arguments[3] ? "italic " : "") + (arguments[2] ? "bold " : "") + arguments[1] + "px " + arguments[0];
    }
    
}

Centi.prototype.boundingBox = function(_pts){
    var l = _pts.length;
    var min = this.Vec2(Infinity, Infinity);
    var max = this.Vec2(-Infinity, -Infinity);
    
    if ( l > 0 ) {
        var arr = _pts;
        var first = arr[0];
        var isPoint = ( first.hasOwnProperty("x") && first.hasOwnProperty("y") );
        if ( isPoint ) {
            var pt;
            for ( var i=0; i<l; i++ ) {
                pt = arr[i];
                if( pt.x < min.x ) min.x = pt.x;
                if( pt.y < min.y ) min.y = pt.y;
                if( pt.x > max.x ) max.x = pt.x;
                if( pt.y > max.y ) max.y = pt.y;
                     
            }
        } else {
            var x,y;
            for ( var i=0; i<l; i+=2 ) {
                x = arr[i];
                y = arr[i+1];
                if( x < min.x ) min.x = x;
                if( y < min.y ) min.y = y;
                if( x > max.x ) max.x = x;
                if( y > max.y ) max.y = y;
            }
        }
        return this.Rectangle(min.x, min.y, max.x-min.x, max.y - min.y);
    } else {
        return this.Rectangle(0,0,0,0);
    }
};

Centi.prototype.strk2fill = function(a, wid, sub){
    if ( !a ) return [];
    var l=a.length;
    if ( l == 0 ) return [];
    wid = wid || 1;
    sub = parseInt(sub) || 1;
    if ( sub <= 0 ) sub = 1;
    var pre;
    var arr = [];
    var left = [];
    var right = [];
    for ( var i=0; i<l; i+=sub ) {
      if ( pre ) {
        var pt = a[i];
        var vec = this.Vec2(pre.y-pt.y, pt.x-pre.x);
        vec = vec.normalized();

        var pt1 = this.Vec2(pt.x + vec.x*wid/2, pt.y + vec.y*wid/2);
        var pt2 = this.Vec2(pt.x - vec.x*wid/2, pt.y - vec.y*wid/2);

        var pt3 = this.Vec2(pre.x + vec.x*wid/2, pre.y + vec.y*wid/2);
        var pt4 = this.Vec2(pre.x - vec.x*wid/2, pre.y - vec.y*wid/2);
        if ( i == sub ) {
          left.push(pt3);
          right.unshift(pt4);
        } else if ( i > sub ) {
          var pre1 = left[left.length - 1];
          var pre2 = right[0];
          left[left.length - 1].x = (pre1.x + pt3.x)/2;
          left[left.length - 1].y = (pre1.y + pt3.y)/2;
          
          right[0].x = (pre2.x + pt4.x)/2;
          right[0].y = (pre2.y + pt4.y)/2;
          
        }
        left.push(pt1);
        right.unshift(pt2);
        pre = pt;
      } else {
        pre = a[i];
      }
    }
    l = left.length;
    arr = arr.concat(left);
    arr = arr.concat(right);
    return arr;
};

Centi.prototype.xys2pts = function(a){
    var arr = a || [];
    if ( arr.length == 0 ) return [];
    var first = arr[0];
    var isPoint = ( first.hasOwnProperty("x") && first.hasOwnProperty("y") );
    if ( isPoint ) return arr;

    var arr2 = [];
    var l = arr.length;
    for ( var i=0; i<l; i+=2 ) {
        arr2.push(this.Vec2(arr[i], arr[i+1]));
    }
    return arr2;
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

Centi.prototype.me = 
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

Centi.prototype.lw = 
Centi.prototype.lineWidth = function(_w){
    if ( this.ctx == null ) return;
    this.ctx.lineWidth = _w;
};

Centi.prototype.lj = 
Centi.prototype.lineJoin = function(_val){
    if ( this.ctx == null ) return;
    if ( _val == 0 ) this.ctx.lineJoin = 'bevel';
    else if ( _val == 1 ) this.ctx.lineJoin = 'round';
    else if ( _val == 2 ) this.ctx.lineJoin = 'miter';
};

Centi.prototype.lc = 
Centi.prototype.lineCap = function(_val){
    if ( this.ctx == null ) return;
    if ( _val == 0 ) this.ctx.lineCap = 'butt';
    else if ( _val == 1 ) this.ctx.lineCap = 'round';
    else if ( _val == 2 ) this.ctx.lineCap = 'square';
};

Centi.prototype.bm = 
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
    if ( _hex >> 24 > 0 ) this.col( _hex >> 16 & 0xFF, _hex >> 8 & 0xFF, _hex & 0xFF, _hex >> 24 & 0xFF);
    else this.col( _hex >> 16 & 0xFF, _hex >> 8 & 0xFF, _hex & 0xFF);
};
Centi.prototype.col = function(){
    var len = arguments.length;
    var s = "rgb(0,0,0)";
    if ( len == 1 ) {
        this.drawcolor.r = arguments[0];
        this.drawcolor.g = arguments[0];
        this.drawcolor.b = arguments[0];
        this.drawcolor.a = 255;
        s = "rgb(" + parseInt(arguments[0]) + "," + parseInt(arguments[0]) + "," + parseInt(arguments[0]) + ")";
    } else if ( len == 2 ) {
        this.drawcolor.r = arguments[0];
        this.drawcolor.g = arguments[0];
        this.drawcolor.b = arguments[0];
        this.drawcolor.a = arguments[1];
        s = "rgba(" + parseInt(arguments[0]) + "," + parseInt(arguments[0]) + "," + parseInt(arguments[0]) + "," + parseInt(arguments[1])/255.0 + ")";
    } else if ( len == 3 ) {    
        this.drawcolor.r = arguments[0];
        this.drawcolor.g = arguments[1];
        this.drawcolor.b = arguments[2];
        this.drawcolor.a = 255;
        s = "rgb(" + parseInt(arguments[0]) + "," + parseInt(arguments[1]) + "," + parseInt(arguments[2]) + ")";
    } else if ( len == 4 ) {
        this.drawcolor.r = arguments[0];
        this.drawcolor.g = arguments[1];
        this.drawcolor.b = arguments[2];
        this.drawcolor.a = arguments[3];
        s = "rgba(" + parseInt(arguments[0]) + "," + parseInt(arguments[1]) + "," + parseInt(arguments[2]) + "," + parseInt(arguments[3])/255.0 + ")";
    }
    this.ctx.fillStyle = s;
    this.ctx.strokeStyle = s;
    this.gradient = null;
};

Centi.prototype.fill = function(){
    this.bFill = true;
    this.gradient = null;
};

Centi.prototype.strk = 
Centi.prototype.stroke = function(){
    this.bFill = false;
    this.gradient = null;
};

Centi.prototype.grad = function(_x0, _y0, _x1, _y1){
    this.bFill = true;
    if ( !this.ctx ) return;
    this.gradient = this.ctx.createLinearGradient(_x0, _y0, _x1, _y1);
    this.ctx.fillStyle = this.gradient;
};

Centi.prototype.gradR = function(_x0, _y0, _r0, _x1, _y1, _r1){
    this.bFill = true;
    if ( !this.ctx ) return;
    this.gradient = this.ctx.createRadialGradient(_x0, _y0, _r0, _x1, _y1, _r1);
    this.ctx.fillStyle = this.gradient;
};

Centi.prototype.gradColor = function(_ratio, _r, _g, _b, _a){
    if ( !this.gradient ) return;
    _ratio = this.minmax(_ratio, 0, 1);
    var a = [];
    if ( arguments.length > 1 ) {
        for ( var i=1; i<arguments.length; i++ ) a.push(arguments[i]);
    }
    this.gradient.addColorStop(_ratio, this.colorString.apply(this, a));
};

Centi.prototype.gradHex = function(_ratio, _hex){
    if ( !this.gradient ) return;
    _ratio = this.minmax(_ratio, 0, 1);
    var a = [];
    _hex = _hex === undefined ? 0xFFFFFF : _hex;
    if ( _hex >> 24 > 0 ) a = [_hex >> 16 & 0xFF, _hex >> 8 & 0xFF, _hex & 0xFF, _hex >> 24 & 0xFF];
    else a = [_hex >> 16 & 0xFF, _hex >> 8 & 0xFF, _hex & 0xFF, 255];
    this.gradient.addColorStop(_ratio, this.colorString.apply(this, a));
};

Centi.prototype.colorString = function(){
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
    return s;
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
    if ( skip < 1 ) skip = 1;
    var n = this.fft.length;
    var cx = _w/n;
    var sc = _h/255;
    for ( var i=0; i<n; i+=skip ) {
        this.rect(_x + i*cx, _y + _h, barW, -this.fft[i]*sc);
    }
};

Centi.prototype.drawWave = function(_x, _y, _w, _h, _skip){
    var skip = _skip || 9;
    if ( skip < 1 ) skip = 1;
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
        while ( _a < _min ) _a += d;
        while ( _a > _max ) _a -= d;
        return _a;
    } else {
        return _a;
    }
};

Centi.prototype.minmax = 
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

Centi.prototype.radToDeg = 
Centi.prototype.r2d = function(_radian) {
    return (_radian * 180) / Math.PI;
};

Centi.prototype.degToRad = 
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

Centi.prototype.noteToFreq = 
Centi.prototype.n2f = function(_note) {
    return Math.pow(2, (_note - 69) / 12) * 440.0;
};

// iter
Centi.prototype.loop = function(_s,_e,_f){
    var n = _s;
    var t = _e;
    var inc = _e - _s > 0 ? 1 : -1;
    var cnt = inc == 1 ? _e - _s : -(_e - _s);
    while ( cnt >= 0  ) {
        _f(n);
        n += inc;
        cnt--;
    }
}

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

Centi.prototype.remove = function(_arr, _eval){
    var a = [];
    var l = _arr.length;
    for ( var i=0; i<l; i++ ) {
        if ( !_eval(_arr[i]) ) {
            a.push(_arr[i]);
        }
    }
    return a;
};

Centi.prototype.clip = function(_arr, _num){
    if ( _arr.length < _num ) return _arr;
    return _arr.slice(_arr.length-_num);
};

// Geometry

Centi.prototype.Vec2 = function(_x, _y){ return new Centi.Vec2(_x, _y); };
Centi.prototype.vec2 = function(_x, _y){ return new Centi.Vec2(_x, _y); };

Centi.prototype.Rectangle = function(_x, _y, _w, _h){ return new Centi.Rectangle(_x, _y, _w, _h); };
// --private
Centi.Numerical = new function(){
    return {
        EPSILON: 10e-12,
        isZero: function(val){
            return Math.abs(val) <= this.EPSILON;
        }
    };
};

Centi.Vec2 = function(_x, _y){
    this.x = _x || 0;
    this.y = _y || 0;
};
Centi.Vec2.prototype.set = function(_x, _y) {
    this.x = _x;
    this.y = _y;
    return this;
};

Centi.Vec2.prototype.clone = function() {
    return new Centi.Vec2(this.x, this.y);
};

Centi.Vec2.prototype.equals = function(point) {
    return this === _vec2 || _vec2
            && (this.x === _vec2.x && this.y === _vec2.y
                || Array.isArray(_vec2)
                    && this.x === _vec2[0] && this.y === _vec2[1])
            || false;
};

Centi.Vec2.prototype.normalized = function(){
    var len = 1.0 / Math.sqrt(this.x*this.x + this.y*this.y);
    return new Centi.Vec2(this.x/len, this.y/len); 
};
Centi.Vec2.prototype.normalize = function(){
    var len = Math.sqrt(this.x*this.x + this.y*this.y);
    this.x = this.x/len;
    this.y = this.y/len; 
};
Centi.Vec2.prototype.dist = Centi.Vec2.prototype.distance = function(){
    var l = arguments.length;
    if ( l == 1 ) {
        var _pt = arguments[0];
        if ( _pt ) {
            var dx = this.x - _pt.x;
            var dy = this.y - _pt.y;
            var len = Math.sqrt(dx*dx + dy*dy);
            return len;
        }
    } else if ( l == 0 ) {
        var len = Math.sqrt(this.x*this.x + this.y*this.y);
        return len;
    } else if ( l == 2 ) {
        var dx = this.x - arguments[0];
        var dy = this.y - arguments[1];
        var len = Math.sqrt(dx*dx + dy*dy);
        return len;
    }  
};

Centi.Vec2.prototype.dot = function(_vec2){
    return this.x * _vec2.x + this.y + _vec2.y;
};

Centi.Vec2.prototype.cross = function(_vec2){
    return this.x * _vec2.x - this.y + _vec2.y;
};
Centi.Vec2.prototype.rotation = function() {
    if (!arguments.length) {
        return this.isZero()
                ? this._rotation || 0
                : this._rotation = Math.atan2(this.y, this.x);
    } else {
        var point = arguments[0];
        var div = this.len() * point.len();
        if (Numerical.isZero(div)) {
            return NaN;
        } else {
            var a = this.dot(point) / div;
            return Math.acos(a < -1 ? -1 : a > 1 ? 1 : a);
        }
    }
};
Centi.Vec2.prototype.setRotation = function(radian) {
    this._rotation = radian;
    if (!this.isZero()) {
        var length = this.len();
        this.set(
            Math.cos(radian) * length,
            Math.sin(radian) * length
        );
    }
};

Centi.Vec2.prototype.len = function(){
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

Centi.Vec2.prototype.setLen = function(_len){
    if (this.isZero()) {
        var rotation = this._rotation || 0;
        this.set(
            Math.cos(rotation) * _len,
            Math.sin(rotation) * _len
        );
    } else {
        var scale = _len / this.len();
        if (Centi.Numerical.isZero(scale))
            this.rotation();
        this.set(
            this.x * scale,
            this.y * scale
        );
    }
};

Centi.Vec2.prototype.rotate = function(radian, center) {
    if (radian === 0)
        return this.clone();
    var point = center ? this.subtract(center) : this,
        s = Math.sin(radian),
        c = Math.cos(radian);
    point = new Centi.Vec2(
        point.x * c - point.y * s,
        point.x * s + point.y * c
    );
    return center ? point.add(center) : point;
};

Centi.Vec2.prototype.add = function(_vec2) {
    return new Centi.Vec2(this.x + _vec2.x, this.y + _vec2.y);
};

Centi.Vec2.prototype.subtract = function(_vec2) {
    return new Centi.Vec2(this.x - _vec2.x, this.y - _vec2.y);
};

Centi.Vec2.prototype.multiply = function(_vec2) {
    return new Centi.Vec2(this.x * _vec2.x, this.y * _vec2.y);
};

Centi.Vec2.prototype.divide = function(_vec2) {
    return new Centi.Vec2(this.x / _vec2.x, this.y / _vec2.y);
};

Centi.Vec2.prototype.modulo = function(_vec2) {
    return new Centi.Vec2(this.x % _vec2.x, this.y % _vec2.y);
};

Centi.Vec2.prototype.negate = function() {
    return new Centi.Vec2(-this.x, -this.y);
};

Centi.Vec2.prototype.isZero = function() {
    return Centi.Numerical.isZero(this.x) && Centi.Numerical.isZero(this.y);
};

Centi.Rectangle = function(_x, _y, _w, _h){
    this.x = _x || 0;
    this.y = _y || 0;
    this.w = this.width = _w || 0;
    this.h = this.height = _h || 0; 
    this.r = this.right = this.x + this.w;
    this.b = this.bottom = this.y + this.h;   
};
/*
Centi.Rectangle.prototype = {
    constructor: Centi.Rectangle,
    set r(val){
        this.r = val;
        this.w = this.r - this.x;
    },
    get r(){
        return this.r;
    },
    set b(val){
        this.b = val;
        this.h = this.b - this.y;
    },
    get b(){
        return this.b;
    }
};*/

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

// Tween
Centi.prototype.tween = function(params){
    var tw = new TWEEN.Tween(params);
    return tw;
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
            this.line(_x+_w*(p & 1),_y+0.5*_h*( p >> 1),_x+_w*(q & 1),_y+0.5*_h*(q >> 1));
        }
        n=(n >> 1);
    }
};

// 7seg
Centi.prototype.segs = function(_num, _x, _y, _w, _h, _spacing){
    var l = arguments.length;
    var spaceing = 0.1;
    if ( l < 5 ) {
        return;
    } else if ( l == 6 ) {
        spaceing = _spacing;
    }
    var str = _num.toString(10);
    var x = _x;
    for (var i = 0, chr; i < str.length; i++) {
        var c = str.charAt(i);
        var n = parseInt(c, 10);
        if ( isNaN(n) ) {
            x += _w*0.1 + _w*spaceing;
        } else {
            this.seg(n, x, _y, _w, _h);
            x += _w + _w*spaceing;
        }
    }
};

//Special Effects
Centi.prototype.shrink = function(radiusX, radiusY){
    radiusX = radiusX || 1;
    radiusX = (radiusX<1) ? 1 : radiusX;

    radiusY = radiusY || radiusX;
    radiusY = (radiusY<1) ? 1 : radiusY;

    var w = this.w/radiusX;
    var h = this.h/radiusY;

    this.tempCtx.clearRect(0, 0, this.w, this.h);
    this.tempCtx.drawImage(this.canvas, 0,0,this.w,this.h,0,0,w,h);
    this.ctx.drawImage(this.tempCanvas, 0,0,w,h,0,0,this.w,this.h);
};

Centi.prototype.mosaic = function(radiusX, radiusY){
    radiusX = radiusX || 1;
    radiusX = (radiusX<1) ? 1 : radiusX;

    radiusY = radiusY || radiusX;
    radiusY = (radiusY<1) ? 1 : radiusY;

    var w = Math.floor(this.w/radiusX);
    var h = Math.floor(this.h/radiusY);

    this.tempCtx.clearRect(0, 0, this.w, this.h);
    this.tempCtx.drawImage(this.canvas, 0,0,this.w,this.h,0,0,w,h);
    var channelList = this.tempCtx.getImageData( 0, 0, w, h ).data;

    radiusX = this.w/w;
    radiusY = this.h/h;
    
    for ( var i = 0; i < h; i += 1 ) {
        for ( var j = 0; j < w; j += 1 ) {
            var n = (j + i * w) * 4;
            this.ctx.fillStyle = 'rgb(' + channelList[n] + ', ' + channelList[n + 1] + ', ' + channelList[n + 2] + ')';
            this.ctx.fillRect( j*radiusX, i*radiusY, radiusX, radiusY );
        }
    }
};

Centi.prototype.glitch = function(amount, seed, iterations, quality){
    amount = amount || 0;
    seed = seed || 0;
    iterations = iterations || 0;
    quality = quality || 0;
    var self = this;
    var params = {"amount": amount, "seed": seed, "iterations": iterations, "quality": quality};
    glitch(this.ctx.getImageData( 0, 0, this.w, this.h), params, function(image_data){
        self.ctx.putImageData( image_data, 0, 0 );
    });
};

Centi.prototype.crash = function(amount){
    var x, y, w = this.w, h = this.h,

    i, _len = amount || 6,

    channelOffset = (Math.floor(this.rand(-_len*2, _len*2)) * w * + Math.floor(this.rand(-_len, _len))) * 4,

    maxOffset = _len * _len / 100 * w,

    chunkWidth, chunkHeight,

    tempCanvas = this.tempCanvas,
    tempCtx = this.tempCtx,

    srcData, targetImageData, data;

    tempCanvas.width = w;
    tempCanvas.height = h;

    tempCtx.clearRect(0, 0, this.w, this.h);

    tempCtx.drawImage(this.canvas, 0, 0, w, h);

    srcData = tempCtx.getImageData(0, 0, w, h).data;

    for (i = 0; i < _len; i++) {
        y = Math.floor(this.rand(0, h));

        chunkHeight = Math.min(Math.floor(this.rand(1, h / 4)), h - y);

        x = Math.floor(this.rand(1, maxOffset));
        chunkWidth = w - x;

        tempCtx.drawImage(this.canvas,
            0, y, chunkWidth, chunkHeight,
            x, y, chunkWidth, chunkHeight);

        tempCtx.drawImage(this.canvas,
            chunkWidth, y, x, chunkHeight,
            0, y, x, chunkHeight);
    }

    targetImageData = tempCtx.getImageData(0, 0, w, h);

    data = targetImageData.data;

    for(i = Math.floor(this.rand(0, 3)), _len = srcData.length; i < _len; i += 4) {
        data[i+channelOffset] = srcData[i];
    }

    for(i = 0; i < _len; i++) {
        data[i++] *= 2;
        data[i++] *= 2;
        data[i++] *= 2;
    }

    tempCtx.putImageData(targetImageData, 0, 0);

    tempCtx.fillStyle = "rgb(0,0,0)";
    for (i = 0; i < h; i += 2) {
        tempCtx.fillRect (0, i, w, 1);
    }

    this.ctx.drawImage(tempCanvas, 0, 0);
};

Centi.prototype.dropShadow = function(_x, _y, _blur, _hex_color){
    this.ctx.shadowBlur = _blur == undefined ? 0 : _blur;
    this.ctx.shadowOffsetX = _x == undefined ? 0 : _x;
    this.ctx.shadowOffsetY = _y == undefined ? 0 : _y;
    var str = _hex_color == undefined ? "000000" : _hex_color.toString(16);
    while (str.length < 6) str = "0" + str;
    this.ctx.shadowColor = "#" + str;
};

// centi funcs

var CT_FUNCS = Object.getOwnPropertyNames(Centi.prototype);

