const { db } = require('../../config/firebaseAdmin');


const CancelBookingController = async (req, res) => {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { bookingId, userId } = req.params; 
    if (!bookingId || !userId) {
        return res.status(400).json({ message: 'Booking ID and User ID are required' });
    }

    try {
        // Start a Firestore transaction
        await db.runTransaction(async (transaction) => {
            // Reference to the booking document in 'bookings' collection
            const bookingRef = db.collection('bookings').doc(bookingId);
            const bookingDoc = await transaction.get(bookingRef);
            if (!bookingDoc.exists) {
                throw new Error('Booking not found');
            }
            
            // Access the booking data
            const bookingData = bookingDoc.data();
            const instructorId = bookingData.instructorId; 
            console.log('Instructor ID:', instructorId);

            // Reference to the instructor document
            const instructorRef = db.collection('users').doc(instructorId);
            const instructorDoc = await transaction.get(instructorRef);
            if (!instructorDoc.exists) {
                throw new Error('Instructor not found');
            }

            const instructorData = instructorDoc.data();
            const availabilities = instructorData.availabilities || [];

            // Find the availability and remove the student
            const updatedAvailabilities = availabilities.map(availability => {
                if (availability.students) {
                    availability.students = availability.students.filter(student => student.id !== userId);
                }
                return availability;
            });

            // Update the instructor document with the modified availabilities
            transaction.update(instructorRef, { availabilities: updatedAvailabilities });

            // Now remove the student from the booking's students array
            const updatedStudents = bookingData.students.filter(student => student.id !== userId);

            // Update the booking document with the modified students array
            const updatedStudentsBooked = bookingData.studentsBooked - 1;

            transaction.update(bookingRef, {
                students: updatedStudents,
                studentsBooked: updatedStudentsBooked,
                bookingFull: updatedStudentsBooked >= bookingData.maxStudents,
            });
        });

        return res.status(200).json({ message: 'Booking and availability updated successfully' });
    } catch (error) {
        console.error('Error canceling booking:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = CancelBookingController;
