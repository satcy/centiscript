/*
 * JavaScript dataURLtoBlob 1.0
 * https://github.com/rgeraldporter/canvas-polyfill-DataURLtoBlob
 *
 * Copyright 2012, Robert Gerald Porter
 *
 * Based on: JavaScript Canvas to Blob 2.0.3, Copyright 2012, Sebastian Tschan, licensed under MIT;
 * 		and: canvasResize 1.0.0, by @gokercebeci, also licensed under MIT.
 *
 * This code is licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 */

(function (window) {

	'use strict';
	
	var CanvasPrototype 			= window.HTMLCanvasElement && window.HTMLCanvasElement.prototype,
		hasBlobConstructor 			= window.Blob && (function () {

			try {
			
				return Boolean(new Blob());
				
			} catch (e) {
			
				return false;
				
			}
			
		}()),
		hasArrayBufferViewSupport 	= hasBlobConstructor && window.Uint8Array && ( function () {

			try {

				return new Blob([new Uint8Array(100)]).size === 100;
				
			} catch (e) {

				return false;
				
			}
				
		}()),
		dataURLtoBlob 				=  function (data) {
		
			var mimeString 		= data.split(',')[0].split(':')[1].split(';')[0],
				byteString 		= atob(data.split(',')[1]),
				ab 				= new ArrayBuffer(byteString.length),
				ia 				= new Uint8Array(ab);

			for (var i = 0; i < byteString.length; i++) {
			
				ia[i] = byteString.charCodeAt(i);
				
			}
			
			// for legacy BlobBuilder support
			var bb 	= (window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder);
			
			if (bb) {
			
				bb 	= new (window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder)();
				bb.append(ab);
				
				return bb.getBlob(mimeString);
				
			} 
			
			else {
			
				bb 	= new Blob([hasArrayBufferViewSupport ? ia : ab], {
				
					'type': (mimeString)
					
				});
				
				return bb;
				
			}
			
	};
	
	if (window.HTMLCanvasElement && !CanvasPrototype.toBlob) {
	
		if (CanvasPrototype.mozGetAsFile) {
		
			CanvasPrototype.toBlob 	= function (callback, type) {
			
				callback(this.mozGetAsFile('blob', type));
				
			};
			
		} else if (CanvasPrototype.toDataURL && dataURLtoBlob) {
		
			CanvasPrototype.toBlob 	= function (callback, type) {
			
				callback(dataURLtoBlob(this.toDataURL(type)));
				
			};
			
		}
		
	}
	
	if (typeof define === 'function' && define.amd) {
	
		define(function () {
		
			return dataURLtoBlob;
			
		});
		
	} 
	
	else {
	
		window.dataURLtoBlob 	= dataURLtoBlob;
		
	}
	
}(this));