"use strict";

var crypto = require("crypto");
var base32 = require("thirty-two");

var DEFAULT_COUNTER = 0;
var DEFAULT_DIGITS = 6;
var DEFAULT_HASH = "sha1";
var MIN_DIGITS = 6;

/**
 * @constructor
 */
function Hotp(config) {
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
		}
	});

	config = config || {}
	this.key     = config.key;
	this.counter = config.counter;
	this.digits  = config.digits;
	this.hash    = config.hash;
}

Object.defineProperties(Hotp.prototype, {
	"type": {
		value: "hotp"
	},
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
	"getOTPRange": {
		value: function(deltaA, deltaB) {
			return totp.getOTPRange(this, deltaA, deltaB);
		}
	},
	"verify": {
		value: function(otp, deltaA, deltaB) {
			return verify(this, otp, deltaA, deltaB);
		}
	},
	"toJSON": {
		value: function() {
			return toJSON(this);
		}
	}
});

function setKey(k) {
	k = k || "";
	this._key = (typeof k === "string") ? base32.decode(k) : k
}

function getKey() {
	return this._key;
}

function setCounter(c) {
	c = c || DEFAULT_COUNTER;
	c = Math.round(+c);
	this._counter = (c >= 0 && isFinite(c)) ? c : DEFAULT_COUNTER;
};

function getCounter() {
	return this._counter;
}

function setDigits(digits) {
	digits = digits || DEFAULT_DIGITS;
	digits = Math.round(+digits);
	this._digits = (digits >= MIN_DIGITS && isFinite(digits)) ? digits : DEFAULT_DIGITS;
};

function getDigits() {
	return this._digits;
}

function setHash(hash) {
	hash = hash || DEFAULT_HASH;
	this._hash = (crypto.getHashes().indexOf(hash) !== -1) ? hash : DEFAULT_HASH;
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
	if (!(config instanceof Hotp)) {
		return new Hotp(config).getOTP()
	}

	var hmac = crypto.createHmac(config.hash, config.key);
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

function toJSON(config) {
	if (!(config instanceof Hotp)) {
		return new Hotp(config).toJSON();
	}

	return {
		"type": config.type,
		"key": base32.encode(config.key).toString(),
		"counter": config.counter,
		"digits": config.digits,
		"hash": config.hash
	};
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

Hotp.getOTP = getOTP;
Hotp.getOTPRange = getOTPRange;
Hotp.verify = verify;

module.exports = Hotp;
