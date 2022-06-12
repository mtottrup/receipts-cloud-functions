const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();
const { Storage } = require('@google-cloud/storage');

const firebaseConfig = require('../Firebase/firebaseConfig');
const storageBucketName = firebaseConfig.STORAGE_BUCKET_NAME;
const filesBucketPath = `gs://${storageBucketName}/files/`;
const filesBucketLength = filesBucketPath.length;
const pdfBucketPath = `gs://${storageBucketName}/pdfFiles/`;

async function ocrImage(fileName) {
	const imageLink = `gs://${storageBucketName}/${fileName}`;

	const [result] = await client.textDetection(imageLink);
	const [fullText] = result.textAnnotations ? result.textAnnotations : [null];
	const res = fullText === null ? '' : fullText.description;
	return res;
}

async function ocrPdf(fileName) {
	const link = `gs://${storageBucketName}/${fileName}`;

	const inputConfig = {
		// Supported mime_types are: 'application/pdf' and 'image/tiff'
		mimeType: 'application/pdf',
		gcsSource: {
			uri: link,
		},
	};
	const outputConfig = {
		gcsDestination: {
			uri: `${pdfBucketPath}${link.substring(filesBucketLength)}`,
		},
	};
	const features = [{ type: 'DOCUMENT_TEXT_DETECTION' }];
	const request = {
		requests: [
			{
				inputConfig: inputConfig,
				features: features,
				outputConfig: outputConfig,
			},
		],
	};

	const [operation] = await client.asyncBatchAnnotateFiles(request);
	const [filesResponse] = await operation.promise();
	const destinationUri = filesResponse.responses[0].outputConfig.gcsDestination.uri;
	console.log('Json saved to: ' + destinationUri);
}

async function getTextFromJson(object) {
	const jsonFile = await new Storage().bucket(object.bucket).file(object.name).download();

	const parsedJson = JSON.parse(jsonFile);
	var responesArray = [];

	for (let i = 0; i < parsedJson.responses.length; i++) {
		responesArray.push(JSON.stringify(parsedJson.responses[i].fullTextAnnotation.text));
	}

	const deleteFile = new Storage().bucket(object.bucket).file(object.name);

	deleteFile.delete();

	let joinedResponses = responesArray.join();

	if (joinedResponses.charAt(0) === '"') {
		joinedResponses = joinedResponses.substring(1);
	}

	if (joinedResponses.slice(-1) === '"') {
		joinedResponses = joinedResponses.slice(0, -1);
	}

	joinedResponses = joinedResponses.replace(/,/g, '');
	joinedResponses = joinedResponses.replace(/\\n/g, ' ');
	return joinedResponses;
}
module.exports = { ocrImage, ocrPdf, getTextFromJson };
