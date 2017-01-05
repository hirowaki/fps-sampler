# fps-sampler

[![Build Status](https://travis-ci.org/hirowaki/fps-sampler.svg?branch=master)](https://travis-ci.org/hirowaki/fps-sampler)

## FPS Sampler

### public API
```
FPSSampler(numSamples)
```
Constructor can have `numSamples` which specifies how many latest frame seconds we'll store. Default is 60. In general, this will be as same as what FPS you'd like to have.

```
FPSSampler.prototype.observe(observerFunc)
```
Set observerFunc(callback). When you call `update`, this callback will be called.

```
FPSSampler.prototype.update()
```
You have to call `update` each frame from your application code (main loop). The result will be `{fps: fps, now: Date.time(), elapsed: elapsed ms since the last call}`. When you set `observerFunc`, observerFunc will be called.

### Use case
#### Use case 1. not using callback(observer).
```
// not using callback(observer).
const FPSSampler = require('fps-sampler');

const sampler = new FPSSampler(60);     // sampling latest 60 frames.

function update() {
    const info = sampler.update();

    console.log("FPS ", info.fps);
    console.log("elpased ms ", info.elapsed);
    ...
}

```

#### Use case 2. using callback(observer).
```
const FPSSampler = require('fps-sampler');

const sampler = new FPSSampler(60);     // sampling latest 60 frames.
sampler.observe((info) => {
    console.log("FPS ", info.fps);
    console.log("elpased ms ", info.elapsed);
});

function update() {
    sampler.update();   // this will hit the observer function.
    ...
}

```

#### In case you'd like to use EventEmitter (node/events).
```
const FPSSampler = require('fps-sampler');
const EventEmitter = require('events');

const sampler = new FPSSampler(60);     // sampling latest 60 frames.
const emitter = new EventEmitter();

sampler.observe((info) => {
    emitter.emit('FPS', info);
});

emitter.on('FPS', (info) => {
    console.log("FPS ", info.fps);
    console.log("elpased ms ", info.elapsed);
});

function update() {
    sampler.update();   // this will hit the observer function.
    ...
}

```

## LICENSE

The MIT License (MIT)

Copyright (c) 2017 hirowaki (https://github.com/hirowaki).

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
