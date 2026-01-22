const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');
const Product = require('./models/Product');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Initial data
const products = [
  {
    "name": { "ar": "صابون أطباق سائل", "en": "Liquid Dish Soap" },
    "price": 25,
    "description": { "ar": "تركيبة قوية لإزالة الدهون والشحوم", "en": "Powerful grease-cutting formula" },
    "image": "images/dish-soap.svg",
    "category": "kitchen",
    "inStock": true
  },
  {
    "name": { "ar": "مسحوق غسيل الملابس", "en": "Laundry Powder" },
    "price": 85,
    "description": { "ar": "نظافة فائقة وعطر منعش للملابس", "en": "Superior cleaning with fresh fragrance" },
    "image": "images/laundry-powder.svg",
    "category": "laundry",
    "inStock": true
  },
  {
    "name": { "ar": "منظف أرضيات", "en": "Floor Cleaner" },
    "price": 35,
    "description": { "ar": "لمعان وتعقيم للأرضيات", "en": "Shiny and sanitized floors" },
    "image": "images/floor-cleaner.svg",
    "category": "floor",
    "inStock": true
  },
  {
    "name": { "ar": "منظف زجاج", "en": "Glass Cleaner" },
    "price": 30,
    "description": { "ar": "نظافة ولمعان بدون خطوط", "en": "Streak-free shine" },
    "image": "images/glass-cleaner.svg",
    "category": "kitchen",
    "inStock": true
  },
  {
    "name": { "ar": "مطهر متعدد الأغراض", "en": "Multi-Purpose Disinfectant" },
    "price": 40,
    "description": { "ar": "يقضي على 99.9% من الجراثيم", "en": "Kills 99.9% of germs" },
    "image": "images/disinfectant.svg",
    "category": "bathroom",
    "inStock": true
  },
  {
    "name": { "ar": "منعم الملابس", "en": "Fabric Softener" },
    "price": 45,
    "description": { "ar": "نعومة فائقة وعطر يدوم طويلاً", "en": "Extra soft with long-lasting fragrance" },
    "image": "images/fabric-softener.svg",
    "category": "laundry",
    "inStock": true
  },
  {
    "name": { "ar": "منظف الحمام", "en": "Bathroom Cleaner" },
    "price": 38,
    "description": { "ar": "إزالة الجير والترسبات", "en": "Removes limescale and deposits" },
    "image": "images/bathroom-cleaner.svg",
    "category": "bathroom",
    "inStock": true
  },
  {
    "name": { "ar": "سائل غسيل الملابس", "en": "Liquid Laundry Detergent" },
    "price": 75,
    "description": { "ar": "تنظيف عميق للملابس الملونة والبيضاء", "en": "Deep cleaning for colors and whites" },
    "image": "images/liquid-detergent.svg",
    "category": "laundry",
    "inStock": true
  }
];

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Admin.deleteMany();
    await Product.deleteMany();

    console.log('Data destroyed...');

    // Create Admin
    const admin = await Admin.create({
      email: process.env.ADMIN_EMAIL || 'admin@elsahaba.com',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    });

    console.log(`Admin created: ${admin.email}`);

    // Create Products
    await Product.insertMany(products);

    console.log('Products imported...');

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
