const { FieldValue } = require('firebase-admin/firestore');
const { db } = require('../../config/firebaseAdmin');

const AvailabilityController = async (req, res) => {
  if (req.method === 'POST') {
    const {
      instructorId,
      instructorName,
      email,
      contact,
      date,
      startTime,
      endTime,
      classType,
    } = req.body;

    // Validate that all fields are provided
    if (!instructorId || !instructorName || !email || !contact || !date || !startTime || !endTime || !classType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      // Reference to the instructor document in the 'users' collection
      const docRef = db.collection('users').doc(instructorId);
      const docSnapshot = await docRef.get();

      if (!docSnapshot.exists) {
        return res.status(404).json({ message: 'Instructor not found' });
      }

      const userData = docSnapshot.data();

      // Check for existing availability conflict in 'users' collection
      const existingUserAvailability = (userData.availabilities || []).find(availability =>
        availability.date === date &&
        availability.startTime === startTime &&
        availability.endTime === endTime
      );

      // Check for existing availability conflict in 'bookings' collection
      const bookingQuerySnapshot = await db.collection('bookings')
        .where('instructorId', '==', instructorId)
        .where('date', '==', date)
        .where('startTime', '==', startTime)
        .where('endTime', '==', endTime)
        .get();
      
      const existingBookingAvailability = !bookingQuerySnapshot.empty;

      // If availability exists in both, return conflict message
      if (existingUserAvailability && existingBookingAvailability) {
        return res.status(400).json({ message: 'Availability already exists for this time' });
      }

      const availabilityTimestamp = new Date();
      // Prepare new availability data
      const newAvailability = {
        classType,
        date,
        startTime,
        endTime,
        maxStudents: 50,
        students: [],  // Empty array to store student bookings
        createdAt: availabilityTimestamp
      };

      // Add availability to 'bookings' collection first to get a unique ID
      const bookingRef = await db.collection('bookings').add({
        instructorId,
        instructorName,
        email,
        contact,
        ...newAvailability,
        studentsBooked: 0,       // Initialize with 0 students booked
        bookingFull: false,      // Booking starts as not full
      });

      const bookingId = bookingRef.id;

      // Update the 'users' collection with the new booking ID in the 'availabilities' array
      if (!existingUserAvailability) {
        await docRef.update({
          availabilities: FieldValue.arrayUnion({
            id: bookingId,   // Use the booking document ID as the unique identifier
            ...newAvailability
          })
        });
      }

      // Return success response
      return res.status(200).json({ message: 'Availability added successfully' });
    } catch (error) {
      console.error('Error adding availability:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};

module.exports = AvailabilityController;
