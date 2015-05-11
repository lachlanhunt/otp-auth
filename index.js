/**
 * Created by Lachlan Hunt
 * https://github.com/lachlanhunt/xotp
 */

"use strict";

var otp = {
	hotp: require("./hotp"),
	totp: require("./totp")
};

function createOTP(config) {
	config = config || { type: "hotp" };

	if (otp.hasOwnProperty(config.type)) {
		return new otp[config.type](config);
	} else {
		throw new Error("Invalid type specified:  " + config.type);
	}
}

module.exports = {
	Hotp: otp["hotp"],
	Totp: otp["totp"],

	createOTP: createOTP
}
