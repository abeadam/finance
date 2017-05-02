const fs = require('fs');
const template = require('./templateMain');
class GeneratePlot {
	constructor (outputFileName, dates, priceMap) {
		this.keys = priceMap.keys();
		this.outputFileName = outputFileName;
		this.plotData = Array.from(dates).map(x=>[x]);
		for ( let [key, val] of priceMap) {
			val.forEach((val, index)=>{
				this.plotData[index].push(val);
			});
		}
	}

	generatePlotFile() {
		const plotFile = template.templateFunctions.generateTemplate([...this.keys], this.outputFileName);
		return new Promise ((resolve,reject)=> {
			fs.writeFile('plot.plg',
					plotFile,
					"utf8",
					 (err) => {
						if (err) {
							reject(err);
						} else {
							resolve();
						}
					}
				);
		});
	}

	generatePlotData() {
		return new Promise((resolve, reject)=> {
			const fileData = this.plotData.reduce((last, current, count) => {
				last.push(current.join(' '));
				return last;
			}, []);
			fs.writeFile(this.outputFileName, 
				fileData.join('\n'),
				"utf8",
				(err) => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}	
				});
		});	
	}
}

exports.GeneratePlot = GeneratePlot;
