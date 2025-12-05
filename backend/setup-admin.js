const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bus-booking', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

db.once('open', async () => {
  try {
    // Update admin user role
    const result = await db.collection('users').updateOne(
      { email: 'admin@busbooking.com' },
      { $set: { role: 'admin' } }
    );

    console.log('✅ Admin user updated successfully!');
    console.log('Matched count:', result.matchedCount);
    console.log('Modified count:', result.modifiedCount);

    // Get admin user details
    const adminUser = await db.collection('users').findOne({ email: 'admin@busbooking.com' });
    
    if (adminUser) {
      console.log('\n========================================');
      console.log('📋 ADMIN USER DETAILS');
      console.log('========================================');
      console.log('Name:', adminUser.name);
      console.log('Email:', adminUser.email);
      console.log('User ID:', adminUser._id);
      console.log('Role:', adminUser.role);
      console.log('Created:', adminUser.createdAt);
      console.log('========================================\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
});
