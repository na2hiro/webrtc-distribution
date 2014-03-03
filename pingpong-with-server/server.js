var PeerServer = require("peer").PeerServer;
var server = new PeerServer({port: 9000, path: '/myapp'});
server.on("connection", function(id){
	console.log("connection", id);
});
server.on("disconnect", function(id){
	console.log("disconnect", id);
});
