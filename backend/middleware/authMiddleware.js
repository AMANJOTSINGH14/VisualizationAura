const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
const serviceAccount = require('../config/visualization-8f7a2-firebase-adminsdk-u66rx-6414c75176.json');

admin.initializeApp({
  // @ts-ignore
  credential: admin.credential.cert(serviceAccount)
});
console.log(serviceAccount)
}

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token); // Verify token
    
    req.user = decodedToken; // Attach user info to the request
    console.log(req.user,"dslkslkds line 50")
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = authenticate;
