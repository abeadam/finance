const fs = require('fs');
const template = require('./templateMain');
const exec = require('child_process').exec;
const plotFileName = 'plot.plg';
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

	generatePlotChart() {
		debugger;
		return new Promise ((resolve, reject) => {
			exec(`gnuplot ${plotFileName}`, (err, stdout) =>{
				if (err) {
					reject(err);
					return;
				}
				resolve(stdout);
			});
		});
	}

	generatePlotFile() {
		const plotFile = template.templateFunctions.generateTemplate([...this.keys], this.outputFileName);
		return new Promise ((resolve,reject)=> {
			fs.writeFile(plotFileName,
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
