var http = require("http");
var fs = require("fs");

fetch("/ranking.php?mode=daily", function(ok, res){
	fs.writeFile("ranking.html", res)
	console.log(ok, res);
});
function fetch(path, next) {
    var request = http.request({
		host: "www.pixiv.net",
		port: 80,//3128,
		path: path,
	});
    request.end();

    // レスポンスイベントハンドラ
    request.on('response', function (response) {
        var body = "";
        // データ取得完了ハンドラ
		var writableStream = fs.createWriteStream("hoge");
		fn=function(){console.log("fn!")}
		writableStream.on('error', fn);
		writableStream.on('close', fn);
		var b = new Buffer(500000);
		var offset=0;
		response.on('data', function(chunk){
			chunk.copy(b, offset);
			offset+=chunk.length;
			writableStream.write(chunk, 'binary');
		});
		response.on('end', function(){
			writableStream.end();
//			var newb = b.slice(0, offset);
//			var utf8buffer = new Iconv("Shift_JIS", "UTF-8//TRANSLIT//IGNORE").convert(newb);
			next(response.statusCode==200,b.slice(0,offset).toString());
		});
		/*
		response.on("data",function(chunk){
			body+=conv.convert(chunk);
		});
        response.on('end', function(){
            // URLとステータスを出力
			next(response.statusCode==200, body);
        })*/
    });
}
/*
function crawlone(year, month, next){
	console.log("start", year, month)
	fetch("/kisen/month/"+year+"/"+(month<10?"0":"")+month+"all.html", function(ok, buffer){
		if(!ok){
			console.log("error at ", year, month)
		}
			next(buffer);
		
	})
}
var urls = [];
for(var year=2006; year<=2006; year++){
	for(var month=1; month<=2; month++){
		urls.push({year:year, month:month});
	}
}
var fs = require("fs");
var Iconv = require("iconv").Iconv;
function crawl(){
	var obj = urls.pop();
	crawlone(obj.year, obj.month, function(result){
		if(!result) return;
		fs.writeFile("data/"+obj.year+"_"+obj.month+".html", result)
		setTimeout(function(){
			crawl();
		}, 2000);
	});
}*/
/*
	fetch(baseurl+urls[0], function(ok, data){
		if(ok){
			console.log(getLink1(urls[0], data))
		}else{
			console.log("ng")
		}
	});
	*/
