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
(function(_root){
  
  if ( !_root.requestAnimationFrame ) {

      _root.requestAnimationFrame = ( function() {

          return _root.webkitRequestAnimationFrame ||
          _root.mozRequestAnimationFrame ||
          _root.oRequestAnimationFrame ||
          _root.msRequestAnimationFrame ||
          function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

              _root.setTimeout( callback, 1000 / 60 );

          };

      } )();

  }
  if ( !_root.cancelAnimationFrame ) {
    _root.cancelAnimationFrame = _root.cancelAnimationFrame ||
      _root.mozCancelAnimationFrame ||
      _root.webkitCancelAnimationFrame ||
      _root.msCancelAnimationFrame;
  }

  if ( !_root.XMLHttpRequest ){
    _root.XMLHttpRequest = function () {
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

  if ( !_root.evalInContext ) {
    _root.evalInContext = function(source, context) {
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
  }

  if ( !_root.get_url_vars ) {
    _root.get_url_vars = function(){
      var vars = new Object();
      var params;
      var temp_params = _root.location.href.slice(_root.location.href.indexOf('?') + 1).split('&');
      for(var i = 0; i <temp_params.length; i++) {
        params = temp_params[i].split('=');
        
        if(params.length == 2) {
            //vars[params[0]] = params[1];
            vars[decodeURIComponent(params[0])] = decodeURIComponent(params[1]);
        }
      }
      return vars;
    }
  }

  if ( !_root.checkFileReaderApi ) {
    _root.checkFileReaderApi = function(){
      return _root.File && _root.FileReader && _root.FileList && _root.Blob;
    }
  }

  if ( !_root.checkFileWriterApi ) {
    _root.checkFileWriterApi = function(){
      return _root.File && _root.saveAs && _root.FileList && _root.Blob;
    }
  }

  if ( !_root.audioContext ) {
    _root.audioContext = null;
  }
  if ( !_root.audioContextClass ) {
    _root.audioContextClass = _root.AudioContext || _root.webkitAudioContext || _root.mozAudioContext || _root.oAudioContext || _root.msAudioContext;
  }
  if ( !_root.getAudioContext ) {
    _root.getAudioContext = function(){
      if ( _root.audioContext ) return _root.audioContext;
      if ( !_root.audioContext && _root.audioContextClass ) return (_root.audioContext = new _root.audioContextClass());
      else return null;
    }
  }

  if ( !_root.audioContext ) {
    _root.audioContext = null;
  }

  if ( !_root.getAudioAnalyser ) {
    _root.getAudioAnalyser = function(){
        return _root.audioAnalyser || (_root.audioAnalyser = _root.getAudioContext().createAnalyser());
    }
  }

  if ( !Array.prototype.forEach ) {
      Array.prototype.forEach = function(callback, context){
          for ( var i=0; i<this.length; i++ ) {
              callback.call(context || null, this[i], i, this);
          }
      };
  }
  
  if (!Array.isArray) {
    Array.isArray = function(obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    };
  }
})(window);

