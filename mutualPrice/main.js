const data = require('./getData.js');
const ml = require('./ml.js');
const dataSettings = require('./config.json');

process.on('uncaughtException', (err) => {
  console.log(err);
});

function getXValues(priceDiffMap, symbols) {
	if (!priceDiffMap.size) {
		throw new Error('Empty price map');
	}
	const length = [...priceDiffMap.values()][0].length;
	const x = [];
	for (let loc = 0 ; loc < length ; loc++) {
		x.push([]);
	}
	priceDiffMap.forEach((value, key)=> {
		if (symbols.includes(key)) {
			value.forEach((price, loc) => x[loc].push(price));
		}
	});
	return x;
}

function main (priceDiffMap) {
	const symbols = Object.keys(dataSettings.symbols);
	let x = getXValues(priceDiffMap, symbols);
	const target = dataSettings.target;
	const y = priceDiffMap.get(target);
	console.log(ml.linerRegression(x, y).map((value, key) => {
		return {[symbols[key]]: value};
	}));
}
data.priceDifferencePromise.then(main);
