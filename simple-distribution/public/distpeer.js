function DistPeer(){}
DistPeer.prototype.initialize = function(){
	this.images={}; // imageid=>Blob
	this.callbacks={}; // imageid=>callback
	this.peers = {}; // imageid=>[peerid]
	this.timers = {}; // imageid=>Timer
	this.tryingimages = {};// peerid=>[imageid]
	this.conns = {} // peerid=>DataConnection
	this.counts = {timeout: 0, frompeer: 0, fromserver: 0};
	this.peercounts= {};
	this.peer = new Peer({host: location.hostname, port: 8602, path: "/myapp"});
	this.socket = io.connect();
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
			conn.send({id: id, buf: this.images[id]});
		}.bind(this));
	}.bind(this));
};
DistPeer.prototype.prepareReceiving = function(){
	// 受信時
	this.socket.on("ids", function(data){
		this.safeSendPeerId();
		console.log(data.imageid, "は", data.peerids.join(", "), "さんたちがもってる")
		this.peers[data.imageid] = data.peerids.shuffle();
		this.fetchNext(data.imageid);
	}.bind(this));
	this.socket.on("err", function(data){
		this.callbacks[data.imageid](data.message);
	}.bind(this));
	this.socket.on("raw", function(image){
		Base64_To_ArrayBuffer_Async(image.base64, function(buf){
			var blob = new Blob([buf]);
			this.callbacks[image.id](false, {id: image.id, blob: blob});
			this.addImage(image.id, blob);
			this.increment("fromserver");
		}.bind(this));
		
	}.bind(this));
	this.peer.on("error", function(data){
		// peerにつながらなかった
		console.log("peer error", data);
		var match = data.message.match(this.PEER_ERROR_MESSAGE_REGEXP);
		if(match){
			var imageids = this.tryingimages[match[1]];
			for(var i=0; i<imageids; i++){
				var imageid = imageids[i];
				this.clearTimer(imageid);
				this.fetchNext(imageid);
			}
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
		console.log("no one has image, server will help me!", imageid);
		this.socket.emit("raw", imageid);
		return;
	}
	var conn;
	if(!this.tryingimages[pid]){
		//新たにつなぐ
		console.log("新たなconn");
		this.tryingimages[pid]=[];	
		conn = this.peer.connect(pid);
		this.conns[pid] = conn;
		conn.on("error", function(err){
			// 無効なpeer idの場合ここにはこない (どういう時に来るの？)
			console.log("error", err);
			//this.fetchNext();
		}.bind(this))
		conn.on("open", function(){
			start(this);
		}.bind(this));
		conn.on("data", function(image){
			this.clearTimer(image.id);
			var blob = new Blob([image.buf]);
			this.callbacks[image.id](false, {id: image.id, blob: blob});
			this.addImage(image.id, blob);
			this.increment("frompeer");
			this.incrementPeer(pid);
			// もうこのピアから貰うものがなければ切る
			this.tryingimages[pid]=this.tryingimages[pid].filter(function(iid){return iid!=image.id;});
			if(this.tryingimages[pid].length==0){
				conn.close();
			}
		}.bind(this));
	}else{
		//既存の
		console.log("既存のconn")
		conn=this.conns[pid];
		if(conn.open){
			start(this);
		}else{
			conn.on("open", function(){
				start(this);
			}.bind(this));
		}
	}
	this.setTimer(imageid, function(){
		console.log("timeout: ピアにつながらなかった");
		this.increment("timeout");
		conn.close();
		this.fetchNext(imageid);
	}.bind(this), 3000);
	this.tryingimages[pid].push(imageid);
	function start(that){
		console.log("giveme", imageid, pid);
		that.setTimer(imageid, function(){
			console.log("timeout: つながったけどデータがこない");
			this.increment("timeout");
			conn.close();
			that.fetchNext(imageid);
		}.bind(that), 1000);
		conn.send(imageid);
	}
};
DistPeer.prototype.addImage = function(imageid, blob){
	console.log("clearTimer");
	console.log("ready", imageid);
	this.images[imageid] = blob;
	this.socket.emit("ready", {peerid:this.peer.id, imageid:imageid});
};
DistPeer.prototype.setTimer = function(imageid, callback, millis){
	console.log("setTimer", millis);
	this.clearTimer(imageid);
	this.timers[imageid] = setTimeout(callback, millis);
};
DistPeer.prototype.clearTimer = function(imageid){
	if(this.timers[imageid]){
		clearTimeout(this.timers[imageid]);
		delete this.timers[imageid];
	}
};
DistPeer.prototype.increment = function(name){
	this.counts[name]++;
	if(this.onincrement){
		this.onincrement();
	}
};
DistPeer.prototype.incrementPeer = function(peerid){
	this.peercounts[peerid] = (this.peercounts[peerid]||0)+1;
	if(this.onincrementpeer){
		this.onincrementpeer();
	}
};
setInterval(function(){console.log("uhyohyo")}, 500)

Array.prototype.shuffle = function() {
    var i = this.length;
    while(i){
        var j = Math.floor(Math.random()*i);
        var t = this[--i];
        this[i] = this[j];
        this[j] = t;
    }
    return this;
}
