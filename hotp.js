"use strict";

var crypto = require('crypto');

var DEFAULT_COUNTER = 0;
var DEFAULT_DIGITS = 6;
var DEFAULT_HASH = "sha1";
var MIN_DIGITS = 6;

/**
 * @constructor
 */
function hotp(config) {
	config = config || {}
	this.key     = config.key;
	this.counter = config.counter;
	this.digits  = config.digits;
	this.hash    = config.hash;
}

Object.defineProperties(hotp.prototype, {
	"key": {
		get: getKey,
		set: setKey,
		enumerable: true
	},
	"counter": {
		get: getCounter,
		set: setCounter,
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
			return getOTP(this);
		}
	},
	"verify": {
		value: function(otp, deltaA, deltaB) {
			return verify(this, otp, deltaA, deltaB);
		}
	},
	"_key": {
		writable: true
	},
	"_counter": {
		value: DEFAULT_COUNTER,
		writable: true
	},
	"_digits": {
		value: DEFAULT_DIGITS,
		writable: true
	},
	"_hash": {
		value: DEFAULT_HASH,
		writable: true
	}
});

function setKey(k) {
	k = k || "";
	this._key = k;
}

function getKey() {
	return this._key;
}

function setCounter(c) {
	c = c || DEFAULT_COUNTER;
	c = Math.round(+c);
	if (c >= 0 && isFinite(c)) {
		this._counter = c;
	}
};

function getCounter() {
	return this._counter;
}

function setDigits(digits) {
	digits = digits || DEFAULT_DIGITS;
	digits = Math.round(+digits);
	if (digits >= MIN_DIGITS && isFinite(digits)) {
		this._digits = digits;
	}
};

function getDigits() {
	return this._digits;
}

function setHash(hash) {
	hash = hash || DEFAULT_HASH;
	if (crypto.getHashes().indexOf(hash)) {
		this._hash = hash;
	}
};

function getHash() {
	return this._hash;
}

function verify(config, otp, deltaA, deltaB) {
	var range = getOTPRange(config, deltaA, deltaB);
	var search = range.indexOf(otp);
	return search !== -1;
}

function getOTP(config) {
	var hmac = crypto.createHmac("sha1", config.key);
	hmac.end(nToInt64BE(config.counter));
	return truncate(hmac.read(), config.digits);
}

function getOTPRange(config, deltaA, deltaB) {
	var range = [];

	if (!isFinite(deltaA)) {
		deltaA = 0;
	}

	if (!isFinite(deltaB)) {
		deltaB = 0;
	}

	var start = config.counter + deltaA;
	var end = config.counter + deltaB;

	if (start > end) {
		var temp = start;
		start = end;
		end = temp;
	}

	for (var i = start; i <= end; i++) {
		range.push(getOTP({
			key: config.key,
			counter: i,
			digits: config.digits
		}));
	}
	return range;
}


function nToInt64BE(n) {
	var a = Math.floor(n / 0x100000000);
	var b = (n % 0x100000000);

	var buf = new Buffer(8)

	buf.writeUInt32BE(a, 0);
	buf.writeUInt32BE(b, 4);
	return buf;
}

function sign(n) {
    // -0 and +0 both treated as positive.
    return +n < 0 ? -1 : 1;
}

// zero-pad integer values. Doesn't support non-integer values.
function pad(n, len) {
    var str = String(Math.abs(+n));
    if (str.length < len) {
        str = new Array(len - str.length + 1).join("0") + str;
    }
    return (sign(n) < 0) ? '-' + str : str;
}

function truncate(hash, digits) {
	var bytes = new Uint8Array(hash);

	// Determine the offset based on the lowest 4 bits in the sequence
	var offset = bytes[bytes.byteLength - 1] & 0x0F;

	// Read 4 bytes befinning from offset, interpret as a 32 bit integer.
	// Sets the most significant bit to 0, to prevent the number from being interpreted as negative
	var snum = (bytes[offset+0] & 0x7F) << 24
	         | (bytes[offset+1] & 0xFF) << 16
	         | (bytes[offset+2] & 0xFF) << 8
	         | (bytes[offset+3] & 0xFF);

	return pad(snum % Math.pow(10, digits), digits);
}

hotp.getOTP = getOTP;
hotp.getOTPRange = getOTPRange;
hotp.verify = verify;

module.exports = hotp;
