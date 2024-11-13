const { FieldValue } = require('firebase-admin/firestore');
const { db } = require('../../config/firebaseAdmin');

const BookClassController = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { bookingId, studentId, studentName, studentEmail, classType, instructorId } = req.body;

  // Validate input
  if (!bookingId || !studentId || !studentName || !studentEmail || !classType || !instructorId) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Step 1: Fetch booking and instructor documents
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingSnapshot = await bookingRef.get();
    if (!bookingSnapshot.exists) {
      return res.status(400).json({ message: 'Booking not found' });
    }
    const bookingData = bookingSnapshot.data();

    const instructorRef = db.collection('users').doc(instructorId);
    const instructorSnapshot = await instructorRef.get();
    if (!instructorSnapshot.exists) {
      return res.status(400).json({ message: 'Instructor not found' });
    }
    const instructorData = instructorSnapshot.data();

    // Step 2: Check conditions before performing updates
    if (bookingData.studentsBooked >= bookingData.maxStudents) {
      return res.status(400).json({ message: 'Class is fully booked' });
    }

    const alreadyBooked = bookingData.students.some(student => student.id === studentId);
    if (alreadyBooked) {
      return res.status(400).json({ message: 'Student is already booked for this class' });
    }

    // Step 3: Prepare updates (all reads are done)
    const updatedStudents = [
      ...bookingData.students,
      { id: studentId, name: studentName, email: studentEmail }
    ];
    const updatedStudentsBooked = bookingData.studentsBooked + 1;

    // Begin Firestore transaction
    await db.runTransaction(async (transaction) => {
      // Update booking with new student data
      transaction.update(bookingRef, {
        students: updatedStudents,
        studentsBooked: updatedStudentsBooked,
        bookingFull: updatedStudentsBooked >= bookingData.maxStudents,
      });

      // Update instructor’s availabilities in 'users' collection
      const updatedAvailabilities = (instructorData.availabilities || []).map(availability => {
        if (availability.id === bookingId) {
          return {
            ...availability,
            students: [...availability.students, { id: studentId, name: studentName, email: studentEmail }]
          };
        }
        return availability;
      });

      transaction.update(instructorRef, {
        availabilities: updatedAvailabilities,
      });
    });

    // Send the final response only once transaction is done
    return res.status(200).json({ message: 'Class booked successfully' });
  } catch (error) {
    console.error('Error booking class:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = BookClassController;
