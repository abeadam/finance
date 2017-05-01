function generateTemplate(legend, dataFile) {
	const titles = legend.reduce((last, val, loc) => {
		let oneSeries = `"${dataFile}" using 1:${loc+2} with lines title "${val}" `;
		last.push(oneSeries);	
		return last;
	}, []).join(',');
	const template = `set terminal png
	set output "chart.png"
	set timefmt '%Y-%m-%d'
	set xdata time
	plot ${titles}`
	return template;
}

exports.templateFunctions = {
	generateTemplate
};


