var peer = new Peer({host: "localhost", port: 9000, path: "/myapp"});
var peerid="";
var images={};
peer.on("open", function(id){
	console.log("peer open: I am", id);
	peerid=id;
	safeSendPeerId();
});
peer.on("error", function(data){
	console.log("peer error", data);
})

// 送信時
peer.on("connection", function(conn){
	conn.on("data", function(id){
		console.log("he needs", id);
		conn.send(images[id]);
	});
});
var socket = io.connect("http://localhost:9001");

// 受信時
socket.on("ids", function(data){
	safeSendPeerId();
	console.log(data.imageid, "は", data.peerids.join(", "), "さんたちがもってる")
	var ids = data.peerids;
	nextFetch();
	function nextFetch(){
		var pid = ids.pop();
		var conn = peer.connect(pid);
		CONN = conn;
		conn.on("error", function(err){
			console.log("error", err);
			nextFetch();
		})
		conn.on("open", function(){
			console.log("giveme", data.imageid, pid);
			conn.send(data.imageid);
			conn.on("data", function(buf){
				var img = new Image();
				var blob = new Blob([buf]);
				images[data.imageid] = blob;
				img.src = URL.createObjectURL(blob);
				document.body.appendChild(img)
				console.log("ready", peerid, data.imageid);
				socket.emit("ready", {peerid: peerid, imageid: data.imageid});
				conn.close();
			});
		});
	}
});
function safeSendPeerId(){
	if(socket && peerid!=""){
		console.log("I am", peerid);
		socket.emit("iam", peerid);
	}
}
