const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load .env variables
dotenv.config({ path: './config/config.env' });

// Load Models
const Ticket = require('./models/Ticket');
const Project = require('./models/Project');
const User = require('./models/User');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

//  Read JSON files
const tickets = JSON.parse(fs.readFileSync(`${__dirname}/_data/tickets.json`, 'utf-8'));
const projects = JSON.parse(fs.readFileSync(`${__dirname}/_data/projects.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));

// Import data into database
const importData = async () => {
    try {
        await Ticket.create(tickets);
        await Project.create(projects);
        await User.create(users);
    
        console.log('Data imported...'.green.inverse);
        process.exit();        
    } catch (err) {
        console.error(err);
    }
}

// Delete data from database
const deleteData = async () => {
    try {
        await Ticket.deleteMany();
        await Project.deleteMany();
        await User.deleteMany();

        console.log('Data deleted...'.red.inverse);
        process.exit();  
    } catch (err) {
        console.error(err);
    }
}


if (process.argv[2] === '-i') {
    importData();
  } else if (process.argv[2] === '-d') {
    deleteData();
  }