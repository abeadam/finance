const request = require('request');
const dataSettings = require("./config.json"); 
const url = `${dataSettings.url}?q=select%20${dataSettings.selector}%20from%20yahoo.finance.%20historicaldata%20where%20symbol%20in%20(${Object.keys(dataSettings.symbols).concat(dataSettings.extraSymbols).map(symbol=>'"'+symbol+'"').join('%2C')})%20and%20startDate%20%3D%20"${dataSettings.startDate}"%20and%20endDate%20%3D%20"${dataSettings.endDate}"%0A%09%09&format=json&env=http%3A%2F%2Fdatatables.org%2Falltables.env&callback=`;
const jsonQuery = require('json-query');

function getData(url) {
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
	const helpers = {
		select: function (input, ...toSelect) {
	   		return input.map(s=> {
				let obj = {};
				for (let param of toSelect) {
					obj[param]=s[param];
				}
				return obj;
			});
	 	},
		map: function (input, key) {
			return input.map(s=>{
				let obj = {};
				obj[s[key]]=s;
				return obj;
			});
	  	},
		group: function (input, key) {
			let groups = new Map();
			input.forEach((data)=> {
				let key = Object.keys(data)[0];
				if (groups.has(key)) {
					groups.get(key).add(data[key]);
				} else {
					groups.set(key, new Set([data[key]]));
				}
			});
			let obj = {};
			for (let [k,v] of groups) {
				obj[k] = [...v];
			}
			return obj;
		}
	};
	const results = jsonQuery(dataSettings.jsonSelector,
	{data: data, locals: helpers }).value;
	results[Symbol.iterator] = function * () {
		let keys = Object.getOwnPropertyNames(results).sort((a,b)=>{
			a = new Date(a);
			b = new Date(b);
			return a - b;
		});
		for ( let key of keys) {
			yield {[key]:results[key]};
		}
	}
	debugger;
	return results;
}

function removeMissingDates(data, symbols) {
	let filteredData = [];
	debugger;
	for (let [date, info] of data) {
		let stocks = info.reduce((list, info) => list.push(info.Symbol), []);
		let keepInfo = symbols.every((symbol)=>stocks.include(symbol));
		if (keepInfo) {
			filteredData.push({[date]: info});
		}
	}
	debugger;
	return filteredData;
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

function filterResult (data) {
	const target = dataSettings.target;
	const differences = [...data.entries()].map(([key, value])=>{
		let result = {};
		result[key]=getDiff(value);
		return result;
	});
	return differences;
}

let result = getData(url)
.then(result=>getPrices(result, Object.keys(dataSettings.symbols).concat(dataSettings.extraSymbols)))
.then((data)=>removeMissingDates(data, dataSettings.symbols))
.then(result=>filterResult(result));

exports.priceDifferencePromise = result;
