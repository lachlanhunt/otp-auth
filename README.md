xotp - One Time Password Authentication
====

This is an ECMAScript implementation of HMAC-Based and Time-Based One Time Password algorithms, as defined in RFC 4226 (HOTP) and RFC 6238 (TOTP).

##Features

Like notp, this is able to generate and verify common one time codes that are compatible with popular implementations like Google Authenticator and Authy.  However, this implementation provides much more options and flexibility in accordance with the specificiations.

The following features are available:

* Choice of HMAC algorithm. The TOTP specification allows HMAC-SHA-1, HMAC-SHA-256 and HMAC-SHA-512. This implementation supports all of those. The default is SHA-1.
* Configurable epoch for TOTP. The default is the unix epoch.
* Configurable number of digits in the resulting token. The default is 6.
* Configurable time step for TOTP. The default is 30 seconds.
* Generate multiple tokens within a configurable range of counter values.

##API

###otp.createOTP(config)

Create a new OTP object using the specified configuration.

The supported types are `"hotp"` and `"totp"`.

Returns a new Hotp or Totp object.

Throws an error if an unsupported `type` is specified in config.

####parameters:

`config`: Optional. Object with the following properties:

* `type` (String): Required. "hotp" creates a counter-based OTP, "totp" creates a time-based OTP. 
* `key` (String or Buffer): Optional, but recommended. The key used to create the HMAC. If the value is a String, it value must be a Base32 encoded representation of the key. The default key is a 0 length Buffer. For compliance with RFC 4226, you should provide a key at least 128 bits; 160 bits is recommended. 
* `digits` (Number): Optional. The number of digits to include in the generated token. The default is 6. 
* `hash` (String): The hash algorithm to use. RFC 6238 allows conformant implementations to use "sha1", "sha256" or "sha512". This implementation will work with those, or any algorithm supported by NodeJS crypto.createHmac. Do not use any algorithm that results in a hash of less than 160 bits.

When the type is "hotp", this additional property may also be included:

* `counter` (Number): Optional. The counter value used to generate the token.

When the type is "totp", these additional options may also be included:

* `startTime` (Number). Optional. Used for TOTP only. The number of seconds relative to the Unix Epoch (1970-01-01T00:00:00Z) from which to calculate the current value of the counter for TOTP. This is ignored for HOTP. The value should be an integer. Non-integer values will be rounded to the nearest integer. If the value is not finite, the default value will be used. The default is 0. 
* `timeStep` (Number): Optional. The number of seconds within each time step used to calculate the current value of the counter for TOTP. This is ignored for HOTP. The default is 30. 

If the `config` parameter is not specified, the default config is equivalent to `{ type: "hotp" }`, with all other property values as their defaults.

####Examples

Example 1: Create a time-based OTP using a 160-bit, base 32 encoded key. The values for digits, hash, startTime and timeStep are equal to the default values, but are included for illustrative purposes. They may be omitted.

    otp.createOTP({
        "type": "totp",
        "key": "W7KOWU3OVURLXFNMZONBGTWQHIC2S4SR",
        "digits": 6,
        "hash":"sha1",
        "startTime": 0,
        "timeStep": 30
    });

Example 2: Create a counter-based OTP with the counter set to 10. The key is randomly generated, 128 bits (16 octets).

    var crypto = require("crypto");

    otp.createOTP({
        "type": "hotp",
        "key": crypto.randomBytes(16),
        "digits": 8,
        "hash":"sha256",
        "counter": 10
    });

###otp.Hotp(config)

Constructor function for creating Hotp instances.

####Parameters

`config`: Optional. Object with the same properties as for `createOTP`, except that `type`, `startTime` and `timeStep` are ignored.

###otp.Hotp.getOTP(config)

Static method that will generate an HOTP token based on the provided config. The `config` parameter is the same as the Hotp constructor.

Returns the generated token as a String.

###otp.Hotp.getOTPRange(config, deltaA, deltaB)

Static method that will generate an HOTP token based on the provided config. The `config` parameter is the same as the Hotp constructor.

Returns an Array of generated tokens as Strings.

####Parameters

`config` (Object): Optional. Same requirements and default value as the Hotp constructor.  
`deltaA` (Number): Optional. Integer number of seconds relative to the counter specified in the config to use as the beginning of the range.  Non-integer values will be rounded to the nearest integer. If the value is not finite, the default value will be used. The default is 0.  
`deltaB` (Number): Optional. Integer number of seconds relative to the counter specified in the config to use as the end of the range (inclusive). Non-integer values will be rounded to the nearest integer. If the value is not finite, the default value will be used. The default is 0.

If `deltaA` is greater than `deltaB`, then the two values will be swapped so that the range will always ge generated from lowest to highest counter value.


###otp.Totp(config)

Constructor function for creating Totp instances.

####Parameters

`config`: Optional. Object with the same properties as for `createOTP`, except that `type` and `counter` are ignored. 

###otp.Totp.getOTP(config)

Static method that will generate a TOTP token based on the provided config. The `config` parameter is the same as the Totp constructor.

Returns the generated token as a String.

###otp.Hotp.getOTPRange(config, deltaA, deltaB)

Static method that will generate an HOTP token based on the provided config. The `config` parameter is the same as the Hotp constructor.

Returns an Array of generated tokens as Strings.

####Parameters

`config` (Object): Optional. Same requirements and default value as the Totp constructor.  
`deltaA` (Number): Optional. Integer number of seconds relative to the counter specified in the config to use as the beginning of the range.  Non-integer values will be rounded to the nearest integer. If the value is not finite, the default value will be used. The default is 0.  
`deltaB` (Number): Optional. Integer number of seconds relative to the counter specified in the config to use as the end of the range (inclusive). Non-integer values will be rounded to the nearest integer. If the value is not finite, the default value will be used. The default is 0.

If `deltaA` is greater than `deltaB`, then the two values will be swapped so that the range will always ge generated from lowest to highest counter value.
