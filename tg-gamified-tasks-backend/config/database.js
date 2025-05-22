const mongoose = require('mongoose');
require('dotenv').config(); 

const MONGO_URI = process.env.MONGO_URI;  

if (!MONGO_URI) {
  console.error('Lỗi: Biến môi trường MONGO_URI chưa được đặt.');
  process.exit(1);  
}

const connectDB = async () => {
  try {
     
    const mongooseOptions = {
      serverSelectionTimeoutMS: 5000, 
      socketTimeoutMS: 45000, 
    };

    console.log('🔄 Đang kết nối tới MongoDB...');
    await mongoose.connect(MONGO_URI, mongooseOptions);
  } catch (error) {
    console.error(`Lỗi kết nối MongoDB: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => {
  console.log(`Kết nối MongoDB thành công tại: ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`Lỗi MongoDB sau khi kết nối: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Đã ngắt kết nối MongoDB.');
});
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Ngắt kết nối MongoDB do ứng dụng tắt.');
  process.exit(0);
});

module.exports = connectDB;