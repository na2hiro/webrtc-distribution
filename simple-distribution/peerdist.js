var peer = new Peer({host: "localhost", port: 9000, path: "/myapp"});
var peerid="";
var images={};
peer.on("open", function(id){
	console.log("peer open: I am", id);
	peerid=id;
});
peer.on("error", function(data){
	console.log("peer error", data);
})

// 送信時
peer.on("connection", function(conn){
	conn.on("data", function(id){
		console.log("nansuka", id);
		conn.send(images[id]);
	});
});
var socket = io.connect("http://localhost:9001");

// 受信時
socket.on("ids", function(data){
	console.log(data.imageid, "は", data.peerids, "さんたちがもってる")
	data.peerids.forEach(function(pid){
		var conn = peer.connect(pid);
		conn.on("open", function(){
			console.log("giveme", data.imageid, pid);
			conn.send(data.imageid);
			conn.on("data", function(data){
				var img = new Image();
				img.src = URL.createObjectURL(new Blob([data]));
				document.body.appendChild(img)
				socket.emit("ready", {peerid: peerid, imageid: data.imageid});
			});
		});
	});
});
