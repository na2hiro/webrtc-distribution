var PeerServer = require("peer").PeerServer;
var server = new PeerServer({port: 9000, path: '/myapp'});
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
		socket.emit("ids", {imageid: id, peerids: peers[id]||[]});
	});
	socket.on("ready", function(data){
		console.log("ready", data);
		if(peers[data.imageid]){
			peers[data.imageid].push(data.peerid, "noise"+randomString());
		}else{
			peers[data.imageid]=[data.peerid, "noise"+randomString()]
		}
		console.log("peers(ready)", peers);
	});
	socket.on("disconnect", function(){
		console.log("socket disconnect");
	});
});
function randomString(){return Math.random().toString(36).slice(2);}
