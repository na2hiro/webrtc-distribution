// ------------------------------------------------------------
// Base64 文字列から ArrayBuffer に変換する関数 (非同期実行)
// ------------------------------------------------------------
function Base64_To_ArrayBuffer_Async(base64,callback,increment){
	var dic = new Object();
	dic[0x41]= 0; dic[0x42]= 1; dic[0x43]= 2; dic[0x44]= 3; dic[0x45]= 4; dic[0x46]= 5; dic[0x47]= 6; dic[0x48]= 7; dic[0x49]= 8; dic[0x4a]= 9; dic[0x4b]=10; dic[0x4c]=11; dic[0x4d]=12; dic[0x4e]=13; dic[0x4f]=14; dic[0x50]=15;
	dic[0x51]=16; dic[0x52]=17; dic[0x53]=18; dic[0x54]=19; dic[0x55]=20; dic[0x56]=21; dic[0x57]=22; dic[0x58]=23; dic[0x59]=24; dic[0x5a]=25; dic[0x61]=26; dic[0x62]=27; dic[0x63]=28; dic[0x64]=29; dic[0x65]=30; dic[0x66]=31;
	dic[0x67]=32; dic[0x68]=33; dic[0x69]=34; dic[0x6a]=35; dic[0x6b]=36; dic[0x6c]=37; dic[0x6d]=38; dic[0x6e]=39; dic[0x6f]=40; dic[0x70]=41; dic[0x71]=42; dic[0x72]=43; dic[0x73]=44; dic[0x74]=45; dic[0x75]=46; dic[0x76]=47;
	dic[0x77]=48; dic[0x78]=49; dic[0x79]=50; dic[0x7a]=51; dic[0x30]=52; dic[0x31]=53; dic[0x32]=54; dic[0x33]=55; dic[0x34]=56; dic[0x35]=57; dic[0x36]=58; dic[0x37]=59; dic[0x38]=60; dic[0x39]=61; dic[0x2b]=62; dic[0x2f]=63;
	var num = base64.length;
	var n = 0;
	var b = 0;
	var e;

	if(increment === undefined){
		increment = 10240;
	}

	if(!num){ callback(new ArrayBuffer(0)); return; }
	if(num < 4){ callback(null); return; }
	if(num % 4){ callback(null); return; }

	e = num / 4 * 3;
	if(base64.charAt(num - 1) == '=') e -= 1;
	if(base64.charAt(num - 2) == '=') e -= 1;

	var ary_buffer = new ArrayBuffer( e );
	var ary_u8 = new Uint8Array( ary_buffer );
	var i = 0;
	var j = 0;
	var p = 0;
	function f(){
		while(p < e){
			b = dic[base64.charCodeAt(i)];
			if(b === undefined){ callback(null); return; }
			n = (b << 2);
			i ++;

			b = dic[base64.charCodeAt(i)];
			if(b === undefined){ callback(null); return; }
			ary_u8[p] = n | ((b >> 4) & 0x3);
			n = (b & 0x0f) << 4;
			i ++;
			p ++;
			if(p >= e) break;

			b = dic[base64.charCodeAt(i)];
			if(b === undefined){ callback(null); return; }
			ary_u8[p] = n | ((b >> 2) & 0xf);
			n = (b & 0x03) << 6;
			i ++;
			p ++;
			if(p >= e) break;

			b = dic[base64.charCodeAt(i)];
			if(b === undefined){ callback(null); return; }
			ary_u8[p] = n | b;
			i ++;
			p ++;

			j += 4;
			if(j > increment){
				j = 0;
				setTimeout(f,1);
				return;
			}
		}
		callback(ary_buffer);
	}

	setTimeout(f,1);
}
