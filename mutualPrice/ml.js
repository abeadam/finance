const smr = require('smr');
function runLinerRegression(x,y) {
	var regression = new smr.Regression({ numX: x.length, numY: 1 });
	let lastLength = x[0].length;
	x.forEach((x)=>{ if (x.length!==lastLength){ throw Error('wrong length for some length')}});
	for (let day = 0 ; day < x[0].length ; day++) {
		let level = [];
		x.forEach((stock)=>level.push(stock[day]));
		regression.push({x:level, y:[y[day]]});	
	}
	return regression.calculateCoefficients();
}
exports.linerRegression = (x,y) => runLinerRegression(x,y);
