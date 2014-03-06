var fs = require("fs");
var http = require("http");
var jsdom = require("jsdom");
var url = require("url");
var URL_INVALID_REGEXP = /[\/:]/g;
var MAX_FILE_SIZE = 500*1000;//500kb
fs.readFile("ranking.html", function(err, content){
	content = content.toString();
	var doc = jsdom.jsdom(content);
	var ss = doc.querySelectorAll("section.ranking-item");
	var urls = [];
	for(var i=0; i<ss.length; i++){
		var s = ss[i];
		var rank = s.id;
		var u = s.querySelector("img._thumbnail").attributes["data-src"].value;
		urls.push({rank: rank, url: u});
	}
	fs.writeFile("ranking.js", "var ranking="+JSON.stringify(urls.map(function(u){return u.url;})), function(err){
		console.log("done")
	});
	fetchOne();
function fetchOne(){
	var u = urls.pop();
	if(!u)return false;
	console.log("fetch", u.url);
	fetch(u.url, function(ok, res){
		if(!ok)throw "err";
		fs.writeFile(__dirname+"/simple-distribution/public/"+u.url.replace(URL_INVALID_REGEXP, "_"), res, function(err){
			console.log("writefile "+err)
			fetchOne();
		})
	});
}
	
});


function fetch(u, next) {
	u=url.parse(u);
    var request = http.request({
		host: u.hostname,
		port: 80,//3128,
		path: u.pathname,
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
		var b = new Buffer(MAX_FILE_SIZE);
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
			next(response.statusCode==200,b.slice(0, offset));
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
