if ( !window.requestAnimationFrame ) {

    window.requestAnimationFrame = ( function() {

        return window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

            window.setTimeout( callback, 1000 / 60 );

        };

    } )();

}
window.cancelAnimationFrame = window.cancelAnimationFrame ||
  window.mozCancelAnimationFrame ||
  window.webkitCancelAnimationFrame ||
  window.msCancelAnimationFrame;

if (!window.XMLHttpRequest){
  XMLHttpRequest = function () {
    try {
      return new ActiveXObject("Msxml2.XMLHTTP.6.0");
    } catch (e) {}
    try {
      return new ActiveXObject("Msxml2.XMLHTTP.3.0");
    } catch (e) {}
    try {
      return new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {}
    throw new Error("This browser does not support XMLHttpRequest.");
  };
}


function evalInContext(source, context) {
    source = '(function(' + Object.keys(context).join(', ') + ') {' + source + '})';
    
    var compiled = eval(source);
    return compiled.apply(context, values());
    // you likely don't need this - use underscore, jQuery, etc
    function values() {
        var result = [];
        for (var property in context)
            if (context.hasOwnProperty(property))
                result.push(context[property]);
        return result;
    }
}

function get_url_vars(){
  var vars = new Object();
  var params;
  var temp_params = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for(var i = 0; i <temp_params.length; i++) {
    params = temp_params[i].split('=');
    
    if(params.length == 2) {
        //vars[params[0]] = params[1];
        vars[decodeURIComponent(params[0])] = decodeURIComponent(params[1]);
    }
  }
  return vars;
}