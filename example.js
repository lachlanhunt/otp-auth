var otp = require("otp-auth");

var config = {
	"type": "totp",
	"key": "W7KOWU3OVURLXFNMZONBGTWQHIC2S4SR",
	"digits": 6,
	"hash":"sha1",
	"startTime": 0,
	"timeStep": 30
};

var key = otp.createOTP(config);

console.log(JSON.stringify(key));
console.log(key.getOTP());
