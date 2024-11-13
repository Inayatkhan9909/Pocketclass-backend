const { FieldValue } = require('firebase-admin/firestore');
const { db } = require('../../config/firebaseAdmin');

const EditAvailabilityController = async (req, res) => {
  if (req.method === 'PUT') {
    const availabilityId = req.params.availabilityId;
    const { instructorId, date, startTime, endTime, classType } = req.body;

    // Validate that required fields are provided
    if (!instructorId || !availabilityId) {
      return res.status(400).json({ message: 'InstructorId and AvailabilityId are required for the update' });
    }

    try {
      // Reference to the instructor document in the 'users' collection
      const docRef = db.collection('users').doc(instructorId);
      const docSnapshot = await docRef.get();

      if (!docSnapshot.exists) {
        return res.status(404).json({ message: 'Instructor not found' });
      }

      const userData = docSnapshot.data();

      // Find the availability that is being updated
      const availabilityToUpdate = userData.availabilities.find(avail => avail.id === availabilityId);
      if (!availabilityToUpdate) {
        return res.status(404).json({ message: 'Availability not found' });
      }

      // Check for time conflict with other availabilities in the user's document
      const conflictingAvailability = (userData.availabilities || []).find(
        (availability) =>
          availability.id !== availabilityId && // Exclude the current availability being edited
          availability.date === date &&
          (
            (availability.startTime <= endTime && availability.startTime >= startTime) ||
            (availability.endTime >= startTime && availability.endTime <= endTime)
          )
      );

      if (conflictingAvailability) {
        return res.status(400).json({ message: 'Availability conflict with another existing time' });
      }

      // Check for time conflict in the 'bookings' collection
      const bookingQuerySnapshot = await db.collection('bookings')
        .where('instructorId', '==', instructorId)
        .where('id', '==', availabilityId)
        .get();

      const existingBookingConflict = !bookingQuerySnapshot.empty;

      if (existingBookingConflict) {
        return res.status(400).json({ message: 'Availability conflict with existing booking time' });
      }

      // Prepare updated availability data (only update provided fields)
      const updatedAvailability = {
        classType: classType || availabilityToUpdate.classType,  // Preserve previous values if not updated
        date: date || availabilityToUpdate.date,  // Preserve previous values if not updated
        startTime: startTime || availabilityToUpdate.startTime,  // Preserve previous values if not updated
        endTime: endTime || availabilityToUpdate.endTime,  // Preserve previous values if not updated
        updatedAt: new Date(),  // Always update the timestamp
      };

      // Update availability in the 'users' collection
      await docRef.update({
        availabilities: FieldValue.arrayRemove(availabilityToUpdate) // Remove the old entry
      });

      // Add the updated availability back into the array
      await docRef.update({
        availabilities: FieldValue.arrayUnion({ ...updatedAvailability, id: availabilityId })
      });

      // Update availability in the 'bookings' collection if it exists
      const bookingDocSnapshot = await db.collection('bookings')
        .where('instructorId', '==', instructorId)
        .where('id', '==', availabilityId)
        .get();

      if (!bookingDocSnapshot.empty) {
        const bookingDocRef = bookingDocSnapshot.docs[0].ref;
        await bookingDocRef.update(updatedAvailability);
      }

      return res.status(200).json({ message: 'Availability updated successfully' });
    } catch (error) {
      console.error('Error updating availability:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};

module.exports = EditAvailabilityController;
