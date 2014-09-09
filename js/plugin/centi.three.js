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

if ( Centi && !Centi.plugins ) Centi.plugins = [];

try {
Centi.plugins.push(
	function(centi){
		this.target = centi;

		this.prefix = 'THREE';
		this.target.renderer = null;
		this.target.scene = null;
		this.target.cam = null;

		this.destroy = function(){
			this.target.renderer = null;
			this.target.scene = null;
			this.target.cam = null;
			this.target = null;
		};

		this.preSetup = function(){
			var obj = this.target;
	        if ( obj.b3d ) {
	            obj.ctx = null;
	            
	            obj.scene = new THREE.Scene();
	        } else {
	            obj.renderer = null;
	            obj.scene = null;
	            obj.cam = null;
	        }
		};

		this.postSetup = function(){
			var obj = this.target;
			if ( obj.b3d ) {
		        obj.size(obj.w, obj.h);
		        try {
		            console.log(obj.canvas.width, obj.canvas.height);
		            obj.renderer = new THREE.WebGLRenderer({canvas:obj.canvas, preserveDrawingBuffer: true});
		        } catch(e){
		            obj.renderer = new THREE.CanvasRenderer({canvas:obj.canvas});
		        }
		        obj.cam = new THREE.PerspectiveCamera( 60, obj.w/obj.h, 1, 100000 );
		        obj.cam.position.set( 0, 0, 367 );
		    }
		};

		this.preUpdate = function(){

		};

		this.postUpdate = function(){
			var obj = this.target;
			if ( obj.b3d && obj.renderer ) obj.renderer.render(obj.scene, obj.cam);
		};
	}
);
} catch(e){}