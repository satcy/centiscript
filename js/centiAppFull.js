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

var ct;

var CENTI = {
    timer:0,
    
    code:'sz(720,360)bg(0)frame(){clr()col(170)vl=(h/2)w2=(w/3)for(i,0,w2){col((cos(c*0.01+i*0.25)/2+0.5)*255)x=(i*3)y=(cy)line(x+cos(c*0.021+i*0.07)*vl,y+sin(c*0.021+i*0.11)*vl/3,x+sin(c*0.02+i*0.11)*vl/3,y+cos(c*0.02+i*0.15)*vl)}}'
};

CENTI.init = function(){
    var canvas = document.getElementById("canvas0");
    if ( ct ) ct.destroy();
    ct = new Centi('ct');
    if ( !ct.init(canvas, getAudioContext()) ) {
        console.log("disable canvas.");
    }

    if ( window.addEventListener ) window.addEventListener( 'resize', CENTI.onResize, false );
    else if ( window.onresize ) window.onresize = CENTI.onResize;
    
    
};

CENTI.onResize = function(){
    ct.size(ct.sizeW, ct.sizeH);
    var w = $('.canvas_wrap').width();
    var h = $('.canvas_wrap').height();

    var imageAspectRatio = ct.w / ct.h;
    var canvasAspectRatio = w / h;
    var scale = 1;

    if(imageAspectRatio < canvasAspectRatio) {
        scale = h / ct.h;

        $('#canvas0').css({left:(w-ct.w*scale)/2, top:0});
        $('#canvas0').width(ct.w*scale);
        $('#canvas0').height(h);
        ct.mouseScale = 1 / scale;
    }else{
        scale = w / ct.w;

        $('#canvas0').css({left:0, top:(h-ct.h*scale)/2});
        $('#canvas0').width(w);
        $('#canvas0').height(ct.h * scale);
        ct.mouseScale = 1 / scale;
    }
}
CENTI.run = function(){
    //console.log(CENTI.code);
    var element = document.getElementById("canvas_wrap"); 
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    };

    ct.canvas = document.createElement('canvas');
    ct.canvas.id = 'canvas0';
    document.getElementById("canvas_wrap").appendChild(ct.canvas);
    if ( ct.parse(CENTI.code) ) {
        //ct.reset();
        ct.start();
        CENTI.start();
    } else {
        //alert("unsuccess");   
    }
    CENTI.onResize();
};

CENTI.start = function(){
    if ( CENTI.timer ) cancelAnimationFrame(CENTI.timer);
    CENTI.timer = requestAnimationFrame(CENTI.onFrame);
};

CENTI.onFrame = function(){
    CENTI.timer = requestAnimationFrame(CENTI.onFrame);
    
    ct.update();
}; 

window.onload = function(){
    setTimeout(function(){
        CENTI.init();
        var params = get_url_vars();
        
        if ( params["c"] ) {
            CENTI.code = params["c"];
            CENTI.run();
        } else if ( params["f"] ) {
            var httpObj = new XMLHttpRequest();
            var path = "http://ex.rzm.co.jp/centiscript/p/codes/"+params["f"]+".ct";
            httpObj.open("get", path, true);
            httpObj.onload = function(){
                CENTI.code = this.responseText;
                CENTI.run();
            }
            httpObj.send(null);
        } else {
            CENTI.run();
        }

    }, 250);
     
};

