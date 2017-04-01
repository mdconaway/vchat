let Filters = {};
if (typeof Float32Array == 'undefined') {
    Filters.getFloat32Array =
    Filters.getUint8Array = function(len) {
    if (len.length) {
        return len.slice(0);
    }
    return new Array(len);
    };
} else {
    Filters.getFloat32Array = function(len) {
    return new Float32Array(len);
    };
    Filters.getUint8Array = function(len) {
    return new Uint8Array(len);
    };
}

if (typeof document != 'undefined') {
    Filters.tmpCanvas = document.createElement('canvas');
    Filters.tmpCtx = Filters.tmpCanvas.getContext('2d');

    Filters.getPixels = function(img) {
    let c, ctx;
    if (img.getContext) {
        c = img;
        ctx = c.getContext('2d');  
    }
    if (!ctx) {
        c = this.getCanvas(img.width, img.height);
        ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
    }
    return ctx.getImageData(0,0,c.width,c.height);
    };

    Filters.createImageData = function(w, h) {
    return this.tmpCtx.createImageData(w, h);
    };

    Filters.getCanvas = function(w,h) {
    let c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
    };

    Filters.filterImage = function(filter, image) {   //var_args trimmed from args list
    let args = [this.getPixels(image)];
    for (let i=2; i<arguments.length; i++) {
        args.push(arguments[i]);
    }
    return filter.apply(this, args);
    };

    Filters.toCanvas = function(pixels) {
    let canvas = this.getCanvas(pixels.width, pixels.height);
    canvas.getContext('2d').putImageData(pixels, 0, 0);
    return canvas;
    };

    Filters.toImageData = function(pixels) {
    return this.identity(pixels);
    };

} else {

    /*onmessage = function(e) {  //only commented out to negate the JSLine complaints
    var ds = e.data;
    if (!ds.length) {
        ds = [ds];
    }
    postMessage(Filters.runPipeline(ds));
    };*/

    Filters.createImageData = function(w, h) {
        return {width: w, height: h, data: this.getFloat32Array(w*h*4)};
    };

}

Filters.runPipeline = function(ds) {
    let res = null;
    res = this[ds[0].name].apply(this, ds[0].args);
    for (let i=1; i<ds.length; i++) {
    let d = ds[i];
    let args = d.args.slice(0);
    args.unshift(res);
    res = this[d.name].apply(this, args);
    }
    return res;
};

Filters.createImageDataFloat32 = function(w, h) {
    return {width: w, height: h, data: this.getFloat32Array(w*h*4)};
};

Filters.identity = function(pixels) {   //args trimmed from arguments list
    let output = Filters.createImageData(pixels.width, pixels.height);
    let dst = output.data;
    let d = pixels.data;
    for (let i=0; i<d.length; i++) {
    dst[i] = d[i];
    }
    return output;
};

Filters.horizontalFlip = function(pixels) {
    let output = Filters.createImageData(pixels.width, pixels.height);
    let w = pixels.width;
    let h = pixels.height;
    let dst = output.data;
    let d = pixels.data;
    for (let y=0; y<h; y++) {
    for (let x=0; x<w; x++) {
        let off = (y*w+x)*4;
        let dstOff = (y*w+(w-x-1))*4;
        dst[dstOff] = d[off];
        dst[dstOff+1] = d[off+1];
        dst[dstOff+2] = d[off+2];
        dst[dstOff+3] = d[off+3];
    }
    }
    return output;
};

Filters.verticalFlip = function(pixels) {
    let output = Filters.createImageData(pixels.width, pixels.height);
    let w = pixels.width;
    let h = pixels.height;
    let dst = output.data;
    let d = pixels.data;
    for (let y=0; y<h; y++) {
    for (let x=0; x<w; x++) {
        let off = (y*w+x)*4;
        let dstOff = ((h-y-1)*w+x)*4;
        dst[dstOff] = d[off];
        dst[dstOff+1] = d[off+1];
        dst[dstOff+2] = d[off+2];
        dst[dstOff+3] = d[off+3];
    }
    }
    return output;
};

Filters.luminance = function(pixels) {  //args trimmed from arguments list
    let output = Filters.createImageData(pixels.width, pixels.height);
    let dst = output.data;
    let d = pixels.data;
    for (let i=0; i<d.length; i+=4) {
    let r = d[i];
    let g = d[i+1];
    let b = d[i+2];
    // CIE luminance for the RGB
    let v = 0.2126*r + 0.7152*g + 0.0722*b;
    dst[i] = dst[i+1] = dst[i+2] = v;
    dst[i+3] = d[i+3];
    }
    return output;
};

Filters.grayscale = function(pixels) {  //args trimmed from arguments list
    let output = Filters.createImageData(pixels.width, pixels.height);
    let dst = output.data;
    let d = pixels.data;
    for (let i=0; i<d.length; i+=4) {
    let r = d[i];
    let g = d[i+1];
    let b = d[i+2];
    let v = 0.3*r + 0.59*g + 0.11*b;
    dst[i] = dst[i+1] = dst[i+2] = v;
    dst[i+3] = d[i+3];
    }
    return output;
};

//Added sepia filter
Filters.sepia = function(pixels, args) {
    let intensity = args && args > 0 ? parseFloat(args) : 1;
    let grey = Filters.grayscale(pixels);
    let output = Filters.createImageData(pixels.width, pixels.height);
    let dst = output.data;
    let d = grey.data;
    let sepiadepth = 20;
    let radd = parseInt(intensity*(2*sepiadepth));
    let gadd = parseInt(intensity*(sepiadepth));
    for (let i=0; i<d.length; i+=4) {
    let v = d[i];
    dst[i] = v+radd;
    dst[i+1] = v+gadd;
    dst[i+2] = v;
    dst[i+3] = d[i+3];
    }
    return output;
};
//End sepia filter

Filters.grayscaleAvg = function(pixels) {   //args removed from arguments list
    let output = Filters.createImageData(pixels.width, pixels.height);
    let dst = output.data;
    let d = pixels.data;
    let f = 1/3;
    for (let i=0; i<d.length; i+=4) {
    let r = d[i];
    let g = d[i+1];
    let b = d[i+2];
    let v = (r+g+b) * f;
    dst[i] = dst[i+1] = dst[i+2] = v;
    dst[i+3] = d[i+3];
    }
    return output;
};

Filters.threshold = function(pixels, threshold, high, low) {
    let output = Filters.createImageData(pixels.width, pixels.height);
    if (high == null) high = 255;
    if (low == null) low = 0;
    let d = pixels.data;
    let dst = output.data;
    for (let i=0; i<d.length; i+=4) {
    let r = d[i];
    let g = d[i+1];
    let b = d[i+2];
    let v = (0.3*r + 0.59*g + 0.11*b >= threshold) ? high : low;
    dst[i] = dst[i+1] = dst[i+2] = v;
    dst[i+3] = d[i+3];
    }
    return output;
};

Filters.invert = function(pixels) {
    let output = Filters.createImageData(pixels.width, pixels.height);
    let d = pixels.data;
    let dst = output.data;
    for (let i=0; i<d.length; i+=4) {
    dst[i] = 255-d[i];
    dst[i+1] = 255-d[i+1];
    dst[i+2] = 255-d[i+2];
    dst[i+3] = d[i+3];
    }
    return output;
};

Filters.brightnessContrast = function(pixels, brightness, contrast) {
    let lut = this.brightnessContrastLUT(brightness, contrast);
    return this.applyLUT(pixels, {r:lut, g:lut, b:lut, a:this.identityLUT()});
};

Filters.applyLUT = function(pixels, lut) {
    let output = Filters.createImageData(pixels.width, pixels.height);
    let d = pixels.data;
    let dst = output.data;
    let r = lut.r;
    let g = lut.g;
    let b = lut.b;
    let a = lut.a;
    for (let i=0; i<d.length; i+=4) {
    dst[i] = r[d[i]];
    dst[i+1] = g[d[i+1]];
    dst[i+2] = b[d[i+2]];
    dst[i+3] = a[d[i+3]];
    }
    return output;
};

Filters.createLUTFromCurve = function(points) {
    let lut = this.getUint8Array(256);
    let p = [0, 0];
    for (let i=0, j=0; i<lut.length; i++) {
    while (j < points.length && points[j][0] < i) {
        p = points[j];
        j++;
    }
    lut[i] = p[1];
    }
    return lut;
};

Filters.identityLUT = function() {
    let lut = this.getUint8Array(256);
    for (let i=0; i<lut.length; i++) {
    lut[i] = i;
    }
    return lut;
};

Filters.invertLUT = function() {
    let lut = this.getUint8Array(256);
    for (let i=0; i<lut.length; i++) {
    lut[i] = 255-i;
    }
    return lut;
};

Filters.brightnessContrastLUT = function(brightness, contrast) {
    let lut = this.getUint8Array(256);
    let contrastAdjust = -128*contrast + 128;
    let brightnessAdjust = 255 * brightness;
    let adjust = contrastAdjust + brightnessAdjust;
    for (let i=0; i<lut.length; i++) {
    let c = i*contrast + adjust;
    lut[i] = c < 0 ? 0 : (c > 255 ? 255 : c);
    }
    return lut;
};

Filters.convolve = function(pixels, weights, opaque) {
    let side = Math.round(Math.sqrt(weights.length));
    let halfSide = Math.floor(side/2);

    let src = pixels.data;
    let sw = pixels.width;
    let sh = pixels.height;

    let w = sw;
    let h = sh;
    let output = Filters.createImageData(w, h);
    let dst = output.data;

    let alphaFac = opaque ? 1 : 0;

    for (let y=0; y<h; y++) {
    for (let x=0; x<w; x++) {
        let sy = y;
        let sx = x;
        let dstOff = (y*w+x)*4;
        let r=0, g=0, b=0, a=0;
        for (let cy=0; cy<side; cy++) {
        for (let cx=0; cx<side; cx++) {
            let scy = Math.min(sh-1, Math.max(0, sy + cy - halfSide));
            let scx = Math.min(sw-1, Math.max(0, sx + cx - halfSide));
            let srcOff = (scy*sw+scx)*4;
            let wt = weights[cy*side+cx];
            r += src[srcOff] * wt;
            g += src[srcOff+1] * wt;
            b += src[srcOff+2] * wt;
            a += src[srcOff+3] * wt;
        }
        }
        dst[dstOff] = r;
        dst[dstOff+1] = g;
        dst[dstOff+2] = b;
        dst[dstOff+3] = a + alphaFac*(255-a);
    }
    }
    return output;
};

Filters.verticalConvolve = function(pixels, weightsVector, opaque) {
    let side = weightsVector.length;
    let halfSide = Math.floor(side/2);

    let src = pixels.data;
    let sw = pixels.width;
    let sh = pixels.height;

    let w = sw;
    let h = sh;
    let output = Filters.createImageData(w, h);
    let dst = output.data;

    let alphaFac = opaque ? 1 : 0;

    for (let y=0; y<h; y++) {
    for (let x=0; x<w; x++) {
        let sy = y;
        let sx = x;
        let dstOff = (y*w+x)*4;
        let r=0, g=0, b=0, a=0;
        for (let cy=0; cy<side; cy++) {
        let scy = Math.min(sh-1, Math.max(0, sy + cy - halfSide));
        let scx = sx;
        let srcOff = (scy*sw+scx)*4;
        let wt = weightsVector[cy];
        r += src[srcOff] * wt;
        g += src[srcOff+1] * wt;
        b += src[srcOff+2] * wt;
        a += src[srcOff+3] * wt;
        }
        dst[dstOff] = r;
        dst[dstOff+1] = g;
        dst[dstOff+2] = b;
        dst[dstOff+3] = a + alphaFac*(255-a);
    }
    }
    return output;
};

Filters.horizontalConvolve = function(pixels, weightsVector, opaque) {
    let side = weightsVector.length;
    let halfSide = Math.floor(side/2);

    let src = pixels.data;
    let sw = pixels.width;
    let sh = pixels.height;

    let w = sw;
    let h = sh;
    let output = Filters.createImageData(w, h);
    let dst = output.data;

    let alphaFac = opaque ? 1 : 0;

    for (let y=0; y<h; y++) {
    for (let x=0; x<w; x++) {
        let sy = y;
        let sx = x;
        let dstOff = (y*w+x)*4;
        let r=0, g=0, b=0, a=0;
        for (let cx=0; cx<side; cx++) {
        let scy = sy;
        let scx = Math.min(sw-1, Math.max(0, sx + cx - halfSide));
        let srcOff = (scy*sw+scx)*4;
        let wt = weightsVector[cx];
        r += src[srcOff] * wt;
        g += src[srcOff+1] * wt;
        b += src[srcOff+2] * wt;
        a += src[srcOff+3] * wt;
        }
        dst[dstOff] = r;
        dst[dstOff+1] = g;
        dst[dstOff+2] = b;
        dst[dstOff+3] = a + alphaFac*(255-a);
    }
    }
    return output;
};

Filters.separableConvolve = function(pixels, horizWeights, vertWeights, opaque) {
    return this.horizontalConvolve(
    this.verticalConvolveFloat32(pixels, vertWeights, opaque),
    horizWeights, opaque
    );
};

Filters.convolveFloat32 = function(pixels, weights, opaque) {
    let side = Math.round(Math.sqrt(weights.length));
    let halfSide = Math.floor(side/2);

    let src = pixels.data;
    let sw = pixels.width;
    let sh = pixels.height;

    let w = sw;
    let h = sh;
    let output = Filters.createImageDataFloat32(w, h);
    let dst = output.data;

    let alphaFac = opaque ? 1 : 0;

    for (let y=0; y<h; y++) {
    for (let x=0; x<w; x++) {
        let sy = y;
        let sx = x;
        let dstOff = (y*w+x)*4;
        let r=0, g=0, b=0, a=0;
        for (let cy=0; cy<side; cy++) {
        for (let cx=0; cx<side; cx++) {
            let scy = Math.min(sh-1, Math.max(0, sy + cy - halfSide));
            let scx = Math.min(sw-1, Math.max(0, sx + cx - halfSide));
            let srcOff = (scy*sw+scx)*4;
            let wt = weights[cy*side+cx];
            r += src[srcOff] * wt;
            g += src[srcOff+1] * wt;
            b += src[srcOff+2] * wt;
            a += src[srcOff+3] * wt;
        }
        }
        dst[dstOff] = r;
        dst[dstOff+1] = g;
        dst[dstOff+2] = b;
        dst[dstOff+3] = a + alphaFac*(255-a);
    }
    }
    return output;
};

Filters.verticalConvolveFloat32 = function(pixels, weightsVector, opaque) {
    let side = weightsVector.length;
    let halfSide = Math.floor(side/2);

    let src = pixels.data;
    let sw = pixels.width;
    let sh = pixels.height;

    let w = sw;
    let h = sh;
    let output = Filters.createImageDataFloat32(w, h);
    let dst = output.data;

    let alphaFac = opaque ? 1 : 0;

    for (let y=0; y<h; y++) {
    for (let x=0; x<w; x++) {
        let sy = y;
        let sx = x;
        let dstOff = (y*w+x)*4;
        let r=0, g=0, b=0, a=0;
        for (let cy=0; cy<side; cy++) {
        let scy = Math.min(sh-1, Math.max(0, sy + cy - halfSide));
        let scx = sx;
        let srcOff = (scy*sw+scx)*4;
        let wt = weightsVector[cy];
        r += src[srcOff] * wt;
        g += src[srcOff+1] * wt;
        b += src[srcOff+2] * wt;
        a += src[srcOff+3] * wt;
        }
        dst[dstOff] = r;
        dst[dstOff+1] = g;
        dst[dstOff+2] = b;
        dst[dstOff+3] = a + alphaFac*(255-a);
    }
    }
    return output;
};

Filters.horizontalConvolveFloat32 = function(pixels, weightsVector, opaque) {
    let side = weightsVector.length;
    let halfSide = Math.floor(side/2);

    let src = pixels.data;
    let sw = pixels.width;
    let sh = pixels.height;

    let w = sw;
    let h = sh;
    let output = Filters.createImageDataFloat32(w, h);
    let dst = output.data;

    let alphaFac = opaque ? 1 : 0;

    for (let y=0; y<h; y++) {
    for (let x=0; x<w; x++) {
        let sy = y;
        let sx = x;
        let dstOff = (y*w+x)*4;
        let r=0, g=0, b=0, a=0;
        for (let cx=0; cx<side; cx++) {
        let scy = sy;
        let scx = Math.min(sw-1, Math.max(0, sx + cx - halfSide));
        let srcOff = (scy*sw+scx)*4;
        let wt = weightsVector[cx];
        r += src[srcOff] * wt;
        g += src[srcOff+1] * wt;
        b += src[srcOff+2] * wt;
        a += src[srcOff+3] * wt;
        }
        dst[dstOff] = r;
        dst[dstOff+1] = g;
        dst[dstOff+2] = b;
        dst[dstOff+3] = a + alphaFac*(255-a);
    }
    }
    return output;
};

Filters.separableConvolveFloat32 = function(pixels, horizWeights, vertWeights, opaque) {
    return this.horizontalConvolveFloat32(
    this.verticalConvolveFloat32(pixels, vertWeights, opaque),
    horizWeights, opaque
    );
};

Filters.gaussianBlur = function(pixels, diameter) {
    diameter = Math.abs(diameter);
    if (diameter <= 1) return Filters.identity(pixels);
    let radius = diameter / 2;
    let len = Math.ceil(diameter) + (1 - (Math.ceil(diameter) % 2));
    let weights = this.getFloat32Array(len);
    let rho = (radius+0.5) / 3;
    let rhoSq = rho*rho;
    let gaussianFactor = 1 / Math.sqrt(2*Math.PI*rhoSq);
    let rhoFactor = -1 / (2*rho*rho);
    let wsum = 0;
    let middle = Math.floor(len/2);
    for (let i=0; i<len; i++) {
    let x = i-middle;
    let gx = gaussianFactor * Math.exp(x*x*rhoFactor);
    weights[i] = gx;
    wsum += gx;
    }
    for (let a=0; a<weights.length; a++) {
    weights[a] /= wsum;
    }
    return Filters.separableConvolve(pixels, weights, weights, false);
};

Filters.laplaceKernel = Filters.getFloat32Array(
    [-1,-1,-1,
    -1, 8,-1,
    -1,-1,-1]);
Filters.laplace = function(pixels) {
    return Filters.convolve(pixels, this.laplaceKernel, true);
};

Filters.sobelSignVector = Filters.getFloat32Array([-1,0,1]);
Filters.sobelScaleVector = Filters.getFloat32Array([1,2,1]);

Filters.sobelVerticalGradient = function(px) {
    return this.separableConvolveFloat32(px, this.sobelSignVector, this.sobelScaleVector);
};

Filters.sobelHorizontalGradient = function(px) {
    return this.separableConvolveFloat32(px, this.sobelScaleVector, this.sobelSignVector);
};

Filters.sobelVectors = function(px) {
    let vertical = this.sobelVerticalGradient(px);
    let horizontal = this.sobelHorizontalGradient(px);
    let id = {width: vertical.width, height: vertical.height,
            data: this.getFloat32Array(vertical.width*vertical.height*8)};
    let vd = vertical.data;
    let hd = horizontal.data;
    let idd = id.data;
    for (let i=0, j=0; i<idd.length; i+=2,j++) {
    idd[i] = hd[j];
    idd[i+1] = vd[j];
    }
    return id;
};

Filters.sobel = function(px) {
    px = this.grayscale(px);
    let vertical = this.sobelVerticalGradient(px);
    let horizontal = this.sobelHorizontalGradient(px);
    let id = this.createImageData(vertical.width, vertical.height);
    for (let i=0; i<id.data.length; i+=4) {
    let v = Math.abs(vertical.data[i]);
    id.data[i] = v;
    let h = Math.abs(horizontal.data[i]);
    id.data[i+1] = h;
    id.data[i+2] = (v+h)/4;
    id.data[i+3] = 255;
    }
    return id;
};

Filters.bilinearSample = function (pixels, x, y, rgba) {
    let x1 = Math.floor(x);
    let x2 = Math.ceil(x);
    let y1 = Math.floor(y);
    let y2 = Math.ceil(y);
    let a = (x1+pixels.width*y1)*4;
    let b = (x2+pixels.width*y1)*4;
    let c = (x1+pixels.width*y2)*4;
    let d = (x2+pixels.width*y2)*4;
    let df = ((x-x1) + (y-y1));
    let cf = ((x2-x) + (y-y1));
    let bf = ((x-x1) + (y2-y));
    let af = ((x2-x) + (y2-y));
    let rsum = 1/(af+bf+cf+df);
    af *= rsum;
    bf *= rsum;
    cf *= rsum;
    df *= rsum;
    let data = pixels.data;
    rgba[0] = data[a]*af + data[b]*bf + data[c]*cf + data[d]*df;
    rgba[1] = data[a+1]*af + data[b+1]*bf + data[c+1]*cf + data[d+1]*df;
    rgba[2] = data[a+2]*af + data[b+2]*bf + data[c+2]*cf + data[d+2]*df;
    rgba[3] = data[a+3]*af + data[b+3]*bf + data[c+3]*cf + data[d+3]*df;
    return rgba;
};

Filters.distortSine = function(pixels, amount, yamount) {
    if (amount == null) amount = 0.5;
    if (yamount == null) yamount = amount;
    let output = this.createImageData(pixels.width, pixels.height);
    let dst = output.data;
    //var d = pixels.data;
    let px = this.createImageData(1,1).data;
    for (let y=0; y<output.height; y++) {
    let sy = -Math.sin(y/(output.height-1) * Math.PI*2);
    let srcY = y + sy * yamount * output.height/4;
    srcY = Math.max(Math.min(srcY, output.height-1), 0);

    for (let x=0; x<output.width; x++) {
        let sx = -Math.sin(x/(output.width-1) * Math.PI*2);
        let srcX = x + sx * amount * output.width/4;
        srcX = Math.max(Math.min(srcX, output.width-1), 0);

        let rgba = this.bilinearSample(pixels, srcX, srcY, px);

        let off = (y*output.width+x)*4;
        dst[off] = rgba[0];
        dst[off+1] = rgba[1];
        dst[off+2] = rgba[2];
        dst[off+3] = rgba[3];
    }
    }
    return output;
};

Filters.darkenBlend = function(below, above) {
    let output = Filters.createImageData(below.width, below.height);
    let a = below.data;
    let b = above.data;
    let dst = output.data;
    let f = 1/255;
    for (let i=0; i<a.length; i+=4) {
    dst[i] = a[i] < b[i] ? a[i] : b[i];
    dst[i+1] = a[i+1] < b[i+1] ? a[i+1] : b[i+1];
    dst[i+2] = a[i+2] < b[i+2] ? a[i+2] : b[i+2];
    dst[i+3] = a[i+3]+((255-a[i+3])*b[i+3])*f;
    }
    return output;
};

Filters.lightenBlend = function(below, above) {
    let output = Filters.createImageData(below.width, below.height);
    let a = below.data;
    let b = above.data;
    let dst = output.data;
    let f = 1/255;
    for (let i=0; i<a.length; i+=4) {
    dst[i] = a[i] > b[i] ? a[i] : b[i];
    dst[i+1] = a[i+1] > b[i+1] ? a[i+1] : b[i+1];
    dst[i+2] = a[i+2] > b[i+2] ? a[i+2] : b[i+2];
    dst[i+3] = a[i+3]+((255-a[i+3])*b[i+3])*f;
    }
    return output;
};

Filters.multiplyBlend = function(below, above) {
    let output = Filters.createImageData(below.width, below.height);
    let a = below.data;
    let b = above.data;
    let dst = output.data;
    let f = 1/255;
    for (let i=0; i<a.length; i+=4) {
    dst[i] = (a[i]*b[i])*f;
    dst[i+1] = (a[i+1]*b[i+1])*f;
    dst[i+2] = (a[i+2]*b[i+2])*f;
    dst[i+3] = a[i+3]+((255-a[i+3])*b[i+3])*f;
    }
    return output;
};

Filters.screenBlend = function(below, above) {
    let output = Filters.createImageData(below.width, below.height);
    let a = below.data;
    let b = above.data;
    let dst = output.data;
    let f = 1/255;
    for (let i=0; i<a.length; i+=4) {
    dst[i] = a[i]+b[i]-a[i]*b[i]*f;
    dst[i+1] = a[i+1]+b[i+1]-a[i+1]*b[i+1]*f;
    dst[i+2] = a[i+2]+b[i+2]-a[i+2]*b[i+2]*f;
    dst[i+3] = a[i+3]+((255-a[i+3])*b[i+3])*f;
    }
    return output;
};

Filters.addBlend = function(below, above) {
    let output = Filters.createImageData(below.width, below.height);
    let a = below.data;
    let b = above.data;
    let dst = output.data;
    let f = 1/255;
    for (let i=0; i<a.length; i+=4) {
    dst[i] = (a[i]+b[i]);
    dst[i+1] = (a[i+1]+b[i+1]);
    dst[i+2] = (a[i+2]+b[i+2]);
    dst[i+3] = a[i+3]+((255-a[i+3])*b[i+3])*f;
    }
    return output;
};

Filters.subBlend = function(below, above) {
    let output = Filters.createImageData(below.width, below.height);
    let a = below.data;
    let b = above.data;
    let dst = output.data;
    let f = 1/255;
    for (let i=0; i<a.length; i+=4) {
    dst[i] = (a[i]+b[i]-255);
    dst[i+1] = (a[i+1]+b[i+1]-255);
    dst[i+2] = (a[i+2]+b[i+2]-255);
    dst[i+3] = a[i+3]+((255-a[i+3])*b[i+3])*f;
    }
    return output;
};

Filters.differenceBlend = function(below, above) {
    let output = Filters.createImageData(below.width, below.height);
    let a = below.data;
    let b = above.data;
    let dst = output.data;
    let f = 1/255;
    for (let i=0; i<a.length; i+=4) {
    dst[i] = Math.abs(a[i]-b[i]);
    dst[i+1] = Math.abs(a[i+1]-b[i+1]);
    dst[i+2] = Math.abs(a[i+2]-b[i+2]);
    dst[i+3] = a[i+3]+((255-a[i+3])*b[i+3])*f;
    }
    return output;
};

Filters.erode = function(pixels) {
    let src = pixels.data;
    let sw = pixels.width;
    let sh = pixels.height;

    let w = sw;
    let h = sh;
    let output = Filters.createImageData(w, h);
    let dst = output.data;

    for (let y=0; y<h; y++) {
    for (let x=0; x<w; x++) {
        let sy = y;
        let sx = x;
        let dstOff = (y*w+x)*4;
        let srcOff = (sy*sw+sx)*4;
        let v = 0;
        if (src[srcOff] === 0) {
        if (src[(sy*sw+Math.max(0,sx-1))*4] === 0 && 
            src[(Math.max(0,sy-1)*sw+sx)*4] === 0) {
            v = 255;
        }
        } else {
            v = 255;
        }
        dst[dstOff] = v;
        dst[dstOff+1] = v;
        dst[dstOff+2] = v;
        dst[dstOff+3] = 255;
    }
    }
    return output;
};

export default Filters;