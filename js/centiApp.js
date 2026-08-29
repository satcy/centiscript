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
    editor:null,
    inputTitle:null,

    encoder:null,
    bToGif:false,
    gifFrameCnt:0,
    maxGifFrameNum:150,

    imageUrl:null,
    blob:null,
    
    file_name:"",
    code_from_url_params:""
};

CENTI.init = function(){
    CENTI.inputTitle = document.getElementById('inputtitle');
    var canvas = document.getElementById("canvas0");
    if ( ct ) ct.destroy();
    ct = new Centi(null, CENTI.editor);
    if ( document.getElementById('version') ) document.getElementById('version').innerHTML = "ver. " + ct.ver;
    if ( !ct.init(canvas, getAudioContext()) ) {
        CENTI.editor.setValue("disable canvas.");
    }

    if ( window.addEventListener ) window.addEventListener( 'resize', onResize, false );
    else if ( window.onresize ) window.onresize = onReize;

    function onResize(){
        ct.size(ct.sizeW, ct.sizeH);
    }
};

CENTI.run = function(){
    var tw;
    tw = CENTI.editor.getValue();
    //console.log(tw);
    var element = document.getElementById("canvas_wrap"); 
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    };

    ct.canvas = document.createElement('canvas');
    ct.canvas.id = 'canvas0';
    ct.initDsp( getAudioContext() );
    document.getElementById("canvas_wrap").appendChild(ct.canvas);
    if ( ct.parse(tw) ) {
        //ct.reset();
        ct.start();
        CENTI.start();
    } else {
        alert("unsuccess");   
    }
};


CENTI.start = function(){
    if ( CENTI.timer ) cancelAnimationFrame(CENTI.timer);
    CENTI.timer = requestAnimationFrame(CENTI.onFrame);
};

CENTI.onFrame = function(){
    CENTI.timer = requestAnimationFrame(CENTI.onFrame);
    ct.update();
}; 

CENTI.togif = function(){
    if ( CENTI.bToGif ) {
        CENTI.endToGif();
    } else if ( !CENTI.encoder ) {
        CENTI.encoder =  new GIF({
            workers: 2,
            quality: 10,
            width: ct.w,
            height: ct.h,
            workerScript: "lib/gif/gif.worker.js"
        });
        CENTI.bToGif = true;
        CENTI.gifFrameCnt = 0;
        document.getElementById('togif').innerHTML = "Stop REC";
        ct.toGifFunc = CENTI.pushGif;
    }
    // else: previous recording is still being encoded ("Processing..."); ignore the click.
}

CENTI.pushGif = function(ctx){
    if ( CENTI.bToGif ) {
        CENTI.encoder.addFrame(ctx, {copy: true, delay:33});
        CENTI.gifFrameCnt ++;
        if ( CENTI.gifFrameCnt > CENTI.maxGifFrameNum ) {
            CENTI.endToGif();
        }
    }
}
CENTI.endToGif = function(){
    if ( !CENTI.bToGif ) return;
    CENTI.bToGif = false;
    ct.toGifFunc = null;

    if ( CENTI.gifFrameCnt === 0 ) {
        CENTI.encoder = null;
        document.getElementById('togif').innerHTML = "REC";
        return;
    }

    CENTI.encoder.on('finished', function(blob) {
        CENTI.blob = blob;
        CENTI.imageUrl = URL.createObjectURL(blob);
        document.getElementById('gif_image').src = CENTI.imageUrl;
        document.getElementById('gifResult').classList.add('is_visible');
        document.getElementById('togif').innerHTML = "REC";
        CENTI.encoder = null;
    });
    try {
        CENTI.encoder.render();
        document.getElementById('togif').innerHTML = "Processing...";
    } catch (e) {
        console.error("GIF encoding failed to start (Web Workers may be unavailable, e.g. when opening this page via file://).", e);
        CENTI.encoder = null;
        document.getElementById('togif').innerHTML = "REC";
    }
}

CENTI.insertTab = function(o, e){
    var kC = e.keyCode ? e.keyCode : e.charCode ? e.charCode : e.which;
    if (kC == 9 && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        var oS = o.scrollTop;
        if (o.setSelectionRange) {
            // Opera + FireFox + Safari
            var sS = o.selectionStart;
            var sE = o.selectionEnd;
            o.value = o.value.substring(0, sS) + "\t" + o.value.substr(sE);
            o.setSelectionRange(sS + 1, sS + 1);
            o.focus();
        } else if (o.createTextRange) {
            // IE
            document.selection.createRange().text = "\t"; // String.fromCharCode(9)
            //o.onblur = function() { o.focus(); o.onblur = null; };
            e.returnValue = false;
        } else {
            alert('Please contact the admin and tell xe that the tab functionality does not work in your browser.');
        }
        o.scrollTop = oS; // Return to the original scroll position.
        if (e.preventDefault) // DOM
        {
            e.preventDefault();
        }
        return false; // Not needed, but good practice.
    }
    return true;
};

CENTI.strlength = function(str) {
    str = str.replace(/\s/g, "");
  document.getElementById("idStrlength").innerHTML = (str.length);
}

CENTI.checkTitle = function(str) {
    if ( str.length > 50 ) {
        CENTI.inputTitle.value = str.slice(0,50);
    }
}

CENTI.setTitle = function(str){
    CENTI.inputTitle.value = str;
}

CENTI.setSample = function(str){
    //console.log(str);
    //editor.value = "";
    CENTI.editor.setValue(str);
    CENTI.editor.revealPositionInCenter({ lineNumber: 0, column: 0 });
    CENTI.strlength(str);
    CENTI.run();
}

CENTI.loadSample = function(path){
    if ( !path ) return;
    fetch(path).then(function(res){
        return res.text();
    }).then(function(str){
        CENTI.setSample(str);
    }).catch(function(e){
        console.error("Failed to load sample: " + path, e);
    });
}

CENTI.readFileToEditor = function(file){
    if ( !file ) return;

    CENTI.setTitle(file.name);

    var reader = new FileReader();
    reader.onloadend = function () {
        CENTI.editor.setValue(this.result);
        CENTI.editor.focus();
        CENTI.strlength(CENTI.editor.getValue());
    };

    reader.readAsText(file);
}

CENTI.onFileChanged = function(){
    var file = document.getElementById('readfile').files[0];
    // console.log('File name: ' + file.name);
    // console.log('File type: ' + file.type);
    // console.log('Size: ' + file.size);
    // console.log('Last modified date: ' + file.lastModifiedDate);

    CENTI.readFileToEditor(file);
}

CENTI.enableEditorDrop = function(){
    if ( !CENTI.editor || !window.FileReader ) return;
    var node = CENTI.editor.getDomNode();
    if ( !node ) return;

    function stop(e){
        e.preventDefault();
        e.stopPropagation();
        if ( e.dataTransfer ) e.dataTransfer.dropEffect = 'copy';
    }

    node.addEventListener('dragenter', stop, true);
    node.addEventListener('dragover', stop, true);
    node.addEventListener('drop', function(e){
        stop(e);
        var files = e.dataTransfer && e.dataTransfer.files;
        if ( files && files.length > 0 ) {
            CENTI.readFileToEditor(files[0]);
        }
    }, true);
}

CENTI.saveFile = function(){
    var blob = new Blob([CENTI.editor.getValue()], {type:"text/plain"});

    window.saveAs(blob, "centi_"+ CENTI.getTimeStampString() +".ct");
}

CENTI.saveGif = function(){
    if ( !CENTI.blob ) return;
    window.saveAs(CENTI.blob, "centi_"+ CENTI.getTimeStampString() +".gif");
}

CENTI.closeGifResult = function(){
    document.getElementById('gifResult').classList.remove('is_visible');
    document.getElementById('gif_image').src = "";
    if ( CENTI.imageUrl ) {
        URL.revokeObjectURL(CENTI.imageUrl);
        CENTI.imageUrl = null;
    }
    CENTI.blob = null;
}

CENTI.exportFile = function(){
    var code;
    code = CENTI.editor.getValue();
    if ( !code ) {
        return;
    }
    var ext = ".png";
    if ( CENTI.gifFrameCnt > 0 ) {
        var blob = CENTI.blob;
        ext = ".gif";
        if ( blob ) postData(blob);
    } else if ( ct.canvas.toBlob ) {
        ct.canvas.toBlob( postData, "image/png");
    }

    function postData(blob){
        window.saveAs(blob, "centi_" + CENTI.getTimeStampString() + ext);
    }
}

CENTI.exportJS = function(){
    var reg0 = /\)\;/g;
    var reg1 = /\{/g;
    var reg2 = /\}/g;
    var f0 = ct.setupMethod.replace(reg0, ");\n").replace(reg1, "{\n").replace(reg2, "}\n");
    var f1 = ct.drawMethod.replace(reg0, ");\n").replace(reg1, "{\n").replace(reg2, "}\n");
    var f2 = ct.beatMethod.replace(reg0, ");\n").replace(reg1, "{\n").replace(reg2, "}\n");
    var f3 = ct.dspMethod.replace(reg0, ");\n").replace(reg1, "{\n").replace(reg2, "}\n");
    var f4 = ct.mouseMoveMethod.replace(reg0, ");\n").replace(reg1, "{\n").replace(reg2, "}\n");
    var f5 = ct.mouseDownMethod.replace(reg0, ");\n").replace(reg1, "{\n").replace(reg2, "}\n");
    var f6 = ct.mouseUpMethod.replace(reg0, ");\n").replace(reg1, "{\n").replace(reg2, "}\n");
    var is3d = /c3d\(\)/.test(f0);
    if ( !is3d ) is3d = /c3d\(\)/.test(f1);
    if ( !is3d ) is3d = /c3d\(\)/.test(f2);
    if ( !is3d ) is3d = /c3d\(\)/.test(f3);
    if ( !is3d ) is3d = /c3d\(\)/.test(f4);
    if ( !is3d ) is3d = /c3d\(\)/.test(f5);
    if ( !is3d ) is3d = /c3d\(\)/.test(f6);

    var temp = 
    ((is3d) ? '//<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/three.js/0.149.0/three.min.js"></script>' + "\n" : "" ) +
    '//<script src="https://cdn.jsdelivr.net/gh/satcy/centiscript@master/js/release/centi.min.'+ct.ver+'.js"></script>' + "\n" +
    ((is3d) ? '//<script src="https://cdn.jsdelivr.net/gh/satcy/centiscript@master/js/plugin/centi.three.js"></script>' + "\n" : "" ) +
    "//<canvas id='c'></canvas>" + "\n" +
    "\n" +
    "(function(){" + "\n" +
    "window.onload = function(){" + "\n" +
    "   window.addEventListener('pointerdown', async function startAudio() {" + "\n" +
    "       window.removeEventListener('pointerdown', startAudio);" + "\n" +
    "       const audio = getAudioContext();" + "\n" +
    "       if (audio && audio.state === 'suspended') {" + "\n" +
    "           await audio.resume();" + "\n" +
    "       }" + "\n" +
    "       __ctName.vol = 1;" + "\n" +
    "   });" + "\n" +
    "   var __ctName;" + "\n" +
    "   var canvas = document.getElementById('c');" + "\n" +
    "   __ctName = new Centi('__ctName');" + "\n" + 
    ((is3d) ? "   __ctName.c3d();" + "\n" : "") +
    "   __ctName.init(canvas, getAudioContext());" + "\n" +
    "   __ctName.setupFunc = init;" + "\n" +
    "   __ctName.drawFunc = draw;" + "\n" +
    "   __ctName.beatFunc = beat;" + "\n" +
    "   __ctName.dspFunc = dsp;" + "\n" +
    "   __ctName.mouseMove = onMouseMove;" + "\n" +
    "   __ctName.mouseDown = onMouseDown;" + "\n" +
    "   __ctName.mouseUp = onMouseUp;" + "\n" +
    "   __ctName.start();" + "\n" +
    "\n" +
    "   requestAnimationFrame(update);" + "\n" +
    "\n" +
    "   function init(){" + "\n" +
    "" + f0 + "\n" +
    "   }" + "\n" +
    "   function draw(){" + "\n" +
    "" + f1 + "\n" +
    "   }" + "\n" +
    "   function beat(){" + "\n" +
    "" + f2 + "\n" +
    "   }" + "\n" +
    "   function dsp(){" + "\n" +
    "" + f3 + "\n" +
    "   }" + "\n" +
    "   function onMouseMove(e){" + "\n" +
    "" + f4 + "\n" +
    "   }" + "\n" +
    "   function onMouseDown(e){" + "\n" +
    "" + f5 + "\n" +
    "   }" + "\n" +
    "   function onMouseUp(e){" + "\n" +
    "" + f6 + "\n" +
    "   }" + "\n" +
    "   function update(){" + "\n" +
    "       requestAnimationFrame(update);" + "\n" +
    "       __ctName.update();" + "\n" +
    "   }" + "\n" +
    "\n" +
    "   if ( window.addEventListener ) {" + "\n" +
    "       window.addEventListener('resize', onResize, false);" + "\n" +
    "   } else if ( window.onresize ) {" + "\n" +
    "       window.onresize = onResize;" + "\n" +
    "   }" + "\n" +
    "\n" +
    "   function onResize(){" + "\n" +
    "       __ctName.size(__ctName.sizeW, __ctName.sizeH);" + "\n" +
    "   }" + "\n" +
    "};" + "\n" +
    "})();";
    temp = temp.replace(/__ctName/g, ct.name);
    var blob = new Blob([temp], {type:"text/plain"});
    
    window.saveAs(blob, "centi_"+ CENTI.getTimeStampString() +".js");
}

CENTI.getTimeStampString = function(){
    var date = new Date();
    var str = date.getFullYear() + (date.getMonth() < 11 ? "0" + (date.getMonth()+1) : (date.getMonth() + 1) ) + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate() ) + 
    (date.getHours() < 10 ? "0" + date.getHours() : date.getHours() ) + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) + 
    (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds());
    return str;
}

CENTI.toggleTweetsList = function(){
    if ( !document.getElementById("result") ) return;
    if ( document.getElementById("result").style.display == 'block' ) {
        document.getElementById("result").style.display = 'none';
    } else {
        document.getElementById("result").style.display = 'block';
    }
};

CENTI.getTweetsList = function(){
    if ( !document.getElementById("result") ) return;
    var httpObj = new XMLHttpRequest();
    var path = "archive/tweets.txt";
    httpObj.open("get", path, true);
    httpObj.onload = function(){

        var myData = JSON.parse(this.responseText);
        if (myData.length > 0) {
            var l = myData.length;
            var html = "";
            for (var i=0; i<l; i++){
                var img = myData[i].img;
                var url = myData[i].url;
                var name = myData[i].user;
                var id_str = myData[i].id;
                html += "<div id='list_one'><a href='" + url + "'><img src='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==' alt='' data-echo='" + img + "' width='100%'></a>\n<span id='list_one_name'>(<a href='https://x.com/" + name + "/status/" + id_str + "' target='_blank'>" + name + "</a>)</span></div>\n";
            }
            document.getElementById("result").innerHTML = html;
        }
        echo.init({
          offset: 100,
          throttle: 250,
          unload: false
        });
    }

    httpObj.send(null);
}

CENTI.fullscreen = function(){
    if ( CENTI.file_name != "" ) {
        window.location.href = "full.html?f=" + CENTI.file_name;
    } else if ( CENTI.code_from_url_params != "" ) {
        window.location.href = "full.html?c=" + escape(CENTI.code_from_url_params);
    }
}

window.onload = function(){
    setTimeout(function(){
        CENTI.init();
        var params = get_url_vars();
        
        if ( params["t"] ) {
            CENTI.setTitle(/*unescape*/(params["t"]));
        }
        if ( params["c"] ) {
            CENTI.code_from_url_params = params["c"];
            CENTI.editor.setValue(/*unescape*/(params["c"]));
            CENTI.run();
        } else if ( params["f"] ) {
            CENTI.file_name = params["f"];
            var httpObj = new XMLHttpRequest();
            var path = "archive/codes/"+params["f"]+".ct";
            httpObj.open("get", path, true);
            httpObj.onload = function(){
                CENTI.editor.setValue(this.responseText);
                CENTI.run();
                CENTI.strlength(CENTI.editor.getValue());
            }
            httpObj.send(null);
        } else {
            CENTI.run();
        }
        CENTI.strlength(CENTI.editor.getValue());

        CENTI.getTweetsList();
        
        if ( CENTI.file_name == "" && CENTI.code_from_url_params == ""  ) {
            document.getElementById("fullscreen").style.display = 'none';
        }
    }, 250);
    var runBtn = document.getElementById('run');
    runBtn.addEventListener(/iPhone|iPad|iPod/.test(navigator.userAgent) ? 'touchend' : 'click', CENTI.run, false);
    
    var appCache = window.applicationCache;
    if (appCache) {
        appCache.update();
        if (appCache.status == appCache.UPDATEREADY) {
            appCache.swapCache();
        }
    }
};
