'use strict';

/**
 fps-sampler/index.js

 Copyright (c) 2017 hirowaki https://github.com/hirowaki

 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
*/


var FpsSampler = function (numSamples) {
    this._numSamples = numSamples || 60;
    this._samples = [];
    this._sum = 0;

    this._lastFrame = null;
    this._observerFunc = null;
};

FpsSampler.prototype._addSample = function (elapsed) {
    while (this._samples.length >= this._numSamples) {
        this._sum -= this._samples.shift();
    }
    this._samples.push(elapsed);
    this._sum += elapsed;
};

FpsSampler.prototype._getAverage = function () {
    var length = this._samples.length;
    if (length > 0) {
        return this._sum / length;
    }
    return 0;
};

FpsSampler.prototype.observe = function (observerFunc) {
    this._observerFunc = observerFunc;
};

FpsSampler.prototype.update = function () {
    var elapsed = 0;

    // calc elapsed.
    var now = Date.now();
    if (this._lastFrame !== null) {
        elapsed = now - this._lastFrame;
    }
    this._lastFrame = now;

    // add new sampling data.
    this._addSample(elapsed);

    // compute fps.
    var fps = (60 / (this._getAverage() / (1000 / 60))) | 0;

    var info = {
        fps: fps,
        now: now,
        elapsed: elapsed
    };

    if (this._observerFunc) {
        this._observerFunc.call(this, info);
    }

    return info;
};


// in ES6.
/*
class FpsSampler {
    constructor(numSamples) {
        this._numSamples = numSamples || 60;
        this._samples = [];
        this._sum = 0;

        this._lastFrame = null;
        this._observerFunc = null;
    }

    _addSample(elapsed) {
        while (this._samples.length >= this._numSamples) {
            this._sum -= this._samples.shift();
        }
        this._samples.push(elapsed);
        this._sum += elapsed;
    }

    _getAverage() {
        const length = this._samples.length;
        if (length > 0) {
            return this._sum / length;
        }
        return 0;
    }

    observe(observerFunc) {
        this._observerFunc = observerFunc;
    }

    update() {
        let elapsed = 0;

        // calc elapsed.
        const now = Date.now();
        if (this._lastFrame !== null) {
            elapsed = now - this._lastFrame;
        }
        this._lastFrame = now;

        // add new sampling data.
        this._addSample(elapsed);

        // compute fps.
        const fps = (60 / (this._getAverage() / (1000 / 60))) | 0;

        const info = {
            fps: fps,
            now: now,
            elapsed: elapsed
        };

        if (this._observerFunc) {
            this._observerFunc.call(this, info);
        }

        return info;
    }
}
*/

module.exports = FpsSampler;
