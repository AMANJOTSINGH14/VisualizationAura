const neo4j = require('neo4j-driver');
require('dotenv').config();  // Load environment variables
require('dotenv').config({ path: './backend/.env' });
const URI = process.env.NEO4J_URI; // From .env file
const USER = process.env.NEO4J_USER;
const PASSWORD = process.env.NEO4J_PASSWORD;
console.log(process.env.NEO4J_USER,"DSD")
let driver;

try {
  driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
  driver.getServerInfo().then(info => {
    console.log('Connected to Neo4j:', info);
  }).catch(err => {
    console.error('Neo4j Connection Error:', err);
  });
} catch (err) {
  console.error(` Failed to connect to Neo4j\n${err}\nCause: ${err.cause}`);
}

// Create a session (used in queries)
const session = driver.session();

module.exports = { driver, session };
