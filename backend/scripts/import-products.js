const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const connectDB = require('../config/db');

// Load env vars
dotenv.config();

const importData = async () => {
  try {
    // 1. Connect to DB
    await connectDB();

    // 2. Read JSON file
    const filePath = path.join(__dirname, '..', 'products_schema_name_fixed.json');
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`Successfully read ${data.length} products from JSON file.`);

    // 3. Clear existing product data
    // We are NOT clearing Admins, only products as per the plan.
    await Product.deleteMany({});
    console.log('Cleared existing product data...');

    // 4. Insert data
    await Product.insertMany(data);
    console.log('Products imported successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error with data import:');
    console.error(error);
    process.exit(1);
  }
};

importData();
