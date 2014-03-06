var IMAGE_ID_REGEXP = /^[a-zA-Z0-9._]*$/;

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
		if(!id.match(IMAGE_ID_REGEXP)){
			socket.emit("err", {message: "invalid file name", imageid: id});
			return;
		}
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
		fs.readFile("public/"+id, function(err, buf){
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
