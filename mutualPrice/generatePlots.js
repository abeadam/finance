const fs = require('fs');
class GeneratePlot {
	constructor (outputFileName, inputFileName, ...data) {
		this.outputFileName = outputFileName;
		this.inputFileName = inputFileName;
		this.plotData = [...data];
	}

	generatePlotFile() {
		return new Promise((resolve, reject)=> {
			const fileData = this.plotData.reduce((last, current) => {
				last.push(current.join(','));
				return last;
			}, []);
			fs.writeFile(this.outputFileName, 
				fileData.join('\n'),
				"utf8",
				(err) => {
					if (err) {
						reject(err);
					}	
				});
		});	
	}
}

exports.GeneratePlot = GeneratePlot;
