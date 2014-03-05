function DistPeer(){}
DistPeer.prototype.initialize = function(){
	this.images={};
	this.callbacks={}; // imageid=>callback
	this.peers = {}; // imageid=>[peerid]
	this.tryingimages = {};// peerid=>imageid
	this.peer = new Peer({host: "localhost", port: 9000, path: "/myapp"});
	this.socket = io.connect("http://localhost:9001");
	this.peer.on("open", function(id){
		console.log("peer open: I am", id);
		this.safeSendPeerId();
	}.bind(this));
	this.prepareReceiving();
	this.prepareSending();
};

DistPeer.prototype.PEER_ERROR_MESSAGE_REGEXP = /^Could not connect to peer (.*)$/;
DistPeer.prototype.prepareSending = function(){
	// 送信時
	this.peer.on("connection", function(conn){
		conn.on("data", function(id){
			console.log("he needs", id);
			conn.send(this.images[id]);
		}.bind(this));
	}.bind(this));
};
DistPeer.prototype.prepareReceiving = function(){
	// 受信時
	this.socket.on("ids", function(data){
		this.safeSendPeerId();
		console.log(data.imageid, "は", data.peerids.join(", "), "さんたちがもってる")
		this.peers[data.imageid] = data.peerids;
		this.fetchNext(data.imageid);
	}.bind(this));
	this.peer.on("error", function(data){
		console.log("peer error", data);
		var match = data.message.match(this.PEER_ERROR_MESSAGE_REGEXP);
		if(match){
			this.fetchNext(this.tryingimages[match[1]]);
		}
	}.bind(this));
};
DistPeer.prototype.getImage = function(id, callback){
	this.socket.emit("ids", id);
	this.callbacks[id]=callback;
};
DistPeer.prototype.safeSendPeerId = function(){
	if(this.socket && this.peer && this.peer.disconnected){
		console.log("I am", this.peer.id);
		this.socket.emit("iam", this.peer.id);
	}
};
DistPeer.prototype.fetchNext = function(imageid){
	console.log("fetch", imageid);
	var pid = this.peers[imageid].pop();
	if(!pid){
		console.log("no one has image", imageid);
		return;
	}
	this.tryingimages[pid] = imageid;
	var conn = this.peer.connect(pid);
	CONN = conn;
	conn.on("error", function(err){
		// 無効なpeer idの場合ここにはこない (どういう時に来るの？)
		console.log("error", err);
		this.fetchNext();
	}.bind(this))
	conn.on("open", function(){
		console.log("giveme", imageid, pid);
		conn.send(imageid);
		conn.on("data", function(buf){
			var blob = new Blob([buf]);
			this.callbacks[imageid](blob);
			this.addImage(imageid, blob);
			conn.close();
		}.bind(this));
	}.bind(this));
};
DistPeer.prototype.addImage = function(imageid, blob){
	console.log("ready", imageid);
	this.images[imageid] = blob;
	this.socket.emit("ready", {peerid:this.peer.id, imageid:imageid});
};
