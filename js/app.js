var editor;

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

function strlength(str) {
    str = str.replace(/\s/g, "");
  document.getElementById("idStrlength").innerHTML = (str.length);
}

function setSample(str){
    //console.log(str);
    //editor.value = "";
    editor.value = str;
    strlength(str);
    run();
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

