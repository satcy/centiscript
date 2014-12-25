(function(Centi) {
	

	Centi.prototype.Matrix = function(){
		return this.new(Centi.Matrix, arguments);
	};

    Centi.Matrix = function() {
        var count = arguments.length,
            ok = true;
        if (count === 6) {
            this.set.apply(this, arguments);
        } else if (count === 1) {
            if (arg instanceof Matrix) {
                this.set(arg._a, arg._c, arg._b, arg._d, arg._tx, arg._ty);
            } else if (Array.isArray(arg)) {
                this.set.apply(this, arg);
            } else {
                ok = false;
            }
        } else if (count === 0) {
            this.reset();
        } else {
            ok = false;
        }
        if (!ok)
            throw new Error('Unsupported matrix parameters');
    };

    Centi.Matrix.prototype.set = function(a, c, b, d, tx, ty, _dontNotify) {
        this._a = a;
        this._c = c;
        this._b = b;
        this._d = d;
        this._tx = tx;
        this._ty = ty;
        if (!_dontNotify)
            this._changed();
        return this;
    };

    Centi.Matrix.prototype._changed = function() {
        var owner = this._owner;
        if (owner) {
            if (owner._applyMatrix) {
                owner.transform(null, true);
            } else {
                owner._changed(9);
            }
        }
    };

    Centi.Matrix.prototype.clone = function() {
        return new Centi.Matrix(this._a, this._c, this._b, this._d,
            this._tx, this._ty);
    };

    Centi.Matrix.prototype.equals = function(mx) {
        return mx === this || mx && this._a === mx._a && this._b === mx._b && this._c === mx._c && this._d === mx._d && this._tx === mx._tx && this._ty === mx._ty || false;
    };

    Centi.Matrix.prototype.reset = function(_dontNotify) {
        this._a = this._d = 1;
        this._c = this._b = this._tx = this._ty = 0;
        if (!_dontNotify)
            this._changed();
        return this;
    };

    Centi.Matrix.prototype.apply = function() {
        var owner = this._owner;
        if (owner) {
            owner.transform(null, true);
            return this.isIdentity();
        }
        return false;
    };

    Centi.Matrix.prototype.translate = function(x, y) {
        this._tx += x * this._a + y * this._b;
        this._ty += x * this._c + y * this._d;
        this._changed();
        return this;
    };

    Centi.Matrix.prototype.scale = function(x, y, cx, cy) {
        var scale = new Centi.Vec2(x, y);
        if (arguments.length == 4)
            this.translate(cx, cy);
        this._a *= scale.x;
        this._c *= scale.x;
        this._b *= scale.y;
        this._d *= scale.y;
        if (arguments.length == 4)
            this.translate(-cx, -cy);
        this._changed();
        return this;
    };

    Centi.Matrix.prototype.rotate = function(angle, x, y) {
        angle *= Math.PI / 180;
        x = x || 0;
        y = y || 0;
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            tx = x - x * cos + y * sin,
            ty = y - x * sin - y * cos,
            a = this._a,
            b = this._b,
            c = this._c,
            d = this._d;
        this._a = cos * a + sin * b;
        this._b = -sin * a + cos * b;
        this._c = cos * c + sin * d;
        this._d = -sin * c + cos * d;
        this._tx += tx * a + ty * b;
        this._ty += tx * c + ty * d;
        this._changed();
        return this;
    };

    Centi.Matrix.prototype.shear = function(x, y, cx, cy) {
        var shear = new Centi.Vec2(x, y);
        if (arguments.length == 4)
            this.translate(cx, cy);
        var a = this._a,
            c = this._c;
        this._a += shear.y * this._b;
        this._c += shear.y * this._d;
        this._b += shear.x * a;
        this._d += shear.x * c;
        if (arguments.length == 4)
            this.translate(-cx, -cy);
        this._changed();
        return this;
    };

    Centi.Matrix.prototype.skew = function(x, y, cx, cy) {
        var skew = new Centi.Vec2(x, y),
            toRadians = Math.PI / 180,
            shear = new Centi.Vec2(Math.tan(skew.x * toRadians),
                Math.tan(skew.y * toRadians));
        return this.shear(shear.x, shear.y, cx, cy);
    };

    Centi.Matrix.prototype.concatenate = function(mx) {
        var a1 = this._a,
            b1 = this._b,
            c1 = this._c,
            d1 = this._d,
            a2 = mx._a,
            b2 = mx._b,
            c2 = mx._c,
            d2 = mx._d,
            tx2 = mx._tx,
            ty2 = mx._ty;
        this._a = a2 * a1 + c2 * b1;
        this._b = b2 * a1 + d2 * b1;
        this._c = a2 * c1 + c2 * d1;
        this._d = b2 * c1 + d2 * d1;
        this._tx += tx2 * a1 + ty2 * b1;
        this._ty += tx2 * c1 + ty2 * d1;
        this._changed();
        return this;
    };

    Centi.Matrix.prototype.preConcatenate = function(mx) {
        var a1 = this._a,
            b1 = this._b,
            c1 = this._c,
            d1 = this._d,
            tx1 = this._tx,
            ty1 = this._ty,
            a2 = mx._a,
            b2 = mx._b,
            c2 = mx._c,
            d2 = mx._d,
            tx2 = mx._tx,
            ty2 = mx._ty;
        this._a = a2 * a1 + b2 * c1;
        this._b = a2 * b1 + b2 * d1;
        this._c = c2 * a1 + d2 * c1;
        this._d = c2 * b1 + d2 * d1;
        this._tx = a2 * tx1 + b2 * ty1 + tx2;
        this._ty = c2 * tx1 + d2 * ty1 + ty2;
        this._changed();
        return this;
    };

    Centi.Matrix.prototype.chain = function(mx) {
        var a1 = this._a,
            b1 = this._b,
            c1 = this._c,
            d1 = this._d,
            tx1 = this._tx,
            ty1 = this._ty,
            a2 = mx._a,
            b2 = mx._b,
            c2 = mx._c,
            d2 = mx._d,
            tx2 = mx._tx,
            ty2 = mx._ty;
        return new Centi.Matrix(
            a2 * a1 + c2 * b1,
            a2 * c1 + c2 * d1,
            b2 * a1 + d2 * b1,
            b2 * c1 + d2 * d1,
            tx1 + tx2 * a1 + ty2 * b1,
            ty1 + tx2 * c1 + ty2 * d1);
    };

    Centi.Matrix.prototype.isIdentity = function() {
        return this._a === 1 && this._c === 0 && this._b === 0 && this._d === 1 && this._tx === 0 && this._ty === 0;
    };

    Centi.Matrix.prototype.orNullIfIdentity = function() {
        return this.isIdentity() ? null : this;
    };

    Centi.Matrix.prototype.isInvertible = function() {
        return !!this._getDeterminant();
    };

    Centi.Matrix.prototype.isSingular = function() {
        return !this._getDeterminant();
    };

    Centi.Matrix.prototype.transform = function(src, dst, count) {
        return arguments.length < 3 ? this._transformPoint(Point.read(arguments)) : this._transformCoordinates(src, dst, count);
    };

    Centi.Matrix.prototype._transformPoint = function(point, dest, _dontNotify) {
        var x = point.x,
            y = point.y;
        if (!dest)
            dest = new Centi.Vec2();
        return dest.set(
            x * this._a + y * this._b + this._tx,
            x * this._c + y * this._d + this._ty,
            _dontNotify
        );
    };

    Centi.Matrix.prototype._transformCoordinates = function(src, dst, count) {
        var i = 0,
            j = 0,
            max = 2 * count;
        while (i < max) {
            var x = src[i++],
                y = src[i++];
            dst[j++] = x * this._a + y * this._b + this._tx;
            dst[j++] = x * this._c + y * this._d + this._ty;
        }
        return dst;
    };

    Centi.Matrix.prototype._transformCorners = function(rect) {
        var x1 = rect.x,
            y1 = rect.y,
            x2 = x1 + rect.width,
            y2 = y1 + rect.height,
            coords = [x1, y1, x2, y1, x2, y2, x1, y2];
        return this._transformCoordinates(coords, coords, 4);
    };

    Centi.Matrix.prototype._transformBounds = function(bounds, dest, _dontNotify) {
        var coords = this._transformCorners(bounds),
            min = coords.slice(0, 2),
            max = coords.slice();
        for (var i = 2; i < 8; i++) {
            var val = coords[i],
                j = i & 1;
            if (val < min[j])
                min[j] = val;
            else if (val > max[j])
                max[j] = val;
        }
        if (!dest)
            dest = new Centi.Rectangle();
        return dest.set(min[0], min[1], max[0] - min[0], max[1] - min[1],
            _dontNotify);
    };

    Centi.Matrix.prototype.inverseTransform = function() {
        return this._inverseTransform(Point.read(arguments));
    };

    Centi.Matrix.prototype._getDeterminant = function() {
        var det = this._a * this._d - this._b * this._c;
        return isFinite(det) && !Numerical.isZero(det) && isFinite(this._tx) && isFinite(this._ty) ? det : null;
    };

    Centi.Matrix.prototype._inverseTransform = function(point, dest, _dontNotify) {
        var det = this._getDeterminant();
        if (!det)
            return null;
        var x = point.x - this._tx,
            y = point.y - this._ty;
        if (!dest)
            dest = new Point();
        return dest.set(
            (x * this._d - y * this._b) / det, (y * this._a - x * this._c) / det,
            _dontNotify
        );
    };

    Centi.Matrix.prototype.decompose = function() {
        var a = this._a,
            b = this._b,
            c = this._c,
            d = this._d;
        if (Numerical.isZero(a * d - b * c))
            return null;

        var scaleX = Math.sqrt(a * a + b * b);
        a /= scaleX;
        b /= scaleX;

        var shear = a * c + b * d;
        c -= a * shear;
        d -= b * shear;

        var scaleY = Math.sqrt(c * c + d * d);
        c /= scaleY;
        d /= scaleY;
        shear /= scaleY;

        if (a * d < b * c) {
            a = -a;
            b = -b;
            shear = -shear;
            scaleX = -scaleX;
        }

        return {
            scaling: new Centi.Vec2(scaleX, scaleY),
            rotation: -Math.atan2(b, a) * 180 / Math.PI,
            shearing: shear
        };
    };

    Centi.Matrix.prototype.getValues = function() {
        return [this._a, this._c, this._b, this._d, this._tx, this._ty];
    };

    Centi.Matrix.prototype.getTranslation = function() {
        return new Centi.Vec2(this._tx, this._ty);
    };

    Centi.Matrix.prototype.getScaling = function() {
        return (this.decompose() || {}).scaling;
    };

    Centi.Matrix.prototype.getRotation = function() {
        return (this.decompose() || {}).rotation;
    };

    Centi.Matrix.prototype.inverted = function() {
        var det = this._getDeterminant();
        return det && new Centi.Matrix(
            this._d / det, -this._c / det, -this._b / det,
            this._a / det, (this._b * this._ty - this._d * this._tx) / det, (this._c * this._tx - this._a * this._ty) / det);
    };

    Centi.Matrix.prototype.shiftless = function() {
        return new Centi.Matrix(this._a, this._c, this._b, this._d, 0, 0);
    };

    Centi.Matrix.prototype.applyToContext = function(ctx) {
        ctx.transform(this._a, this._c, this._b, this._d, this._tx, this._ty);
    };

})(Centi);