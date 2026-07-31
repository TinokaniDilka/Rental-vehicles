// backend/tasks/scheduleOverdue.js
const cron = require('node-cron');
const runOverdueJob = require('../jobs/overdueJob');

// Schedule job to run every hour at minute 0
cron.schedule('0 * * * *', () => {
  console.log('Running overdue job...');
  runOverdueJob();
});

module.exports = {}; // placeholder export
