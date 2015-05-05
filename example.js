var base32 = require("thirty-two");
var otp = require("otp-auth");
var Totp = otp.Totp;
var Hotp = otp.Hotp;

var data = {
	"type": "totp",
	"key": "3E8SNBQMJLDOUIIA",
	"startTime": 0,
	"timeStep": 30,
	"digits": 6,
	"hash":"sha1"
};

var key = new Totp(data);

console.log(JSON.stringify(key));
console.log(key.getOTP());