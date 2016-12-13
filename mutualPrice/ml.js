const smr = require('smr');
function runLinerRegression(x,y) {
	let listLength = x[0].length;
	x.forEach((x)=>{ if (x.length!==listLength){ throw Error('wrong length for some length')}});
	if (x.length !== y.length) { throw Error('y and x have different length'); }
	let regression = new smr.Regression({ numX: listLength, numY: 1 });
	for (let day = 0 ; day < x.length ; day++) {
		regression.push({x:x[day], y:[y[day]]});	
	}
	const coef = regression.calculateCoefficients();
	return {
		coef: coef,
		regression
	}
}
exports.linerRegression = (x,y) => runLinerRegression(x,y);
