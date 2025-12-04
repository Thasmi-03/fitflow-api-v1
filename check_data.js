import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkData = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitflow';
    console.log('Connecting to:', uri.replace(/\/\/.*@/, '//***@')); // Mask credentials

    await mongoose.connect(uri);
    console.log('Connected to DB');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:');
    collections.forEach(c => console.log(`- ${c.name}`));

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkData();
