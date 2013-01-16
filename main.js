var dgram = require('dgram')

var settings = {
	'mode': '',
	'amount': 100,
	'server_ip': '127.0.0.1',
	'client_ip': '127.0.0.1',
	'server_port': 1234,
	'client_port': 1235,
	'size': 1000,
	'ready': false
}

process.argv.forEach(function (val, index, array) {
  if(val == '--client') {
  	settings.mode = 'client'
  } else if(val == '--server'){
  	settings.mode = 'server'
  }

	if(settings.mode == 'client') {
		if(index == 3){
			settings.server_ip = val
		} else if(index == 4) {
			settings.amount = val
		} else if(index == 5) {
			if(val < 64) {
				console.log('Too small packet size (at least 64 bytes)')
				process.exit(1)
			}
			settings.size = val
		}
	}
});


if(settings.mode == 'client') {
	console.log('Client started')
var ba = 0
	var client = dgram.createSocket("udp4");
	var timer = 0;
	client.bind(settings.client_port);

	var message = new Buffer(parseInt(settings.size));
	var msg = new Buffer(JSON.stringify({'amount' : settings.amount}));

	console.log('Send settings to server')
	client.send(msg, 0, msg.length, settings.server_port, settings.server_ip)

	client.on("listening", function () {
	  console.log('Client started listening')
	});

	client.on('message', function(msg){
		console.log('Got message from server')
		try {
			obj = JSON.parse(msg.toString())
		} catch(e) {

		}
			if(typeof(obj) == 'object') {
				if(obj.done) {
					console.log('Dit grapje koste mij '+timer+'ms')
					process.exit(code=0)
				}
				if(obj.ready) {
					console.log('Timer reset')
					timer = 0;
					setInterval(function(){ timer++ },1)
					
					for (var i=0;i<(settings.amount);i++) {
						client.send(message, 0, message.length, settings.server_port, settings.server_ip, function(err, bytes){
							
						});
						ba++;
					}
					console.log(ba)
					console.log('Packets sent');
				}
			}
	})

	
}

if(settings.mode == 'server') {
	var packets = 0;
	var server = dgram.createSocket("udp4");

	server.on("message", function (msg, rinfo) {
		if(rinfo.size > 60) {
			console.log('Got a packet with size: ' + rinfo.size)
			console.log(packets)
			console.log(settings.amount)
			packets++;
			if(packets >= settings.amount) {
				var buf = new Buffer(JSON.stringify({'done': true}));
				server.send(buf, 0, buf.length, settings.client_port, settings.client_ip)
			}
		} else {
			try {
				setting = JSON.parse(msg.toString())
			} catch(e) {

			}

			if(typeof(setting) == 'object') {
				console.log('asdfasd')
				settings.amount = setting.amount
				settings.ready = false
				packets = 0;
			}

			if(!settings.ready) {
				var buf = new Buffer(JSON.stringify({'ready': true}));
				server.send(buf, 0, buf.length, settings.client_port, settings.client_ip)
				settings.ready = true;
			}
		}
	});

	server.on("listening", function () {
	  console.log('Server started listening')
	});

	server.bind(settings.server_port);
}