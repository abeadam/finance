const request = require('request');
const dataSettings = require("./config.json"); 
const url = `${dataSettings.url}?q=select%20${dataSettings.selector}%20from%20yahoo.finance.%20historicaldata%20where%20symbol%20in%20(${Object.keys(dataSettings.symbols).concat(dataSettings.extraSymbols).map(symbol=>'"'+symbol+'"').join('%2C')})%20and%20startDate%20%3D%20"${dataSettings.startDate}"%20and%20endDate%20%3D%20"${dataSettings.endDate}"%0A%09%09&format=json&env=http%3A%2F%2Fdatatables.org%2Falltables.env&callback=`;

function getData(url) {
	debugger;
	return new Promise ( function (resolve, reject) {
		request(url, (error, response, body) => {
			if (!error&response.statusCode == 200) {
				resolve(JSON.parse(body));
			} else {
				if (error) {
					reject(error);
				} else {
					reject(new Error(`status code:${response.statusCode}`));
				}
			}
		});
	});
}	 

function getPrices(data, symbols) {
	const results = data.query.results.quote;
	const resultMap = new Map();
	for (let symbol of symbols) {
		resultMap.set(symbol,[]); 
	}
	for (let stock of results ) {
		resultMap.get(stock.Symbol).push(stock.Close);
	}
	return resultMap;
}

function getDiff(prices) {
	let results = [];
	for (let loc = 1; loc < prices.length ; loc++) {
		let diff = (Math.log(prices[loc-1])-Math.log(prices[loc]))*100;
		if (diff === Infinity) {
			throw new Error('stock with value null');
		}
		results.push(diff);
	}
	return results;
}

let result = getData(url).then(result=>getPrices(result, Object.keys(dataSettings.symbols).concat(dataSettings.extraSymbols))).then(result=>filterResult(result));

function filterResult (data) {
	const target = dataSettings.target;
	const differences = [...data.entries()].map(([key, value])=>{
		let result = {};
		result[key]=getDiff(value);
		return result;
	});
	return differences;
}
exports.priceDifferencePromise = result;
