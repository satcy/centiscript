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
    CENTI.inputTitle = document.getElementById('inputtitle');
    var canvas = document.getElementById("canvas0");
    if ( ct ) ct.destroy();
    ct = new Centi();
    if ( !ct.init(canvas, getAudioContext()) ) {
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
    CENTI.inputTitle.style.color = "#333";
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

CENTI.getTimeStampString = function(){
    var date = new Date();
    var str = date.getFullYear() + (date.getMonth() < 11 ? "0" + (date.getMonth()+1) : (date.getMonth() + 1) ) + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate() ) + 
    (date.getHours() < 10 ? "0" + date.getHours() : date.getHours() ) + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) + 
    (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds());
    return str;
}

CENTI.getTweetsList = function(){
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
                var txt = "<div id='list_one'><a href='" + url + "'><img src='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==' alt='' data-echo='" + img + "' width='233'></a>\n(<a href='https://twitter.com/" + name + "/status/" + id_str + "' target='_blank'>" + name + "</a>)</div>\n";
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
        }
        CENTI.strlength(CENTI.editor.value);

        CENTI.getTweetsList();
        
    }, 250);
     
};

