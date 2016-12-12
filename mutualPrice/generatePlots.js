const fs = require('fs');
class generatePlot {
	constructor (outputFileName, inputFileName, ...data) {
		this.outputFileName = outputFileName;
		this.inputFileName = inputFileName;
		this.plotData = [...data];
	}

	generatePlotFile() {
		return new Promise((resolve, reject)=> {
			fs.writeFile(this.outputFileName, 
				this.plotData.reduce((last, current) => {
					last.push(current.join(','));
					return last;
				}, []).join('\n'),
				"utf8",
				(err) => {
					if (err) {
						reject(err);
					}	
				});
		});	
	}
}

exports = generatePlot;
