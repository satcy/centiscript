(function (Centi) {
    Centi.prototype.bitmapFont = function(size){
        this.bitmapFontSize = size;
	};
    Centi.prototype.bitmapText = function(str, x, y, size){
        if ( this.bitmapFontSize == undefined ) {
            this.bitmapFontSize = 32;
        }
        if ( size != undefined ) {
            this.bitmapFontSize = size;
        }
        size = this.bitmapFontSize;
        var _str = str;
        if ( !(str instanceof String) ) {
            _str = str.toString(10);
        }
        for ( var i=0; i<_str.length; i++ ) {
            var code = _str.charCodeAt(i);
            var hex = this.getBitmapFontCode(code);
            this.bitmap5x8(hex, x, y, size/8);
            x += (size / 8) * 6;
        }
	};
    Centi.prototype.bitmap5x8 = function(bin, x, y, dot_size){
        var bit_max = Math.pow(2,32);
        var bin_32bit_arr = [bin%bit_max, Math.floor(bin/bit_max)];
        var c = 0;
        for ( var i=0; i<5; i++ ) {
            if ( i == 0 ) c = bin_32bit_arr[0];
            if ( i == 4 ) c = bin_32bit_arr[1];
            for ( var j=0; j<8; j++ ) {
                if ( c & 1 ) {
                    this.rect(x+i*dot_size, y+j*dot_size, dot_size, dot_size);
                }
                c = c >> 1;
            }
        }
	};
    Centi.prototype.getBitmapFontCode = function(code) {
        var val = 0;
        if ( code >= 0x20 && code <= 0x7F ) {
            if ( !this.bitmapFontCodes ) {
                this.bitmapFontCodes = _initCodes();
//                for ( var i=this.bitmapFontCodes.length-1; i>=0; i-- ) {
//                    for ( var j=0; j<this.bitmapFontCodes[i].length; j++ ) {
//                        this.bitmapFontCodes[i][j] = parseInt(this.bitmapFontCodes[i][j].toString(10));
//                    }
//                }
            }
            var arr = this.bitmapFontCodes[code - 0x20];
            for ( var i=arr.length-1; i>=0; i-- ) {
                val += arr[i] * Math.pow(2, i*8);
            }
        }
        return val;
        function _initCodes() {
            return [
                [ // 20
                    0b00000000,
                    0b00000000,
                    0b00000000,
                    0b00000000,
                    0b00000000  
                ],
                  [ // 21
                    0b00000000,
                    0b00000000,
                    0b01001111,
                    0b00000000,
                    0b00000000  
                ],
                  [ // 22
                    0b00000000,
                    0b00000111,
                    0b00000000,
                    0b00000111,
                    0b00000000  
                ],
                  [ // 23
                    0b00010100,
                    0b01111111,
                    0b00010100,
                    0b01111111,
                    0b00010100  
                ],
                  [ // 24
                    0b00100100,
                    0b00101010,
                    0b01111111,
                    0b00101010,
                    0b00010010  
                ],
                  [ // 25
                    0b00100011,
                    0b00010011,
                    0b00001000,
                    0b01100100,
                    0b01100010  
                ],
                  [ // 26
                    0b00110110,
                    0b01001001,
                    0b01010101,
                    0b00100010,
                    0b01010000  
                ],
                  [ // 27
                    0b00000000,
                    0b00000101,
                    0b00000011,
                    0b00000000,
                    0b00000000  
                ],
                  [ // 28
                    0b00000000,
                    0b00011100,
                    0b00100010,
                    0b01000001,
                    0b00000000  
                ],
                  [ // 29
                    0b00000000,
                    0b01000001,
                    0b00100010,
                    0b00011100,
                    0b00000000  
                ],
                  [ // 2A
                    0b00010100,
                    0b00001000,
                    0b00111110,
                    0b00001000,
                    0b00010100  
                ],
                  [ // 2B
                    0b00001000,
                    0b00001000,
                    0b00111110,
                    0b00001000,
                    0b00001000  
                ],
                  [ // 2C
                    0b00000000,
                    0b01010000,
                    0b00110000,
                    0b00000000,
                    0b00000000  
                ],
                  [ // 2D
                    0b00001000,
                    0b00001000,
                    0b00001000,
                    0b00001000,
                    0b00001000  
                ],
                  [ // 2E
                    0b00000000,
                    0b01100000,
                    0b01100000,
                    0b00000000,
                    0b00000000  
                ],
                  [ // 2F
                    0b00100000,
                    0b00010000,
                    0b00001000,
                    0b00000100,
                    0b00000010  
                ],
                  [ // 30
                    0b00111110,
                    0b01010001,
                    0b01001001,
                    0b01000101,
                    0b00111110  
                ],
                  [ // 31
                    0b00000000,
                    0b01000010,
                    0b01111111,
                    0b01000000,
                    0b00000000  
                ],
                  [ // 32
                    0b01000010,
                    0b01100001,
                    0b01010001,
                    0b01001001,
                    0b01000110  
                ],
                  [ // 33
                    0b00100001,
                    0b01000001,
                    0b01000101,
                    0b01001011,
                    0b00110001  
                ],
                  [ // 34
                    0b00011000,
                    0b00010100,
                    0b00010010,
                    0b01111111,
                    0b00010000  
                ],
                  [ // 35
                    0b00100111,
                    0b01000101,
                    0b01000101,
                    0b01000101,
                    0b00111001  
                ],
                  [ // 36
                    0b00111100,
                    0b01001010,
                    0b01001001,
                    0b01001001,
                    0b00110000  
                ],
                  [ // 37
                    0b00000001,
                    0b01110001,
                    0b00001001,
                    0b00000101,
                    0b00000011  
                ],
                  [ // 38
                    0b00110110,
                    0b01001001,
                    0b01001001,
                    0b01001001,
                    0b00110110  
                ],
                  [ // 39
                    0b00000110,
                    0b01001001,
                    0b01001001,
                    0b00101001,
                    0b00011110  
                ],
                  [ // 3A
                    0b00000000,
                    0b00110110,
                    0b00110110,
                    0b00000000,
                    0b00000000  
                ],
                  [ // 3B
                    0b00000000,
                    0b01010110,
                    0b00110110,
                    0b00000000,
                    0b00000000  
                ],
                  [ // 3C
                    0b00001000,
                    0b00010100,
                    0b00100010,
                    0b01000001,
                    0b00000000  
                ],
                  [ // 3D
                    0b00010100,
                    0b00010100,
                    0b00010100,
                    0b00010100,
                    0b00010100  
                ],
                  [ // 3E
                    0b00000000,
                    0b01000001,
                    0b00100010,
                    0b00010100,
                    0b00001000  
                ],
                  [ // 3F
                    0b00000010,
                    0b00000001,
                    0b01010001,
                    0b00001001,
                    0b00000110  
                ],
                  [ // 40
                    0b00110010,
                    0b01001001,
                    0b01111001,
                    0b01000001,
                    0b00111110  
                ],
                  [ // 41
                    0b01111110,
                    0b00010001,
                    0b00010001,
                    0b00010001,
                    0b01111110  
                ],
                  [ // 42
                    0b01111111,
                    0b01001001,
                    0b01001001,
                    0b01001001,
                    0b00110110  
                ],
                  [ // 43
                    0b00111110,
                    0b01000001,
                    0b01000001,
                    0b01000001,
                    0b00100010  
                ],
                  [ // 44
                    0b01111111,
                    0b01000001,
                    0b01000001,
                    0b00100010,
                    0b00011100  
                ],
                  [ // 45
                    0b01111111,
                    0b01001001,
                    0b01001001,
                    0b01001001,
                    0b01000001  
                ],
                  [ // 46
                    0b01111111,
                    0b00001001,
                    0b00001001,
                    0b00001001,
                    0b00000001  
                ],
                  [ // 47
                    0b00111110,
                    0b01000001,
                    0b01001001,
                    0b01001001,
                    0b01111010  
                ],
                  [ // 48
                    0b01111111,
                    0b00001000,
                    0b00001000,
                    0b00001000,
                    0b01111111  
                ],
                  [ // 49
                    0b00000000,
                    0b01000001,
                    0b01111111,
                    0b01000001,
                    0b00000000  
                ],
                  [ // 4A
                    0b00100000,
                    0b01000000,
                    0b01000001,
                    0b00111111,
                    0b00000001  
                ],
                  [ // 4B
                    0b01111111,
                    0b00001000,
                    0b00010100,
                    0b00100010,
                    0b01000001  
                ],
                  [ // 4C
                    0b01111111,
                    0b01000000,
                    0b01000000,
                    0b01000000,
                    0b01000000  
                ],
                  [ // 4D
                    0b01111111,
                    0b00000010,
                    0b00001100,
                    0b00000010,
                    0b01111111  
                ],
                  [ // 4E
                    0b01111111,
                    0b00000100,
                    0b00001000,
                    0b00010000,
                    0b01111111  
                ],
                  [ // 4F
                    0b00111110,
                    0b01000001,
                    0b01000001,
                    0b01000001,
                    0b00111110  
                ],
                  [ // 50
                    0b01111111,
                    0b00001001,
                    0b00001001,
                    0b00001001,
                    0b00000110  
                ],
                  [ // 51
                    0b00111110,
                    0b01000001,
                    0b01010001,
                    0b00100001,
                    0b01011110  
                ],
                  [ // 52
                    0b01111111,
                    0b00001001,
                    0b00011001,
                    0b00101001,
                    0b01000110  
                ],
                  [ // 53
                    0b01000110,
                    0b01001001,
                    0b01001001,
                    0b01001001,
                    0b00110001  
                ],
                  [ // 54
                    0b00000001,
                    0b00000001,
                    0b01111111,
                    0b00000001,
                    0b00000001  
                ],
                  [ // 55
                    0b00111111,
                    0b01000000,
                    0b01000000,
                    0b01000000,
                    0b00111111  
                ],
                  [ // 56
                    0b00011111,
                    0b00100000,
                    0b01000000,
                    0b00100000,
                    0b00011111  
                ],
                  [ // 57
                    0b00111111,
                    0b01000000,
                    0b00111000,
                    0b01000000,
                    0b00111111  
                ],
                  [ // 58
                    0b01100011,
                    0b00010100,
                    0b00001000,
                    0b00010100,
                    0b01100011  
                ],
                  [ // 59
                    0b00000111,
                    0b00001000,
                    0b01110000,
                    0b00001000,
                    0b00000111  
                ],
                  [ // 5A
                    0b01100001,
                    0b01010001,
                    0b01001001,
                    0b01000101,
                    0b01000011  
                ],
                  [ // 5B
                    0b00000000,
                    0b01111111,
                    0b01000001,
                    0b01000001,
                    0b00000000  
                ],
                  [ // 5C
                    0b00000010,
                    0b00000100,
                    0b00001000,
                    0b00010000,
                    0b00100000  
                ],
                  [ // 5D
                    0b00000000,
                    0b01000001,
                    0b01000001,
                    0b01111111,
                    0b00000000  
                ],
                  [ // 5E
                    0b00000100,
                    0b00000010,
                    0b00000001,
                    0b00000010,
                    0b00000100  
                ],
                  [ // 5F
                    0b01000000,
                    0b01000000,
                    0b01000000,
                    0b01000000,
                    0b01000000  
                ],
                  [ // 60
                    0b00000000,
                    0b00000001,
                    0b00000010,
                    0b00000100,
                    0b00000000  
                ],
                  [ // 61
                    0b00100000,
                    0b01010100,
                    0b01010100,
                    0b01010100,
                    0b01111000  
                ],
                  [ // 62
                    0b01111111,
                    0b01001000,
                    0b01000100,
                    0b01000100,
                    0b00111000  
                ],
                  [ // 63
                    0b00111000,
                    0b01000100,
                    0b01000100,
                    0b01000100,
                    0b00100000  
                ],
                  [ // 64
                    0b00111000,
                    0b01000100,
                    0b01000100,
                    0b01001000,
                    0b01111111  
                ],
                  [ // 65
                    0b00111000,
                    0b01010100,
                    0b01010100,
                    0b01010100,
                    0b00011000  
                ],
                  [ // 66
                    0b00001000,
                    0b01111110,
                    0b00001001,
                    0b00000001,
                    0b00000010  
                ],
                  [ // 67
                    0b00001100,
                    0b01010010,
                    0b01010010,
                    0b01010010,
                    0b00111110  
                ],
                  [ // 68
                    0b01111111,
                    0b00001000,
                    0b00000100,
                    0b00000100,
                    0b01111000  
                ],
                  [ // 69
                    0b00000000,
                    0b01000100,
                    0b01111101,
                    0b01000000,
                    0b00000000  
                ],
                  [ // 6A
                    0b00100000,
                    0b01000000,
                    0b01000100,
                    0b00111101,
                    0b00000000  
                ],
                  [ // 6B
                    0b01111111,
                    0b00010000,
                    0b00101000,
                    0b01000100,
                    0b00000000  
                ],
                  [ // 6C
                    0b00000000,
                    0b01000001,
                    0b01111111,
                    0b01000000,
                    0b00000000  
                ],
                  [ // 6D
                    0b01111100,
                    0b00000100,
                    0b00011000,
                    0b00000100,
                    0b01111000  
                ],
                  [ // 6E
                    0b01111100,
                    0b00001000,
                    0b00000100,
                    0b00000100,
                    0b01111000  
                ],
                  [ // 6F
                    0b00111000,
                    0b01000100,
                    0b01000100,
                    0b01000100,
                    0b00111000  
                ],
                  [ // 70
                    0b01111100,
                    0b00010100,
                    0b00010100,
                    0b00010100,
                    0b00001000  
                ],
                  [ // 71
                    0b00001000,
                    0b00010100,
                    0b00010100,
                    0b00011000,
                    0b01111100  
                ],
                  [ // 72
                    0b01111100,
                    0b00001000,
                    0b00000100,
                    0b00000100,
                    0b00001000  
                ],
                  [ // 73
                    0b01001000,
                    0b01010100,
                    0b01010100,
                    0b01010100,
                    0b00100000  
                ],
                  [ // 74
                    0b00000100,
                    0b00111111,
                    0b01000100,
                    0b01000000,
                    0b00100000  
                ],
                  [ // 75
                    0b00111100,
                    0b01000000,
                    0b01000000,
                    0b00100000,
                    0b01111100  
                ],
                  [ // 76
                    0b00011100,
                    0b00100000,
                    0b01000000,
                    0b00100000,
                    0b00011100  
                ],
                  [ // 77
                    0b00111100,
                    0b01000000,
                    0b00110000,
                    0b01000000,
                    0b00111100  
                ],
                  [ // 78
                    0b01000100,
                    0b00101000,
                    0b00010000,
                    0b00101000,
                    0b01000100  
                ],
                  [ // 79
                    0b00001100,
                    0b01010000,
                    0b01010000,
                    0b01010000,
                    0b00111100
                ],
                  [ // 7A
                    0b01000100,
                    0b01100100,
                    0b01010100,
                    0b01001100,
                    0b01000100
                ],
                  [ // 7B
                    0b00000000,
                    0b00001000,
                    0b00110110,
                    0b01000001,
                    0b00000000
                ],
                  [ // 7C
                    0b00000000,
                    0b00000000,
                    0b01111111,
                    0b00000000,
                    0b00000000
                ],
                  [ // 7D
                    0b00000000,
                    0b01000001,
                    0b00110110,
                    0b00001000,
                    0b00000000  
                ],
                  [ // 7E
                    0b00001000,
                    0b00000100,
                    0b00001000,
                    0b00010000,
                    0b00001000  
                ],
                  [ // 7F
                    0b00000001,
                    0b00101010,
                    0b01111100,
                    0b00101010,
                    0b00000001  
                ]
            ];
        }
    }
})(Centi);