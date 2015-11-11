/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


var Sha1 = {};  // Sha1 namespace

/**
             * Generates SHA-1 hash of string
             *
             * @param {String} msg                String to be hashed
             * @param {Boolean} [utf8encode=true] Encode msg as UTF-8 before generating hash
             * @returns {String}                  Hash of msg as hex character string
             */
Sha1.hash = function(msg, utf8encode) {
    utf8encode =  (typeof utf8encode == 'undefined') ? true : utf8encode;
  
    // convert string to UTF-8, as SHA only deals with byte-streams
    if (utf8encode) msg = Utf8.encode(msg);
  
    // constants [§4.2.1]
    var K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
  
    // PREPROCESSING 
  
    msg += String.fromCharCode(0x80);  // add trailing '1' bit (+ 0's padding) to string [§5.1.1]
  
    // convert string msg into 512-bit/16-integer blocks arrays of ints [§5.2.1]
    var l = msg.length/4 + 2;  // length (in 32-bit integers) of msg + ‘1’ + appended length
    var N = Math.ceil(l/16);   // number of 16-integer-blocks required to hold 'l' ints
    var M = new Array(N);
  
    for (var i=0; i<N; i++) {
        M[i] = new Array(16);
        for (var j=0; j<16; j++) {  // encode 4 chars per integer, big-endian encoding
            M[i][j] = (msg.charCodeAt(i*64+j*4)<<24) | (msg.charCodeAt(i*64+j*4+1)<<16) | 
            (msg.charCodeAt(i*64+j*4+2)<<8) | (msg.charCodeAt(i*64+j*4+3));
        } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
    }
    // add length (in bits) into final pair of 32-bit integers (big-endian) [§5.1.1]
    // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
    // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
    M[N-1][14] = ((msg.length-1)*8) / Math.pow(2, 32);
    M[N-1][14] = Math.floor(M[N-1][14])
    M[N-1][15] = ((msg.length-1)*8) & 0xffffffff;
  
    // set initial hash value [§5.3.1]
    var H0 = 0x67452301;
    var H1 = 0xefcdab89;
    var H2 = 0x98badcfe;
    var H3 = 0x10325476;
    var H4 = 0xc3d2e1f0;
  
    // HASH COMPUTATION [§6.1.2]
  
    var W = new Array(80);
    var a, b, c, d, e;
    for (var i=0; i<N; i++) {
  
        // 1 - prepare message schedule 'W'
        for (var t=0;  t<16; t++) W[t] = M[i][t];
        for (var t=16; t<80; t++) W[t] = Sha1.ROTL(W[t-3] ^ W[t-8] ^ W[t-14] ^ W[t-16], 1);
    
        // 2 - initialise five working variables a, b, c, d, e with previous hash value
        a = H0;
        b = H1;
        c = H2;
        d = H3;
        e = H4;
    
        // 3 - main loop
        for (var t=0; t<80; t++) {
            var s = Math.floor(t/20); // seq for blocks of 'f' functions and 'K' constants
            var T = (Sha1.ROTL(a,5) + Sha1.f(s,b,c,d) + e + K[s] + W[t]) & 0xffffffff;
            e = d;
            d = c;
            c = Sha1.ROTL(b, 30);
            b = a;
            a = T;
        }
    
        // 4 - compute the new intermediate hash value
        H0 = (H0+a) & 0xffffffff;  // note 'addition modulo 2^32'
        H1 = (H1+b) & 0xffffffff; 
        H2 = (H2+c) & 0xffffffff; 
        H3 = (H3+d) & 0xffffffff; 
        H4 = (H4+e) & 0xffffffff;
    }
    return Sha1.toHexStr(H0) + Sha1.toHexStr(H1) + 
    Sha1.toHexStr(H2) + Sha1.toHexStr(H3) + Sha1.toHexStr(H4);
}

//
// function 'f' [§4.1.1]
//
Sha1.f = function(s, x, y, z)  {
    switch (s) {
        case 0:
            return (x & y) ^ (~x & z);           // Ch()
        case 1:
            return x ^ y ^ z;                    // Parity()
        case 2:
            return (x & y) ^ (x & z) ^ (y & z);  // Maj()
        case 3:
            return x ^ y ^ z;                    // Parity()
    }
}

//
// rotate left (circular left shift) value x by n positions [§3.2.5]
//
Sha1.ROTL = function(x, n) {
    return (x<<n) | (x>>>(32-n));
}

//
// hexadecimal representation of a number 
//   (note toString(16) is implementation-dependant, and  
//   in IE returns signed numbers when used on full words)
//
Sha1.toHexStr = function(n) {
    var s="", v;
    for (var i=7; i>=0; i--) {
        v = (n>>>(i*4)) & 0xf;
        s += v.toString(16);
    }
    return s;
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Utf8 class: encode / decode between multi-byte Unicode characters and UTF-8 multiple          */
/*              single-byte character encoding (c) Chris Veness 2002-2010                         */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

var Utf8 = {};  // Utf8 namespace

/**
             * Encode multi-byte Unicode string into utf-8 multiple single-byte characters 
             * (BMP / basic multilingual plane only)
             *
             * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3 chars
             *
             * @param {String} strUni Unicode string to be encoded as UTF-8
             * @returns {String} encoded string
             */
Utf8.encode = function(strUni) {
    // use regular expressions & String.replace callback function for better efficiency 
    // than procedural approaches
    var strUtf = strUni.replace(
        /[\u0080-\u07ff]/g,  // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
        function(c) { 
            var cc = c.charCodeAt(0);
            return String.fromCharCode(0xc0 | cc>>6, 0x80 | cc&0x3f);
        }
        );
    strUtf = strUtf.replace(
        /[\u0800-\uffff]/g,  // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
        function(c) { 
            var cc = c.charCodeAt(0); 
            return String.fromCharCode(0xe0 | cc>>12, 0x80 | cc>>6&0x3F, 0x80 | cc&0x3f);
        }
        );
    return strUtf;
}

/**
             * Decode utf-8 encoded string back into multi-byte Unicode characters
             *
             * @param {String} strUtf UTF-8 string to be decoded back to Unicode
             * @returns {String} decoded string
             */
Utf8.decode = function(strUtf) {
    // note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
    var strUni = strUtf.replace(
        /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,  // 3-byte chars
        function(c) {  // (note parentheses for precence)
            var cc = ((c.charCodeAt(0)&0x0f)<<12) | ((c.charCodeAt(1)&0x3f)<<6) | ( c.charCodeAt(2)&0x3f); 
            return String.fromCharCode(cc);
        }
        );
    strUni = strUni.replace(
        /[\u00c0-\u00df][\u0080-\u00bf]/g,                 // 2-byte chars
        function(c) {  // (note parentheses for precence)
            var cc = (c.charCodeAt(0)&0x1f)<<6 | c.charCodeAt(1)&0x3f;
            return String.fromCharCode(cc);
        }
        );
    return strUni;
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
 
  
var Base64 = (function() {
    "use strict";

    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    var _utf8_encode = function (string) {

        var utftext = "", c, n;

        string = string.replace(/\r\n/g,"\n");

        for (n = 0; n < string.length; n++) {

            c = string.charCodeAt(n);

            if (c < 128) {

                utftext += String.fromCharCode(c);

            } else if((c > 127) && (c < 2048)) {

                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);

            } else {

                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);

            }

        }

        return utftext;
    };

    var _utf8_decode = function (utftext) {
        var string = "", i = 0, c = 0, c1 = 0, c2 = 0;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {

                string += String.fromCharCode(c);
                i++;

            } else if((c > 191) && (c < 224)) {

                c1 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c1 & 63));
                i += 2;

            } else {

                c1 = utftext.charCodeAt(i+1);
                c2 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c1 & 63) << 6) | (c2 & 63));
                i += 3;

            }

        }

        return string;
    };

    var _hexEncode = function(input) {
        var output = '', i;

        for(i = 0; i < input.length; i++) {
            output += input.charCodeAt(i).toString(16);
        }

        return output;
    };

    var _hexDecode = function(input) {
        var output = '', i;

        if(input.length % 2 > 0) {
            input = '0' + input;
        }

        for(i = 0; i < input.length; i = i + 2) {
            output += String.fromCharCode(parseInt(input.charAt(i) + input.charAt(i + 1), 16));
        }

        return output;
    };

    var encode = function (input) {
        var output = "", chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;

        input = _utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output += _keyStr.charAt(enc1);
            output += _keyStr.charAt(enc2);
            output += _keyStr.charAt(enc3);
            output += _keyStr.charAt(enc4);

        }

        return output;
    };

    var decode = function (input) {
        var output = "", chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = _keyStr.indexOf(input.charAt(i++));
            enc2 = _keyStr.indexOf(input.charAt(i++));
            enc3 = _keyStr.indexOf(input.charAt(i++));
            enc4 = _keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output += String.fromCharCode(chr1);

            if (enc3 !== 64) {
                output += String.fromCharCode(chr2);
            }
            if (enc4 !== 64) {
                output += String.fromCharCode(chr3);
            }

        }

        return _utf8_decode(output);
    };

    var decodeToHex = function(input) {
        return _hexEncode(decode(input));
    };

    var encodeFromHex = function(input) {
        return window.btoa(_hexDecode(input));
    };

    return {
        'encode': encode,
        'decode': decode,
        'decodeToHex': decodeToHex,
        'encodeFromHex': encodeFromHex
    };
}());
 
function getHash(){ 
    var appKey = '1111';
    var date = new Date();
    // date2.setDate(date2.getDate()+6);
    console.log("Month:"+date.getUTCMonth()+"     Date:"+date.getUTCDate());
    
    var mon = parseInt(date.getUTCMonth(),10)+1;
    var day = parseInt(date.getUTCDate(),10);
    console.log("Mon:"+mon+"     Date:"+day);
    var year = date.getUTCFullYear();
    if(day<10)
        day = '0'+day;
    if(mon<10)
        mon = '0'+mon;


    var hours = date.getUTCHours()
    var minutes = date.getUTCMinutes()

    if (minutes < 10)
        minutes = "0" + minutes

    //var currentTime = Date.now() + new Date().getTimezoneOffset() * 60 * 1000;
    //alert(year+'-'+mon+'-'+day );
    
    //  var d = new Date();
    //  alert(d.getUTCDate());
    console.log(appKey+year+mon+day+'  '+hours+':'+minutes);
    var hashcode = Sha1.hash(appKey+year+mon+day);
    var returnVal = Base64.encodeFromHex(hashcode);//encodeURIComponent(Base64.encodeFromHex(hashcode));
    //   alert(returnVal);
    return returnVal;
//   alert(hashcode);
//   alert(encodeURIComponent(Base64.encodeFromHex(hashcode)));
}