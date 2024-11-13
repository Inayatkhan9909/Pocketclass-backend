const { db } = require('../../config/firebaseAdmin');
const { FieldValue } = require('firebase-admin/firestore');

const DeleteAvailabilityController = async (req, res) => {
  if (req.method === 'DELETE') {
    const  {availabilityId,userId}  = req.params;
    // Validate that required fields are provided
    if (!availabilityId || !userId) {
      return res.status(400).json({ message: 'AvailabilityId and InstructorId are required' });
    }

    try {
      // Reference to the instructor document in the 'users' collection
      const docRef = db.collection('users').doc(userId);
      const docSnapshot = await docRef.get();

      if (!docSnapshot.exists) {
        return res.status(404).json({ message: 'Instructor not found' });
      }

      const userData = docSnapshot.data();

      // Find the availability that is being deleted
      const availabilityToDelete = userData.availabilities.find(avail => avail.id === availabilityId);
      if (!availabilityToDelete) {
        return res.status(404).json({ message: 'Availability not found' });
      }

      // Delete the availability from the 'users' collection
      await docRef.update({
        availabilities: FieldValue.arrayRemove(availabilityToDelete)
      });

      // Delete the availability from the 'bookings' collection (if exists)
      const bookingQuerySnapshot = await db.collection('bookings')
        .where('instructorId', '==', userId)
        .where('availabilityId', '==', availabilityId)
        .get();

      if (!bookingQuerySnapshot.empty) {
        // Remove related booking
        const bookingDocRef = bookingQuerySnapshot.docs[0].ref;
        await bookingDocRef.delete();
      }

      return res.status(200).json({ message: 'Availability and related booking deleted successfully' });
    } catch (error) {
      console.error('Error deleting availability:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};

module.exports = DeleteAvailabilityController;
