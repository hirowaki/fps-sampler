'use strict';

var assert = require('assert');
var sinon = require('sinon');
var FPSSampler = require('./../index');
var EventEmitter = require('events');

describe('FPSSampler tests.', function () {
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('constructor.', function () {
        it('numSamples specified.', function () {
            var instance = new FPSSampler(30);
            assert.strictEqual(instance._numSamples, 30);
            assert.strictEqual(instance._samples.length, 0);
            assert.strictEqual(instance._sum, 0);
            assert.strictEqual(instance._lastFrame, null);
            assert.strictEqual(instance._observerFunc, null);
        });

        it('numSamples not specified.', function () {
            var instance = new FPSSampler();
            assert.strictEqual(instance._numSamples, 60);
            assert.strictEqual(instance._samples.length, 0);
            assert.strictEqual(instance._sum, 0);
            assert.strictEqual(instance._lastFrame, null);
            assert.strictEqual(instance._observerFunc, null);
        });
    });

    describe('_addSample.', function () {
        it('push new one.', function () {
            var instance = new FPSSampler();
            assert.strictEqual(instance._samples.length, 0);

            instance._addSample(123);
            assert.strictEqual(instance._samples.length, 1);
            assert.strictEqual(instance._samples[0], 123);
        });

        it('push new one. case overflow handling.', function () {
            var instance = new FPSSampler(2);
            assert.strictEqual(instance._samples.length, 0);

            instance._addSample(123);
            instance._addSample(456);
            assert.strictEqual(instance._samples.length, 2);
            assert.strictEqual(instance._samples[0], 123);
            assert.strictEqual(instance._samples[1], 456);
            assert.strictEqual(instance._sum, 123 + 456);

            instance._addSample(789);
            assert.strictEqual(instance._samples.length, 2);
            assert.strictEqual(instance._samples[0], 456);
            assert.strictEqual(instance._samples[1], 789);
            assert.strictEqual(instance._sum, 456 + 789);
        });
    });

    describe('_getAverage.', function () {
        it('check up.', function () {
            var instance = new FPSSampler(60);
            instance._addSample(1);
            instance._addSample(2);
            instance._addSample(3);
            instance._addSample(4);
            instance._addSample(5);
            instance._addSample(6);

            assert.strictEqual(instance._getAverage(), (1 + 2 + 3 + 4 + 5 + 6) / 6);
        });

        it('case _samples are empty.', function () {
            var instance = new FPSSampler();
            assert.strictEqual(instance._getAverage(), 0);
        });
    });

    describe('update.', function () {
        it('no observer.', function () {
            var clock = sandbox.useFakeTimers();

            var instance = new FPSSampler(60);
            // first frame always results 0.
            assert.deepEqual(instance.update(), {
                fps: 0,
                now: 0,
                elapsed: 0
            });

            clock.tick(16); // tick 16msec.
            assert.deepEqual(instance.update(), {
                fps: (60 / ((16 / 2) / (1000 / 60))) | 0,
                now: 16,
                elapsed: 16
            });
        });

        it('observer.', function () {
            var _fps = (60 / (16 / (1000 / 60))) | 0;
            var callCount = 0;
            var testObserver = function (info) {
                assert.deepEqual(info, {
                    fps: _fps,
                    now: 16,
                    elapsed: 16
                });
                ++callCount;
            };

            var clock = sandbox.useFakeTimers();
            var instance = new FPSSampler(60);
            instance.observe(testObserver);
            instance._lastFrame = 0;

            clock.tick(16); // tick 16msec.
            assert.deepEqual(instance.update(), {
                fps: _fps,
                now: 16,
                elapsed: 16
            });
            assert.strictEqual(callCount, 1);
        });

        it('observer.', function () {
            var clock = sandbox.useFakeTimers();

            var instance = new FPSSampler(2);
            instance._lastFrame = 0;

            clock.tick(16); // tick 16msec.
            assert.deepEqual(instance.update(), {
                fps: (60 / (16 / (1000 / 60))) | 0,
                now: 16,
                elapsed: 16
            });

            clock.tick(16); // tick 16msec.
            assert.deepEqual(instance.update(), {
                fps: (60 / (16 / (1000 / 60))) | 0,
                now: 32,
                elapsed: 16
            });

            clock.tick(17); // tick 16msec.
            assert.deepEqual(instance.update(), {
                fps: (60 / (16.5 / (1000 / 60))) | 0,
                now: 49,
                elapsed: 17
            });
        });
    });

    describe('observe.', function () {
        it('set observer.', function () {
            var funcA = function () {};
            var funcB = function () {};

            var instance = new FPSSampler();
            assert.strictEqual(instance._observerFunc, null);

            instance.observe(funcA);
            assert.strictEqual(instance._observerFunc, funcA);

            instance.observe(funcB);
            assert.strictEqual(instance._observerFunc, funcB);

            instance.observe(null);
            assert.strictEqual(instance._observerFunc, null);
        });
    });

    describe('integration test using EventEmitter.', function () {
        it('numSamples specified.', function () {
            var instance = new FPSSampler(30);
            var emitter = new EventEmitter();
            var eventCount = 0;

            // subscriber.
            emitter.on('FPS', function (info) {
                ++eventCount;
                assert.strictEqual(info.now, 16 * eventCount);
                assert.strictEqual(info.elapsed, 16);
            });

            instance.observe(function (info) {
                emitter.emit('FPS', info);
            });
            instance._lastFrame = 0;

            var clock = sandbox.useFakeTimers();
            clock.tick(16); // tick 16msec.
            assert.strictEqual(eventCount, 0);
            instance.update();
            assert.strictEqual(eventCount, 1);  // make sure event was fired.

            clock.tick(16); // tick 16msec.
            instance.update();
            assert.strictEqual(eventCount, 2);  // make sure event was fired.
        });
    });
});
