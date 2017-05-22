const data = require('./getData.js');
const ml = require('./ml.js');
const dataSettings = require('./config.json');
const Plot = require('./generatePlots.js').GeneratePlot;

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
	// Add 1 to all the x's for the x intercept
	
	return x;
}

function main ([dates, priceDiffMap]) {
	const symbols = Object.keys(dataSettings.symbols);
	let x = getXValues(priceDiffMap, symbols);
	const target = dataSettings.target;
	const y = priceDiffMap.get(target);
	const model = ml.linerRegression(x, y);
	console.log(model.coef.map((value, key) => {
		return {[symbols[key]]: value};
	}));
	console.log(model.regression.hypothesize({x :x[0]}));
	data.getLiveData().then(result=>{
		console.log("prediction:",model.regression.hypothesize({x:result.changes}));
	});
	const plotter = new Plot('stockData.dat', dates, priceDiffMap);
	Promise.all(
		[plotter.generatePlotFile(),
		plotter.generatePlotData()])
	.then(()=> {
		plotter.generatePlotChart();
	}).catch((err)=>{
		console.error(err)
	});
}
data.priceDifferencePromise.then(main);
