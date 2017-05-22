var express = require("express");
var app = express();

app.get('/', (req, res)=>{
	res.send('testing');
});

app.listen(8000, () => console.log('starting'));

