"use strict";

var hotp = require("./hotp");

var DEFAULT_TIME_STEP = 30;
var DEFAULT_START_TIME = 0;

/**
 * @constructor
 */
function totp(config) {
	config = config || {};
	this.startTime = config.startTime;
	this.timeStep  = config.timeStep;

	this._hotp = new hotp(config)
}

Object.defineProperties(totp.prototype, {
	"key": {
		get: getKey,
		set: setKey,
		enumerable: true
	},
	"startTime": {
		get: getStartTime,
		set: setStartTime,
		enumerable: true
	},
	"timeStep": {
		get: getTimeStep,
		set: setTimeStep,
		enumerable: true
	},
	"counter": {
		get: getCounter,
		enumerable: true
	},
	"digits": {
		get: getDigits,
		set: setDigits,
		enumerable: true
	},
	"hash": {
		get: getHash,
		set: setHash,
		enumerable: true
	},
	"getOTP": {
		value: function() {
			return totp.getOTP(this);
		}
	},
	"getOTPRange": {
		value: function(deltaA, deltaB) {
			return totp.getOTPRange(this, deltaA, deltaB);
		}
	},
	"verify": {
		value: function(otp, deltaA, deltaB) {
			return totp.verify(this, otp, deltaA, deltaB);
		}
	},
	"_startTime": {
		value: DEFAULT_START_TIME,
		writable: true
	},
	"_timeStep": {
		value: DEFAULT_TIME_STEP,
		writable: true
	},
	"_hotp": {
		writable: true
	}
});

function setKey(k) {
	this._hotp.key = k;
}

function getKey() {
	return this._hotp.key;
}


function setStartTime(t0) {
	t0 = t0 || DEFAULT_START_TIME;
	t0 = Math.round(+t0);
	if (t0 >= 0 && isFinite(t0)) {
		this._startTime = t0;
	}
};

function getStartTime() {
	return this._startTime;
}

function setTimeStep(ts) {
	ts = ts || DEFAULT_TIME_STEP;
	ts = Math.round(+ts);
	if (ts >= 0 && isFinite(ts)) {
		this._timeStep = ts;
	}
};

function getTimeStep() {
	return this._timeStep;
}

function getCounter() {
	return timeStepCounter(this.startTime, this.timeStep);
}

function setDigits(digits) {
	this._hotp.digits = digits;
}

function getDigits() {
	return this._hotp.digits;
}

function setHash(hash) {
	this._hotp.hash = hash;
}

function getHash() {
	return this._hotp.hash;
}

/**
 * Counts the number of intervals of the specified size that have occurred since the specified start time.
 *
 * @param {number} [t0=0] The start time as an integral number of seconds since the Unix epoch.
 *             If the value NaN, Infinity or -Infinity, the default value will be used.
 *             Otherwise, the value will be rounded to the nearest integer.
 *
 * @param {number} [step=30] - The size of the time steps as an integral number of seconds.
 *             If the value NaN, Infinity, -Infinity, 0 or negative, the default value will be used.
 *             Otherwise, the value will be rounded to the nearest integer.
 *
 * @returns {number} - The number of steps of the specified size (step) that have occured since the start time (t0).
 */
function timeStepCounter(t0, step) {
	var unixTime = Math.floor(Date.now() / 1000);
	return Math.floor((unixTime - t0) / step);
}

totp.getOTP = hotp.getOTP;
totp.getOTPRange = hotp.getOTPRange;
totp.verify = hotp.verify;

module.exports = totp;
