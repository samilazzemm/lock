const mongoose = require('mongoose');
const User = require('./models/User');  // Path to your User model

async function generateLogs() {
  // Connect to the database
  await mongoose.connect('mongodb+srv://dridimeding15:ttQi9aV7PPgQjCAA@smartdoor.fiswsqp.mongodb.net/?retryWrites=true&w=majority&appName=smartdoor', { useNewUrlParser: true, useUnifiedTopology: true });

  // List of users to search for in the logs
  const userNames = ['admin', 'ClientUser', 'amin', 'AdminUser', 'client'];

  for (const name of userNames) {
    const user = await User.findOne({ name });  // Use 'name' or '_id' depending on your schema
    if (!user) {
      console.log(`User ${name} not found`);
    } else {
      console.log(`User ${name} found: ${user._id}`);
      
      // Your logic for generating logs (insert logs into the database)
      // Example:
      const log = new Log({
        userId: user._id,
        status: 'opened',  // Example status, modify as needed
        timestamp: new Date()
      });
      await log.save();
      console.log(`Log for ${name} created`);
    }
  }

  // Close connection
  mongoose.connection.close();
}

generateLogs();
