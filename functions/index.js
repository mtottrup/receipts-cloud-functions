const functions = require('firebase-functions');
const processors = require('./processors');

exports.uploadFile = functions.storage.object().onFinalize(async object => {
	if (object.name.indexOf('files/') === 0) {
		if (object.contentType === 'application/pdf') {
			processors.processPdf(object);
		} else if (object.contentType === 'image/jpeg' || object.contentType === 'image/png') {
			processors.processImage(object);
		}
	} else if (object.name.indexOf('pdfFiles/') === 0) {
		processors.processJson(object);
	}
});
