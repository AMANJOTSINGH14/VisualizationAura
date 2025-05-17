console.log('Loading .env file from:', require('path').resolve(__dirname, '/.env'));
require('dotenv').config({ path: './backend/.env' });
console.log(process.env.NEO4J_PASSWORD)
console.log(process.env.NEO4J_USER)
console.log(process.env.NEO4J_URI)
const express = require('express');
const cors = require('cors');
const { driver } = require('./config/neo4j');
const userRoutes = require('./routes/userRoutes');
const cardRoutes = require('./routes/cardRoutes');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://visualization-aura.vercel.app'],
  methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
}));

app.use(express.json());

app.use('/api/user', userRoutes); 
app.use('/api/cards', cardRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT =  parseInt(process.env.PORT || '5000', 10); 
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

// Close Neo4j driver on exit
process.on('exit', async () => {
  await driver.close();
});

