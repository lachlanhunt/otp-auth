var base32 = require("thirty-two");
var otp = require("otp-auth");

var config = {
	"type": "totp",
	"key": "3E8SNBQMJLDOUIIA",
	"startTime": 0,
	"timeStep": 30,
	"digits": 6,
	"hash":"sha1"
};

var key = otp.createOTP(config);

console.log(JSON.stringify(key));
console.log(key.getOTP());
