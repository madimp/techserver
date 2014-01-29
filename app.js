var express = require('express');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser("R+mP2QeS-\"WzN&<mFs]~_V6WMz X[} =<obw<G-"));
app.use(express.session({
	key: "sid",
	secret: "-b6`_$-+z4nbssRcQhxnv,EFeZvp^-_73TL>3o",
	cookie: {
		path: '/',
		httpOnly: true,
		maxAge: 1000 * 60 * 60 * 24 * 30
	}
}));

app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var server = http.createServer(app);

require('./server/server').init(server);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var scores = [],
	id = 0;

function sortScores(){
	scores.sort(function(a,b){
		return a.score > b.score;
	});
}

app.get('/scores', function(req, res){
	var s;
	if (req.query.limit){
		s = [];
		for (var i = 0, l = scores.length, li = req.query.limit; i < l && i < li; i++){
			s.push(scores[i]);
		}
	} else {
		s = scores;
	}
	s = JSON.stringify(s);
	res.setHeader('Content-Type', 'application/javascript');
	res.setHeader('Content-Length', Buffer.byteLength(s));
	res.end(s);
});

app.post('/scores', function(req, res){
	var m = req.body;
	m.id = id++;
	scores.push(m);
	sortScores();
	var s = JSON.stringify(m);
	res.setHeader('Content-Type', 'application/javascript');
	res.setHeader('Content-Length', Buffer.byteLength(s));
	res.end(s);
});

app.del('/scores/:id', function(req, res){
	var id = req.params.id;

	for (var i = 0, l = scores.length; i < l; i++){
		var score = scores[i];

		if (score.id == id){
			scores.splice(i, 1);
			break;
		}
	}

	sortScores();

	res.end();
	return;

	var s = JSON.stringify(scores);
	res.setHeader('Content-Type', 'application/javascript');
	res.setHeader('Content-Length', Buffer.byteLength(s));
	res.end(s);
});

app.put('/scores/:id', function(req, res){
	var id = req.params.id,
		score;

	for (var i = 0, l = scores.length; i < l; i++){
		score = scores[i];

		if (score.id == id){
			score = req.body;
			scores.splice(i, 1, score);
			break;
		}
	}

	var s = JSON.stringify(score);
	res.setHeader('Content-Type', 'application/javascript');
	res.setHeader('Content-Length', Buffer.byteLength(s));
	res.end(s);
});
