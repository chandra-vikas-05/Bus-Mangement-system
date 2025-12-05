const mongoose = require('mongoose');

const EMAIL = process.argv[2] || 'testadmin@example.com';

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
    const result = await db.collection('users').updateOne(
      { email: EMAIL },
      { $set: { role: 'admin' } }
    );

    console.log('Promote result:', result);

    const user = await db.collection('users').findOne({ email: EMAIL });
    console.log('User after update:', user);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
});