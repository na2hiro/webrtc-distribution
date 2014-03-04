var PeerServer = require("peer").PeerServer;
var server = new PeerServer({port: 9000, path: '/myapp'});
server.on("connection", function(id){
	console.log("connection", id);
});
server.on("disconnect", function(id){
	console.log("disconnect", id);
});


var sockets = {}; // peerid=>socket
var peers = {}; // imageid=>[peerid]

var io = require("socket.io").listen(9001);
io.sockets.on('connection', function(socket){
	socket.on("iam", function(peerid){
		socket.set("peerid", peerid, function(){
			console.log("he is ", peerid)
		});
		sockets[peerid]=socket;
	});
	socket.on("ids", function(id){
		socket.emit("ids", {imageid: id, peerids: peers[id]||["superuser"]});
	});
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
		socket.get("peerid", function(err, peerid){
			console.log("removing", peerid);
			delete sockets[peerid];
			for(var i in peers){
				console.log("image", i, ":", peers[i]);
				peers[i]=peers[i].filter(function(id){return id!=peerid});
			}
			console.log("peers(discon)", peers);
		});
	});
});
