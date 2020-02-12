'use strict';


var CtUtils = {
    gethsl: async function (host, tabid) {
        let scheme = parseInt(await getOption("scheme"));
        let sat = await getOption("saturation");
        let lum = await getOption("lightness");
        let tabColors = ['rgb(147, 174, 229)', 'rgb(255, 218, 117)', 'rgb(188, 204, 157)', 'rgb(239, 157, 159)', 'rgb(186, 167, 225)', 'rgb(155, 191, 180)', 'rgb(247, 180, 130)', 'rgb(216, 171, 192)', 'rgb(147, 229, 174)', 'rgb(255, 117, 218)', 'rgb(188, 157, 204)', 'rgb(239, 159, 157)', 'rgb(186, 225, 167)', 'rgb(155, 180, 191)', 'rgb(247, 130, 180)', 'rgb(216, 192, 171)', 'rgb(174, 147, 229)', 'rgb(218, 255, 117)', 'rgb(204, 188, 157)', 'rgb(157, 239, 159)', 'rgb(167, 186, 225)', 'rgb(191, 155, 180)', 'rgb(180, 247, 130)', 'rgb(171, 216, 192)', 'rgb(229, 174, 147)', 'rgb(117, 218, 255)', 'rgb(157, 204, 188)', 'rgb(159, 157, 239)', 'rgb(225, 167, 186)', 'rgb(180, 191, 155)', 'rgb(130, 180, 247)', 'rgb(192, 171, 216)'];
        var color = '';
        if (!tabid) {
            return;
        }
        //console.log('scheme:'+scheme+'Host:'+host);
        switch (scheme) {
            case 0:
                color = tabColors[tabid % tabColors.length];
                break;
            case 1:
                break;
            case 2:
                color = 'hsl(' + Math.abs(await this.clrHash(host)) % 360 + ',' + sat + '%,' + lum + '%)';
                //console.log('generated color for host' + host);
                //console.log('generated color for host' + host + ":"+ color);
                break;
        }
        color = await this.anytorgb(color);
        color = await this.rgbtohsl(color.r, color.g, color.b);
        //console.log('Scheme: ' + scheme + ' Host: ' + host + ' Color: ' + color + ' Mod: ' + (ColorfulTabs.counter % tabColors.length) + ' Counter: ' + ColorfulTabs.counter);
        return color;
    },
    generateImage: async function (color) {
        var ctCanvas = document.createElement('canvas');
        ctCanvas.id = 'ctCanvas';
        ctCanvas.width = 9999;
        ctCanvas.height = 55;


        var ctx = ctCanvas.getContext("2d");
        console.log('generateImage');
        
        var lingrad = ctx.createLinearGradient(0, 0, 0, ctCanvas.height);
        //lingrad.addColorStop(0, 'red');
        //lingrad.addColorStop(1, 'black');
        lingrad.addColorStop(0, 'hsla(' + color.h + ',' + color.s + '%,' + color.l + '%,1)');
        lingrad.addColorStop(1, 'hsla(' + color.h + ',' + color.s + '%,' + color.l + '%,0)');
        //console.dir(lingrad);

        ctx.fillStyle = lingrad;
        //ctx.fillStyle = 'hsl(' + color.h + ',' + color.s + '%,' + color.l + '%)';
        //ctx.fillStyle = 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
        ctx.fillRect(0, 0, ctCanvas.width , ctCanvas.height );
        var myImage = ctCanvas.toDataURL("image/png");
        return myImage;
    },
    clrHash: async function (clrString) {
        //console.log('received host:'+ clrString);
        var hash = await this.sha256(clrString);
        var iClr, clrConst = 5381;
        for (iClr = 0; iClr < hash.length; iClr++) {
            clrConst = ((clrConst << 5) + clrConst) + hash.charCodeAt(iClr);
        }
        return clrConst;
    },
    rgbtohsl: async function (r, g, b) {
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;
        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        h = Math.floor(h * 360)
        while (h > 360) {
            h = h - 360;
        }
        s = Math.floor(s * 100);
        l = Math.floor(l * 100);
        return { 'h': h, 's': s, 'l': l };
    },
    anytorgb: async function (clr) {
        //console.log('received:' + clr);
        clr = clr.toString();
        clr = clr.replace(/^\s+|\s+$/, ''); //trim
        if (clr.indexOf('rgb') >= 0 && clr.indexOf('rgba') < 0) {
            clr = clr.replace('rgb', '');
            clr = clr.replace('(', '')
            clr = clr.replace(')', '')
        } else {
            if (clr.indexOf('hsl') >= 0 && clr.indexOf('hsla') < 0) {
                clr = clr.replace('hsl', '');
                clr = clr.replace('%', '')
                clr = clr.replace('%', '')
                clr = clr.replace('(', '')
                clr = clr.replace(')', '') 
                clr = clr.split(',');
                clr = await this.hsl2rgb(clr[0],clr[1],clr[2]);
            } else {
                if (clr.indexOf('#') >= 0) {
                    clr = clr.replace('#', '');
                    var r = parseInt(clr.substring(0, 2), 16);
                    var g = parseInt(clr.substring(2, 4), 16)
                    var b = parseInt(clr.substring(4, 6), 16);
                    if (clr.length == 3) {
                        r = clr.substring(0, 1) + '' + clr.substring(0, 1)
                        g = clr.substring(1, 2) + '' + clr.substring(1, 2)
                        b = clr.substring(2, 3) + '' + clr.substring(2, 3)
                        r = parseInt(r, 16);
                        g = parseInt(g, 16)
                        b = parseInt(b, 16);
                        r
                    }
                    clr = r + "," + g + "," + b;
                } else {
                    try {
                        var clrKeys = {
                            aliceblue: "rgb(240,248,255)",
                            antiquewhite: "rgb(250,235,215)",
                            aqua: "rgb(0,255,255)",
                            aquamarine: "rgb(127,255,212)",
                            azure: "rgb(240,255,255)",
                            beige: "rgb(245,245,220)",
                            bisque: "rgb(255,228,196)",
                            black: "rgb(0,0,0)",
                            blanchedalmond: "rgb(255,235,205)",
                            blue: "rgb(0,0,255)",
                            blueviolet: "rgb(138,43,226)",
                            brown: "rgb(165,42,42)",
                            burlywood: "rgb(222,184,135)",
                            cadetblue: "rgb(95,158,160)",
                            chartreuse: "rgb(127,255,0)",
                            chocolate: "rgb(210,105,30)",
                            coral: "rgb(255,127,80)",
                            cornflowerblue: "rgb(100,149,237)",
                            cornsilk: "rgb(255,248,220)",
                            crimson: "rgb(220,20,60)",
                            cyan: "rgb(0,255,255)",
                            darkblue: "rgb(0,0,139)",
                            darkcyan: "rgb(0,139,139)",
                            darkgoldenrod: "rgb(184,134,11)",
                            darkgray: "rgb(169,169,169)",
                            darkgreen: "rgb(0,100,0)",
                            darkgrey: "rgb(169,169,169)",
                            darkkhaki: "rgb(189,183,107)",
                            darkmagenta: "rgb(139,0,139)",
                            darkolivegreen: "rgb(85,107,47)",
                            darkorange: "rgb(255,140,0)",
                            darkorchid: "rgb(153,50,204)",
                            darkred: "rgb(139,0,0)",
                            darksalmon: "rgb(233,150,122)",
                            darkseagreen: "rgb(143,188,143)",
                            darkslateblue: "rgb(72,61,139)",
                            darkslategray: "rgb(47,79,79)",
                            darkslategrey: "rgb(47,79,79)",
                            darkturquoise: "rgb(0,206,209)",
                            darkviolet: "rgb(148,0,211)",
                            deeppink: "rgb(255,20,147)",
                            deepskyblue: "rgb(0,191,255)",
                            dimgray: "rgb(105,105,105)",
                            dimgrey: "rgb(105,105,105)",
                            dodgerblue: "rgb(30,144,255)",
                            firebrick: "rgb(178,34,34)",
                            floralwhite: "rgb(255,250,240)",
                            forestgreen: "rgb(34,139,34)",
                            fuchsia: "rgb(255,0,255)",
                            gainsboro: "rgb(220,220,220)",
                            ghostwhite: "rgb(248,248,255)",
                            gold: "rgb(255,215,0)",
                            goldenrod: "rgb(218,165,32)",
                            gray: "rgb(128,128,128)",
                            green: "rgb(0,128,0)",
                            greenyellow: "rgb(173,255,47)",
                            grey: "rgb(128,128,128)",
                            honeydew: "rgb(240,255,240)",
                            hotpink: "rgb(255,105,180)",
                            indianred: "rgb(205,92,92)",
                            indigo: "rgb(75,0,130)",
                            ivory: "rgb(255,255,240)",
                            khaki: "rgb(240,230,140)",
                            lavender: "rgb(230,230,250)",
                            lavenderblush: "rgb(255,240,245)",
                            lawngreen: "rgb(124,252,0)",
                            lemonchiffon: "rgb(255,250,205)",
                            lightblue: "rgb(173,216,230)",
                            lightcoral: "rgb(240,128,128)",
                            lightcyan: "rgb(224,255,255)",
                            lightgoldenrodyellow: "rgb(250,250,210)",
                            lightgray: "rgb(211,211,211)",
                            lightgreen: "rgb(144,238,144)",
                            lightgrey: "rgb(211,211,211)",
                            lightpink: "rgb(255,182,193)",
                            lightsalmon: "rgb(255,160,122)",
                            lightseagreen: "rgb(32,178,170)",
                            lightskyblue: "rgb(135,206,250)",
                            lightslategray: "rgb(119,136,153)",
                            lightslategrey: "rgb(119,136,153)",
                            lightsteelblue: "rgb(176,196,222)",
                            lightyellow: "rgb(255,255,224)",
                            lime: "rgb(0,255,0)",
                            limegreen: "rgb(50,205,50)",
                            linen: "rgb(250,240,230)",
                            magenta: "rgb(255,0,255)",
                            maroon: "rgb(128,0,0)",
                            mediumaquamarine: "rgb(102,205,170)",
                            mediumblue: "rgb(0,0,205)",
                            mediumorchid: "rgb(186,85,211)",
                            mediumpurple: "rgb(147,112,219)",
                            mediumseagreen: "rgb(60,179,113)",
                            mediumslateblue: "rgb(123,104,238)",
                            mediumspringgreen: "rgb(0,250,154)",
                            mediumturquoise: "rgb(72,209,204)",
                            mediumvioletred: "rgb(199,21,133)",
                            midnightblue: "rgb(25,25,112)",
                            mintcream: "rgb(245,255,250)",
                            mistyrose: "rgb(255,228,225)",
                            moccasin: "rgb(255,228,181)",
                            navajowhite: "rgb(255,222,173)",
                            navy: "rgb(0,0,128)",
                            oldlace: "rgb(253,245,230)",
                            olive: "rgb(128,128,0)",
                            olivedrab: "rgb(107,142,35)",
                            orange: "rgb(255,165,0)",
                            orangered: "rgb(255,69,0)",
                            orchid: "rgb(218,112,214)",
                            palegoldenrod: "rgb(238,232,170)",
                            palegreen: "rgb(152,251,152)",
                            paleturquoise: "rgb(175,238,238)",
                            palevioletred: "rgb(219,112,147)",
                            papayawhip: "rgb(255,239,213)",
                            peachpuff: "rgb(255,218,185)",
                            peru: "rgb(205,133,63)",
                            pink: "rgb(255,192,203)",
                            plum: "rgb(221,160,221)",
                            powderblue: "rgb(176,224,230)",
                            purple: "rgb(128,0,128)",
                            red: "rgb(255,0,0)",
                            rosybrown: "rgb(188,143,143)",
                            royalblue: "rgb(65,105,225)",
                            saddlebrown: "rgb(139,69,19)",
                            salmon: "rgb(250,128,114)",
                            sandybrown: "rgb(244,164,96)",
                            seagreen: "rgb(46,139,87)",
                            seashell: "rgb(255,245,238)",
                            sienna: "rgb(160,82,45)",
                            silver: "rgb(192,192,192)",
                            skyblue: "rgb(135,206,235)",
                            slateblue: "rgb(106,90,205)",
                            slategray: "rgb(112,128,144)",
                            slategrey: "rgb(112,128,144)",
                            snow: "rgb(255,250,250)",
                            springgreen: "rgb(0,255,127)",
                            steelblue: "rgb(70,130,180)",
                            tan: "rgb(210,180,140)",
                            teal: "rgb(0,128,128)",
                            thistle: "rgb(216,191,216)",
                            tomato: "rgb(255,99,71)",
                            turquoise: "rgb(64,224,208)",
                            violet: "rgb(238,130,238)",
                            wheat: "rgb(245,222,179)",
                            white: "rgb(255,255,255)",
                            whitesmoke: "rgb(245,245,245)",
                            yellow: "rgb(255,255,0)",
                            yellowgreen: "rgb(154,205,50)"
                        }
                        clr = clrKeys[clr];
                        clr = clr.replace('rgb', '');
                        clr = clr.replace('(', '')
                        clr = clr.replace(')', '')
                    } catch (e) {
                        console.log("anytorgb Could not convert color to rgb because of the following error:\n" + e)
                    }
                }
            }
        }

        //console.dir(clr);
        clr = clr.split(',');
        clr = clr.map(x => parseInt(x.trim()));
        return { 'r': clr[0], 'g': clr[1], 'b': clr[2] };

        // = await clr.split(',');

    },
    hsl2rgb: async function (h, s, l) {
        //console.log('h:' + h)
        //console.log('s:' + s)
        //console.log('l:' + l)

        var m1, m2, hue;
        var r, g, b
        s /= 100;
        l /= 100;
        if (s == 0)
            r = g = b = (l * 255);
        else {
            if (l <= 0.5)
                m2 = l * (s + 1);
            else
                m2 = l + s - l * s;
            m1 = l * 2 - m2;
            hue = h / 360;
            r = await this.HueToRgb(m1, m2, hue + 1 / 3);
            g = await this.HueToRgb(m1, m2, hue);
            b = await this.HueToRgb(m1, m2, hue - 1 / 3);
        }

        //console.log('r:'+r)
        //console.log('g:'+g)
        //console.log('b:'+b)
        return Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b); //255,255,255
    },
    HueToRgb: async function (m1, m2, hue) {
        var v;
        if (hue < 0)
            hue += 1;
        else if (hue > 1)
            hue -= 1;
        if (6 * hue < 1)
            v = m1 + (m2 - m1) * hue * 6;
        else if (2 * hue < 1)
            v = m2;
        else if (3 * hue < 2)
            v = m1 + (m2 - m1) * (2 / 3 - hue) * 6;
        else
            v = m1;
        return 255 * v;
    },
    sha256: async function (s) {
        var chrsz = 8;
        var hexcase = 0;

        function safe_add(x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF);
            var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        }

        function S(X, n) {
            return (X >>> n) | (X << (32 - n));
        }

        function R(X, n) {
            return (X >>> n);
        }

        function Ch(x, y, z) {
            return ((x & y) ^ ((~x) & z));
        }

        function Maj(x, y, z) {
            return ((x & y) ^ (x & z) ^ (y & z));
        }

        function Sigma0256(x) {
            return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
        }

        function Sigma1256(x) {
            return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
        }

        function Gamma0256(x) {
            return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
        }

        function Gamma1256(x) {
            return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
        }

        function core_sha256(m, l) {
            var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);
            var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
            var W = new Array(64);
            var a, b, c, d, e, f, g, h, i, j;
            var T1, T2;
            m[l >> 5] |= 0x80 << (24 - l % 32);
            m[((l + 64 >> 9) << 4) + 15] = l;
            for (var i = 0; i < m.length; i += 16) {
                a = HASH[0];
                b = HASH[1];
                c = HASH[2];
                d = HASH[3];
                e = HASH[4];
                f = HASH[5];
                g = HASH[6];
                h = HASH[7];
                for (var j = 0; j < 64; j++) {
                    if (j < 16) W[j] = m[j + i];
                    else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
                    T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
                    T2 = safe_add(Sigma0256(a), Maj(a, b, c));
                    h = g;
                    g = f;
                    f = e;
                    e = safe_add(d, T1);
                    d = c;
                    c = b;
                    b = a;
                    a = safe_add(T1, T2);
                }
                HASH[0] = safe_add(a, HASH[0]);
                HASH[1] = safe_add(b, HASH[1]);
                HASH[2] = safe_add(c, HASH[2]);
                HASH[3] = safe_add(d, HASH[3]);
                HASH[4] = safe_add(e, HASH[4]);
                HASH[5] = safe_add(f, HASH[5]);
                HASH[6] = safe_add(g, HASH[6]);
                HASH[7] = safe_add(h, HASH[7]);
            }
            return HASH;
        }

        function str2binb(str) {
            var bin = Array();
            var mask = (1 << chrsz) - 1;
            for (var i = 0; i < str.length * chrsz; i += chrsz) {
                bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32);
            }
            return bin;
        }

        function Utf8Encode(string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        }

        function binb2hex(binarray) {
            var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
            var str = "";
            for (var i = 0; i < binarray.length * 4; i++) {
                str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
                    hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
            }
            return str;
        }
        s = Utf8Encode(s);
        return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
    }
}

var defaults = {
    overridetheme: 'yes',
    scheme: 2,
    saturation: 61,
    lightness: 73,
    accentcolor: "#fff",
    textcolor: "#000",
    toolbar_text: "#000",
    toolbar_field: "#fff",
    toolbar_field_text: "#000",
};

async function setOption(setting, value) {
    browser.storage.local.set({
        ["options." + setting]: value
    });
}

async function resetOptions(e) {

    e.preventDefault();
    let form = document.querySelector("form");

    let settings = Object.keys(defaults);

    for (var setting of settings) {
        await setOption(setting, defaults[setting]);
    }
    await renderOptionsForm();
}

// Saves all options on submit
async function saveOptions(e) {
    e.preventDefault();
    let form = document.querySelector("form");
    let settings = Object.keys(defaults);
    for (var setting of settings) {
        await setOption(setting, form[setting].value);
    }
    alert('Browser restart required!');
}

async function getOption(setting) {

    try {
        const found = await browser.storage.local.get("options." + setting);
        if (found.hasOwnProperty("options." + setting)) {
            return found["options." + setting];
        } else {
            return defaults[setting];
        }
    } catch (err) {
        console.log("setting name: " + setting + '\tsaved value: ' + defaults[setting]);
        return defaults[setting];
    }
}

async function renderOptionsForm() {
    if (!document.querySelector("#ColorfulTabsOptions")) {
        return;
    }
    try {
        document.querySelector("#overridetheme").value = await getOption("overridetheme");
        document.querySelector("#scheme").value = await getOption("scheme");
        document.querySelector("#saturation").value = await getOption("saturation");
        document.querySelector("#lightness").value = await getOption("lightness");
        document.querySelector("#accentcolor").value = await getOption("accentcolor");
        document.querySelector("#textcolor").value = await getOption("textcolor");
        document.querySelector("#toolbar_text").value = await getOption("toolbar_text");
        document.querySelector("#toolbar_field").value = await getOption("toolbar_field");
        document.querySelector("#toolbar_field_text").value = await getOption("toolbar_field_text");
        overridetheme = await getOption("overridetheme");
        if (overridetheme) {
            document.querySelector("#overridetheme").checked = true;
        } else {
        }
    } catch (e) {
        console.log(e);
    }
}

document.addEventListener("DOMContentLoaded", renderOptionsForm);
try {
    document.querySelector("form").addEventListener("submit", saveOptions);
    document.querySelector("form").addEventListener("reset", resetOptions);
} catch (e) { }