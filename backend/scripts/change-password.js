const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');

// Load env vars
dotenv.config({ path: './backend/.env' }); // try backend path first
dotenv.config(); // fallback to root

const newPassword = process.argv[2];

if (!newPassword) {
  console.error('❌ Please provide a new password as an argument.');
  console.error('Usage: node backend/scripts/change-password.js <new_password>');
  process.exit(1);
}

const updatePassword = async () => {
  try {
    await connectDB();

    const admin = await Admin.findOne();
    if (!admin) {
      console.error('❌ Admin user not found. Run "npm run seed" first.');
      process.exit(1);
    }

    admin.password = newPassword;
    await admin.save();

    console.log('✅ Admin password updated successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error updating password:', error);
    process.exit(1);
  }
};

updatePassword();
