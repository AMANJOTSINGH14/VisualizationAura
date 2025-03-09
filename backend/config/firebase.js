const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const admin = require('firebase-admin');

const serviceAccount = require('./visualization-8f7a2-firebase-adminsdk-u66rx-6414c75176.json');

initializeApp({
  // @ts-ignore
  credential: admin.credential.cert(serviceAccount)
});

module.exports = { auth: getAuth() };
