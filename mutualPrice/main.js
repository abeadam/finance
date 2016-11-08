const data = require('./getData.js');
const ml = require('./ml.js');
const dataSettings = require('./config.json');
function main (priceDiff) {
	debugger;
	const listOfStocks = [];
	const indicators = Object.keys(dataSettings.symbols).concat(dataSettings.possibleSymbols);
	const x = priceDiff.filter((entry) => {
		let keys = Object.keys(entry);
		return indicators.includes(keys[0]);
	}).map((entry)=> {
		const keys = Object.keys(entry);
		listOfStocks.push(keys[0]);
		return entry[keys[0]];
	});
	const target = dataSettings.target;
	const y = (priceDiff.filter((entry)=> entry[target]?true:false))[0][target];
	
	let loc = 0;
	console.log(ml.linerRegression(x, y).map((i)=>{
		let result = {};
		result[listOfStocks[loc++]] = i[0]*100;
		return result;
	}));
}
data.priceDifferencePromise.then(main);
