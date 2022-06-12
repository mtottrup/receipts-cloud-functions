const firebaseConfig = require('./firebaseConfig.js');
const firestore = firebaseConfig.firestore;

function addDocument(data) {
	firestore.collection(data.collectionName).add({
		storageFileName: data.object.name,
		fileType: data.object.contentType,
		dateUploaded: new Date(),
		ocr: data.ocr,
		documentType: '',
		exported: false,
		reviewed: false,
		ref: '',
		...(data.name && {
			name: data.name,
		}),
		...(data.category && {
			category: data.category,
		}),
		...(data.date && {
			date: firebaseConfig.admin.firestore.Timestamp.fromDate(data.date),
		}),
		...(data.total && {
			total: data.total,
		}),
	});
}

function matchAndUpdateDocument(data) {
	return firestore
		.collection(data.collectionName)
		.where(data.searchField, '==', `files/${data.searchName}`)
		.limit(1)
		.get()
		.then(query => {
			const document = query.docs[0];
			let temp = document.data();
			if (data.ocr) temp.ocr = data.ocr;
			if (data.name) temp.name = data.name;
			if (data.category) temp.category = data.category;
			if (data.date) temp.date = firebaseConfig.admin.firestore.Timestamp.fromDate(data.date);

			if (data.total || !data.total === null) temp.total = data.total;
			document.ref.update(temp);
		});
}

module.exports = { addDocument, matchAndUpdateDocument };
