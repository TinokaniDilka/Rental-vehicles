// backend/jobs/overdueJob.js
const Booking = require('../models/Booking');
const { getIO } = require('../socket');

async function runOverdueJob() {
  try {
    const now = new Date();
    const bookings = await Booking.find({
      status: { $nin: ['completed', 'cancelled', 'overdue'] },
      endDate: { $lt: now }
    });
    if (!bookings.length) return;
    const ids = bookings.map(b => b._id);
    await Booking.updateMany({ _id: { $in: ids } }, { $set: { status: 'overdue' } });
    const io = getIO();
    bookings.forEach(b => io.emit('booking:update', b));
    console.log(`Overdue job: marked ${bookings.length} bookings as overdue`);
  } catch (err) {
    console.error('Overdue job error:', err);
  }
}

module.exports = runOverdueJob;
