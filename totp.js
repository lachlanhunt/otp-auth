"use strict";

var hotp = require("./hotp");

var DEFAULT_TIME_STEP = 30;
var DEFAULT_START_TIME = 0;

/**
 * @constructor
 */
function Totp(config) {
	Object.defineProperties(this, {
		"_key": {
			writable: true,
			enumerable: false
		},
		"_counter": {
			writable: true,
			enumerable: false
		},
		"_digits": {
			writable: true,
			enumerable: false
		},
		"_hash": {
			writable: true,
			enumerable: false
		},
		"_startTime": {
			value: DEFAULT_START_TIME,
			writable: true,
			enumerable: false
		},
		"_timeStep": {
			value: DEFAULT_TIME_STEP,
			writable: true,
			enumerable: false
		}
	});

	config = config || {};
	this.key       = config.key;
	this.startTime = config.startTime;
	this.timeStep  = config.timeStep;
	this.digits    = config.digits;
	this.hash      = config.hash;
}

Totp.prototype = new hotp();

Object.defineProperties(Totp.prototype, {
	"type": {
		value: "totp"
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
	"getOTP": {
		value: function() {
			return Totp.getOTP(this);
		}
	},
	"verify": {
		value: function(otp, deltaA, deltaB) {
			return Totp.verify(this, otp, deltaA, deltaB);
		}
	},
	"toJSON": {
		value: function() {
			return toJSON(this);
		}
	}
});

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

function getOTP(config) {
	if (!(config instanceof Totp)) {
		return new Totp(config).getOTP()
	}
	return hotp.getOTP.call(this, config);
}

function toJSON(config) {
	if (!(config instanceof Totp)) {
		return new Totp(config).toJSON();
	}

	return {
		"type": config.type,
		"key": config.key,
		"startTime": config.startTime,
		"timeStep": config.timeStep,
		"digits": config.digits,
		"hash": config.hash
	};
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

Totp.getOTP = getOTP;
Totp.verify = hotp.verify;

module.exports = Totp;
