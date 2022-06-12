const ocrFunctions = require('./utils/ocrFunctions');
const parsingFunctions = require('./utils/parsingFunctions');
const fireStoreFunctions = require('./Firebase/firestoreFunctions');

async function processImage(object) {
	const imageOcr = await ocrFunctions.ocrImage(object.name);
	const parseData = await parsingFunctions.parseAll(imageOcr);

	const createObject = {
		object: object,
		collectionName: 'documents',
		ocr: imageOcr,
		...(parseData.matchedString.name && {
			name: parseData.matchedString.name,
		}),
		...(parseData.matchedString.category && {
			category: parseData.matchedString.category,
		}),
		...(parseData.date && {
			date: parseData.date,
		}),
		...(parseData.total && {
			total: parseFloat(parseData.total),
		}),
	};

	return fireStoreFunctions.addDocument(createObject);
}

function processPdf(object) {
	fireStoreFunctions.addDocument({
		object: object,
		collectionName: 'documents',
		ocr: '',
	});

	ocrFunctions.ocrPdf(object.name);
}

async function processJson(object) {
	const pdfOcr = await ocrFunctions.getTextFromJson(object);
	console.log('ODF OCR', pdfOcr);
	const parseData = await parsingFunctions.parseAll(pdfOcr);

	let searchName = object.name;
	const cutIndex = searchName.indexOf('output-1-');
	searchName = searchName.substring(9, cutIndex);

	searchObject = {
		collectionName: 'documents',
		searchField: 'storageFileName',
		searchName: searchName,
		ocr: pdfOcr,
		...(parseData.matchedString.name && {
			name: parseData.matchedString.name,
		}),
		...(parseData.matchedString.category && {
			category: parseData.matchedString.category,
		}),
		...(parseData.date && {
			date: parseData.date,
		}),
		...(parseData.total && {
			total: parseInt(parseData.total),
		}),
	};

	return fireStoreFunctions.matchAndUpdateDocument(searchObject);
}

module.exports = { processImage, processPdf, processJson };
