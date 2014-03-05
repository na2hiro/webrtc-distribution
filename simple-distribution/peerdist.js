var peer = new Peer({host: "localhost", port: 9000, path: "/myapp"});
var peerid="";
var images={};
var PEER_ERROR_MESSAGE_REGEXP = /^Could not connect to peer (.*)$/;
peer.on("open", function(id){
	console.log("peer open: I am", id);
	peerid=id;
	safeSendPeerId();
});
peer.on("error", function(data){
	console.log("peer error", data);
	var match = data.message.match(PEER_ERROR_MESSAGE_REGEXP);
	if(match){
		fetchNext(tryingimages[match[1]]);
	}
})

// 送信時
peer.on("connection", function(conn){
	conn.on("data", function(id){
		console.log("he needs", id);
		conn.send(images[id]);
	});
});
var socket = io.connect("http://localhost:9001");


var peers = {}; // imageid=>[peerid]
var tryingimages = {};// peerid=>imageid

// 受信時
socket.on("ids", function(data){
	safeSendPeerId();
	console.log(data.imageid, "は", data.peerids.join(", "), "さんたちがもってる")
	peers[data.imageid] = data.peerids;
	fetchNext(data.imageid);
});
function safeSendPeerId(){
	if(socket && peerid!=""){
		console.log("I am", peerid);
		socket.emit("iam", peerid);
	}
}
function fetchNext(imageid){
	console.log("fetch", imageid);
	var pid = peers[imageid].pop();
	if(!pid){
		console.log("no one has image", imageid);
		return;
	}
	tryingimages[pid] = imageid;
	var conn = peer.connect(pid);
	CONN = conn;
	conn.on("error", function(err){
		// 無効なpeer idの場合ここにはこない (どういう時に来るの？)
		console.log("error", err);
		fetchNext();
	})
	conn.on("open", function(){
		console.log("giveme", imageid, pid);
		conn.send(imageid);
		conn.on("data", function(buf){
			var img = new Image();
			var blob = new Blob([buf]);
			images[imageid] = blob;
			img.src = URL.createObjectURL(blob);
			document.body.appendChild(img);
			console.log("ready", peerid, imageid);
			socket.emit("ready", {peerid: peerid, imageid: imageid});
			conn.close();
		});
	});
}
