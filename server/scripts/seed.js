import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';

const SEED_USERS = [
  { name: 'Test User', email: 'testuser@example.com', password: 'Test@1234', role: 'user' },
  { name: 'Admin User', email: 'admin@example.com', password: 'Admin@1234', role: 'admin' },
];

async function seedUsers() {
  const users = {};
  for (const seed of SEED_USERS) {
    let user = await User.findOne({ email: seed.email });
    if (user) {
      console.log(`User already exists: ${seed.email}`);
    } else {
      user = await User.create(seed);
      console.log(`Created user: ${seed.email}`);
    }
    users[seed.email] = user;
  }
  return users;
}

async function seedTasks(users) {
  const existingCount = await Task.countDocuments();
  if (existingCount > 0) {
    console.log(`Tasks collection already has ${existingCount} documents, skipping task seed.`);
    return;
  }

  const testUser = users['testuser@example.com'];
  const adminUser = users['admin@example.com'];

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const tasks = [
    { title: 'Set up project repository', description: 'Initialize client and server scaffolding.', priority: 'High', status: 'Completed', dueDate: new Date(now - 5 * day), assignedTo: testUser._id, createdBy: adminUser._id },
    { title: 'Design database schema', description: 'Define User and Task Mongoose models.', priority: 'High', status: 'Completed', dueDate: new Date(now - 3 * day), assignedTo: adminUser._id, createdBy: adminUser._id },
    { title: 'Build authentication API', description: 'Register, login, JWT middleware.', priority: 'High', status: 'In Progress', dueDate: new Date(now + 1 * day), assignedTo: testUser._id, createdBy: adminUser._id },
    { title: 'Build task CRUD API', description: 'Create, read, update, delete endpoints for tasks.', priority: 'Medium', status: 'In Progress', dueDate: new Date(now + 2 * day), assignedTo: adminUser._id, createdBy: testUser._id },
    { title: 'Implement dashboard UI', description: 'Sidebar, navbar, and summary cards.', priority: 'Medium', status: 'Pending', dueDate: new Date(now + 4 * day), assignedTo: testUser._id, createdBy: testUser._id },
    { title: 'Add search and filters', description: 'Search by title, filter by status/priority, sort by date.', priority: 'Low', status: 'Pending', dueDate: new Date(now + 6 * day), assignedTo: testUser._id, createdBy: adminUser._id },
    { title: 'Write API documentation', description: 'Document all endpoints in the README.', priority: 'Low', status: 'Pending', dueDate: new Date(now + 7 * day), assignedTo: adminUser._id, createdBy: adminUser._id },
    { title: 'Prepare deployment config', description: 'Vercel, Render, and Atlas configuration.', priority: 'Medium', status: 'Pending', dueDate: new Date(now + 8 * day), assignedTo: adminUser._id, createdBy: testUser._id },
  ];

  await Task.insertMany(tasks);
  console.log(`Created ${tasks.length} sample tasks.`);
}

async function run() {
  let exitCode = 0;
  try {
    await connectDB();
    const users = await seedUsers();
    await seedTasks(users);
    console.log('Seed complete.');
  } catch (err) {
    console.error('Seed failed:', err);
    exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
  process.exit(exitCode);
}

run();
