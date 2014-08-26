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

    encoder:null,
    bToGif:false,
    gifFrameCnt:0,
    maxGifFrameNum:90,

    imageUrl:null
};


CENTI.start = function(){
    if ( CENTI.timer ) cancelAnimationFrame(CENTI.timer);
    CENTI.timer = requestAnimationFrame(CENTI.onFrame);
} 

CENTI.onFrame = function(){
    CENTI.timer = requestAnimationFrame(CENTI.onFrame);
    ct.update();
} 

CENTI.init = function(){
    CENTI.editor = document.getElementById('editor');
    var canvas = document.getElementById("canvas0");
    ct = new Centi();
    if ( !ct.init(canvas) ) {
        CENTI.editor.value = "disable canvas.";
    }
}

CENTI.run = function(){
    var tw;
    tw = CENTI.editor.value;
    //console.log(tw);
    ct.reset();
    if ( ct.parse(tw) ) {
        CENTI.start();
    } else {
        alert("unsuccess");   
    }
}

CENTI.tweet = function(){
    var code;
    code = CENTI.editor.value;
    //code = code.replace(/\s/g, "");
    if ( !code ) {
        return;
    }
    if ( CENTI.gifFrameCnt > 0 ) {
        var blob = window.dataURLtoBlob && window.dataURLtoBlob(CENTI.imageUrl);
        if ( blob ) postData(blob);
    } else if ( ct.canvas.toBlob ) {
        ct.canvas.toBlob( postData, "image/png");
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

CENTI.togif = function(){
    if ( !CENTI.bToGif ) {
        CENTI.encoder = new GIFEncoder();
        CENTI.bToGif = true;
        CENTI.gifFrameCnt = 0;
        CENTI.encoder.setRepeat(0);
        CENTI.encoder.setDelay(33);
        CENTI.encoder.start();
        document.getElementById('togif').innerHTML = "Stop REC";
        ct.toGifFunc = CENTI.pushGif;
    } else {
        CENTI.endToGif();
    }
}

CENTI.pushGif = function(ctx){
    if ( CENTI.bToGif ) {
        CENTI.encoder.addFrame(ctx);
        CENTI.gifFrameCnt ++;
        if ( CENTI.gifFrameCnt > CENTI.maxGifFrameNum ) {
            CENTI.endToGif();
        }
    }
}
CENTI.endToGif = function(){
    CENTI.bToGif = false;
    CENTI.encoder.finish();
    CENTI.imageUrl = 'data:image/gif;base64,'+encode64(CENTI.encoder.stream().getData());
    document.getElementById('gif_image').src = CENTI.imageUrl;
    document.getElementById('togif').innerHTML = "REC";
    CENTI.encoder = null;

    ct.toGifFunc = null;
}

CENTI.strlength = function(str) {
    str = str.replace(/\s/g, "");
  document.getElementById("idStrlength").innerHTML = (str.length);
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
    
    var reader = new FileReader();
    reader.onloadend = function (e) {
        editor.value = this.result;
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

CENTI.getTimeStampString = function(){
    var date = new Date();
    var str = date.getFullYear() + (date.getMonth() < 11 ? "0" + (date.getMonth()+1) : (date.getMonth() + 1) ) + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate() ) + 
    (date.getHours() < 10 ? "0" + date.getHours() : date.getHours() ) + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) + 
    (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds());
    return str;
}

window.onload = function(){
    setTimeout(function(){
        CENTI.init();
        var params = get_url_vars();
        
        if ( params["c"] ) {
            CENTI.editor.value = unescape(params["c"]);
            CENTI.run();
        }
        CENTI.strlength(editor.value);
    }, 250);
     
};

