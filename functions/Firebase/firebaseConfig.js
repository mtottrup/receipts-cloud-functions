const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const STORAGE_BUCKET_NAME = 'receipts-demo.appspot.com';
const firestore = admin.firestore();
const storageBucket = admin.storage().bucket(STORAGE_BUCKET_NAME);

module.exports = { functions, firestore, STORAGE_BUCKET_NAME, storageBucket, admin };
