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
    maxGifFrameNum:90,

    imageUrl:null,
    blob:null
};

CENTI.init = function(){
    CENTI.editor = document.getElementById('editor');
    CENTI.inputTitle = document.getElementById('inputtitle');
    var canvas = document.getElementById("canvas0");
    if ( ct ) ct.destroy();
    ct = new Centi(null, CENTI.editor);
    if ( document.getElementById('version') ) document.getElementById('version').innerHTML = "ver. " + ct.ver;
    if ( !ct.init(canvas, getAudioContext()) ) {
        CENTI.editor.value = "disable canvas.";
    }

    if ( window.addEventListener ) window.addEventListener( 'resize', onResize, false );
    else if ( window.onresize ) window.onresize = onReize;

    function onResize(){
        ct.size(ct.sizeW, ct.sizeH);
    }
};

CENTI.run = function(){
    var tw;
    tw = CENTI.editor.value;
    //console.log(tw);
    var element = document.getElementById("canvas_wrap"); 
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    };

    ct.canvas = document.createElement('canvas');
    ct.canvas.id = 'canvas0';
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

CENTI.tweet = function(){
    var code;
    code = CENTI.editor.value;
    //code = code.replace(/\s/g, "");
    if ( !code ) {
        return;
    }
    if ( CENTI.gifFrameCnt > 0 ) {
        var blob = CENTI.blob;
        if ( blob ) postData(blob);
    } else if ( ct.canvas.toBlob ) {
        ct.canvas.toBlob( postData, "image/png");
    }

    function postData(blob){
        var formData = new FormData();

        var url = "http://ex.rzm.co.jp/centiscript/?c="+encodeURIComponent(code);
        
        var title = CENTI.inputTitle.value;
        if ( title == "Title" ) {
            title = "";
        }
        if ( title != "" ) {
            url += "&t="+encodeURIComponent(title);
            title += " ";
        }

        formData.append("image", blob );
        formData.append("tweet", title + "(centiscript) " + url);
        formData.append("url", url);
        formData.append("title", encodeURIComponent(title));
        formData.append("code", encodeURIComponent(code));
        
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

CENTI.togif = function(){
    if ( !CENTI.bToGif ) {
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
    } else {
        CENTI.endToGif();
    }
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
    CENTI.encoder.on('finished', function(blob) {
        CENTI.blob = blob;
        CENTI.imageUrl = URL.createObjectURL(blob);
        document.getElementById('gif_image').src = CENTI.imageUrl;
        document.getElementById('togif').innerHTML = "REC";
    });
    CENTI.encoder.render();
    document.getElementById('togif').innerHTML = "Processing...";
    CENTI.encoder = null;

    ct.toGifFunc = null;
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
    CENTI.editor.value = str;
    CENTI.strlength(str);
    CENTI.run();
}

CENTI.onFileChanged = function(){
    var file = document.getElementById('readfile').files[0];
    // console.log('File name: ' + file.name);
    // console.log('File type: ' + file.type);
    // console.log('Size: ' + file.size);
    // console.log('Last modified date: ' + file.lastModifiedDate);

    CENTI.setTitle(file.name);
    
    var reader = new FileReader();
    reader.onloadend = function (e) {
        CENTI.editor.value = this.result;
    };
    
    reader.readAsText(file);
}

CENTI.saveFile = function(){
    var blob = new Blob([CENTI.editor.value], {type:"text/plain"});
    
    window.saveAs(blob, "centi_"+ CENTI.getTimeStampString() +".ct");
}

CENTI.exportFile = function(){
    var code;
    code = CENTI.editor.value;
    if ( !code ) {
        return;
    }
    var ext = ".png";
    if ( CENTI.gifFrameCnt > 0 ) {
        var blob = window.dataURLtoBlob && window.dataURLtoBlob(CENTI.imageUrl);
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
    ((is3d) ? '//<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r68/three.min.js"></script>' + "\n" : "" ) + 
    '//<script src="http://cdn.rawgit.com/satcy/centiscript/master/js/release/centi.min.'+ct.ver+'.js"></script>' + "\n" +
    ((is3d) ? '//<script src="http://cdn.rawgit.com/satcy/centiscript/master/js/plugin/centi.three.js"></script>' + "\n" : "" ) + 
    "//<canvas id='c'></canvas>" + "\n" +
    "\n" +
    "(function(){" + "\n" +
    "window.onload = function(){" + "\n" +
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
    var path = "http://ex.rzm.co.jp/centiscript/p/searchimg.php";
    httpObj.open("get", path, true);
    httpObj.onload = function(){

        var myData = JSON.parse(this.responseText);
        if (myData.length > 0) {
            var l = myData.length;
            var d1 = "<span style='width:233px;margin-right:10px;float:left;'>\n";
            var d2 = "<span style='width:233px;margin-right:10px;float:left;'>\n";
            var d3 = "<span style='width:233px;float:left;'>\n";
            for (var i=0; i<l; i++){
                var img = myData[i].img;
                var url = myData[i].url;
                var name = myData[i].user;
                var id_str = myData[i].id;
                var txt = "<div id='list_one'><a href='" + url + "'><img src='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==' alt='' data-echo='" + img + "' width='233'></a>\n<span id='list_one_name'>(<a href='https://twitter.com/" + name + "/status/" + id_str + "' target='_blank'>" + name + "</a>)</span></div>\n";
                if ( i%3 == 0 ) d1 += txt;
                else if ( i%3 == 1 ) d2 += txt;
                else d3 += txt;
            }
            d1 += "</span>";
            d2 += "</span>";
            d3 += "</span>";
            document.getElementById("result").innerHTML = (d1 + "\n" + d2 + "\n" + d3);
        }
        echo.init({
          offset: 100,
          throttle: 250,
          unload: false
        });
    }

    httpObj.send(null);
}

window.onload = function(){
    setTimeout(function(){
        CENTI.init();
        var params = get_url_vars();
        
        if ( params["t"] ) {
            CENTI.setTitle(/*unescape*/(params["t"]));
        }

        if ( params["c"] ) {
            CENTI.editor.value = /*unescape*/(params["c"]);
            CENTI.run();
        } else if ( params["f"] ) {
            var httpObj = new XMLHttpRequest();
            var path = "http://ex.rzm.co.jp/centiscript/p/codes/"+params["f"]+".ct";
            httpObj.open("get", path, true);
            httpObj.onload = function(){
                CENTI.editor.value = (this.responseText);
                CENTI.run();
                CENTI.strlength(CENTI.editor.value);
            }
            httpObj.send(null);
        }
        CENTI.strlength(CENTI.editor.value);

        CENTI.getTweetsList();
        
    }, 250);
     
};

