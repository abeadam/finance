const request = require('request');
const dataSettings = require("./config.json"); 
//const url = `https://${dataSettings.url}?q=select%20${dataSettings.selector}%20from%20yahoo.finance.%20historicaldata%20where%20symbol%20in%20(${Object.keys(dataSettings.symbols).concat(dataSettings.extraSymbols).map(symbol=>'"'+symbol+'"').join('%2C')})%20and%20startDate%20%3D%20"${dataSettings.startDate}"%20and%20endDate%20%3D%20"${dataSettings.endDate}"%0A%09%09&format=json&env=http%3A%2F%2Fdatatables.org%2Falltables.env&callback=`;
const selectStr = `select ${dataSettings.selector} from yahoo.finance.historicaldata where symbol in (${Object.keys(dataSettings.symbols).concat(dataSettings.extraSymbols).map(symbol=>'"'+symbol+'"').join(',')})and startDate = "${dataSettings.startDate}" and endDate = "${dataSettings.endDate}"`;
const encodedSelectStr = encodeURIComponent(selectStr);
const unencodedUrl = `${dataSettings.url}?q=${encodedSelectStr}&format=json&diagnostics=true&env=store://datatables.org/alltableswithkeys`;
const url = `https://${unencodedUrl}`;
const liveUpdateUrl = `${dataSettings.liveUpdateUrl}${Object.keys(dataSettings.symbols).map(stock=>dataSettings.liveConv[stock]?dataSettings.liveConv[stock]:stock).join(',')}`;
const jsonQuery = require('json-query');

function getData(url, preParseFn=d=>d) {
	return new Promise ( function (resolve, reject) {
		request(url, (error, response, body) => {
			if (!error&response.statusCode == 200) {
				resolve(JSON.parse(preParseFn(body)));
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

function getLiveUpdate() {
	return	getData(liveUpdateUrl,data=>data.substr(4))
		.then((result)=> {
			const liveResult = new Map();
			const changes = [];
			result.forEach((data) => {
				let symbol = data.t;
				let change = parseFloat(data.cp);	
				liveResult.set(symbol,change);
				changes.push(change);
			});
			return { liveResult, changes };
		});
	
}

function getPrices(data) {
	debugger;
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
		group: function (input) {
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
			yield [key, results[key]];
		}
	};
	return new Map(results);
}

function removeMissingDates(data, symbols) {
	let filteredData = [];
	for (let [date, info] of data) {
		let stocks = info.reduce((list, info) => { 
			list.push(info.Symbol);
			return list;
		}, []);
		let keepInfo = symbols.every(symbol=>stocks.includes(symbol));
		if (keepInfo) {
			filteredData.push({[date]: info});
		} 	
	}
	return filteredData;
}

function mapKeyToValues(data, symbols) {
	let results = new Map();
	const dates = [];
	symbols.forEach(symbol=>results.set(symbol,[]));
	data.forEach(info=> {
		const date = Object.keys(info)[0];
		dates.push(date);
		var {[date]: values} = info;
		values.forEach(info => {
			if (results.has(info.Symbol)) {
				results.get(info.Symbol).push(info.Close);
			}
		});
	});
	return [dates, results];
}

function mapDifferences (data) {
	const differences = new Map();
	function getDiff (prices) {
		let results = [];
		prices = prices.reverse();	
		for (let loc = 1; loc < prices.length ; loc++) {
			let diff = (Math.log(prices[loc-1])-Math.log(prices[loc]))*100;
			if (diff === Infinity) {
				throw new Error('stock with value null');
			}
			results.push(diff);
		}
		return results;
	}	
	data.forEach((value, key)=>{
		differences.set(key, getDiff(value));
	});
	return differences;
}

const fullSymbolList = Object.getOwnPropertyNames(dataSettings.symbols).concat(dataSettings.extraSymbols); 
let result = getData(url)
.then(result=>getPrices(result, fullSymbolList))
.then((data)=>removeMissingDates(data, fullSymbolList))
.then(data=>mapKeyToValues(data, fullSymbolList))
.then(([dates, result])=>{
	dates.pop();
	dates.reverse();
	return [dates, mapDifferences(result)];
})
.catch(e => console.error(e));

exports.priceDifferencePromise = result;
exports.getLiveData = getLiveUpdate;
