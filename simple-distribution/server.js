var ranking=["http://i2.pixiv.net/img52/img/pon0737/mobile/41995790_240mw.jpg","http://i2.pixiv.net/img64/img/hutuumikan/mobile/42004082_240mw.jpg","http://i1.pixiv.net/img03/img/sakkan/mobile/41983148_240mw.jpg","http://i1.pixiv.net/img31/img/risa_hibiki/mobile/41990348_240mw.jpg","http://i2.pixiv.net/img10/img/biyonbiyon/mobile/41985591_240mw.jpg","http://i1.pixiv.net/img13/img/rella/mobile/41991307_240mw.jpg","http://i2.pixiv.net/img26/img/ydnac/mobile/41982745_240mw.jpg","http://i1.pixiv.net/img77/img/fff365/mobile/41982244_240mw.jpg","http://i2.pixiv.net/img140/img/mzkmm/mobile/41983527_240mw.jpg","http://i1.pixiv.net/img13/img/love-pk/mobile/42002660_240mw.jpg","http://i2.pixiv.net/img18/img/kohakutuki/mobile/41992828_240mw.jpg","http://i1.pixiv.net/img115/img/tamaccolos/mobile/41995242_240mw.jpg","http://i2.pixiv.net/img32/img/eikokudaisuki/mobile/41995642_240mw.jpg","http://i2.pixiv.net/img08/img/halloween/mobile/42014466_240mw.jpg","http://i2.pixiv.net/img02/img/adanas/mobile/42004007_240mw.jpg","http://i1.pixiv.net/img15/img/hinamina/mobile/41993762_240mw.jpg","http://i1.pixiv.net/img41/img/kagami86/mobile/41989713_240mw.jpg","http://i2.pixiv.net/img30/img/kd998/mobile/42003827_240mw.jpg","http://i2.pixiv.net/img38/img/ghfgh/mobile/41983843_240mw.jpg","http://i1.pixiv.net/img111/img/cherryblossompio/mobile/41986372_240mw.jpg","http://i2.pixiv.net/img06/img/walpurgisnacht/mobile/41983078_240mw.jpg","http://i2.pixiv.net/img18/img/nanase70/mobile/41996487_240mw.jpg","http://i1.pixiv.net/img59/img/Stu_dts/mobile/41984639_240mw.jpg","http://i1.pixiv.net/img69/img/mana-kakkowarai/mobile/42014481_240mw.jpg","http://i1.pixiv.net/img49/img/alp315/mobile/41985900_240mw.jpg","http://i1.pixiv.net/img13/img/makai-no-jyumin/mobile/41982520_240mw.jpg","http://i2.pixiv.net/img30/img/hime03/mobile/42012452_240mw.jpg","http://i2.pixiv.net/img28/img/geek919/mobile/42017785_240mw.jpg","http://i1.pixiv.net/img27/img/technoheart/mobile/41983276_240mw.jpg","http://i1.pixiv.net/img15/img/duckbeans/mobile/42008461_240mw.jpg","http://i1.pixiv.net/img27/img/technoheart/mobile/42004536_240mw.jpg","http://i1.pixiv.net/img05/img/janemere/mobile/42008983_240mw.jpg","http://i1.pixiv.net/img127/img/aikono/mobile/41991656_240mw.jpg","http://i2.pixiv.net/img112/img/karanunio/mobile/42009150_240mw.jpg","http://i2.pixiv.net/img52/img/teigi/mobile/42006739_240mw.jpg","http://i2.pixiv.net/img14/img/ko_ru_ri/mobile/41990912_240mw.jpg","http://i2.pixiv.net/img86/img/nis_3/mobile/42005369_240mw.jpg","http://i1.pixiv.net/img41/img/96x69/mobile/41994428_240mw.jpg","http://i1.pixiv.net/img19/img/penzen/mobile/42000169_240mw.jpg","http://i2.pixiv.net/img30/img/oba-min/mobile/41984327_240mw.jpg","http://i2.pixiv.net/img98/img/oshiri-ga-wareruhi/mobile/42004215_240mw.jpg","http://i2.pixiv.net/img56/img/y_izayoi_s04/mobile/41993689_240mw.jpg","http://i2.pixiv.net/img62/img/miku1192/mobile/42000649_240mw.jpg","http://i1.pixiv.net/img119/img/fheksxpsla/mobile/41998074_240mw.jpg","http://i1.pixiv.net/img65/img/lifotai123/mobile/42001244_240mw.jpg","http://i1.pixiv.net/img03/img/keisuwabe/mobile/42004981_240mw.jpg","http://i1.pixiv.net/img127/img/aikono/mobile/42008544_240mw.jpg","http://i1.pixiv.net/img19/img/ech/mobile/42005459_240mw.jpg","http://i2.pixiv.net/img38/img/mihan/mobile/41981711_240mw.jpg","http://i1.pixiv.net/img135/img/pnpn1205/mobile/41986485_240mw.jpg"]
var URL_INVALID_REGEXP = /[\/:]/g;

var PeerServer = require("peer").PeerServer;
var server = new PeerServer({port: 9000, path: '/myapp'});
var fs = require("fs");
server.on("connection", function(id){
	console.log("connection", id);
});
server.on("disconnect", function(peerid){
	console.log("disconnect", peerid);
	//delete sockets[peerid];
	for(var i in peers){
		console.log("image", i, ":", peers[i]);
		peers[i]=peers[i].filter(function(id){return id!=peerid});
	}
	console.log("peers(discon)", peers);
});

var peers = {}; // imageid=>[peerid]

var io = require("socket.io").listen(9001);
io.sockets.on('connection', function(socket){
	socket.on("iam", function(peerid){
		console.log("he is ", peerid);
	});
	socket.on("ids", function(id){
		if(peers[id]){
			socket.emit("ids", {imageid: id, peerids: peers[id]});
		}else{
			// 自分で送るしかない
			sendraw(id);
		}
	});
	socket.on("raw", function(id){
		sendraw(id);
	});
	function sendraw(id){
		console.log("!!! サーバが渋々送る !!!");
		fs.readFile("public/"+safeFilename(id), function(err, buf){
			if(err){
				console.log("no such file");
				return;
			}
			socket.emit("raw", {id: id, base64: buf.toString("base64")});
		});
	}
	socket.on("ready", function(data){
		console.log("ready", data);
		if(peers[data.imageid]){
			peers[data.imageid].push(data.peerid);
		}else{
			peers[data.imageid]=[data.peerid]
		}
		console.log("peers(ready)", peers);
	});
	socket.on("disconnect", function(){
		console.log("socket disconnect");
	});
});
// ファイル名無害化
function safeFilename(name){
	return name.replace(URL_INVALID_REGEXP, "_");
}
