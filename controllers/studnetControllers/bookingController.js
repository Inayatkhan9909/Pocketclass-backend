// Importing Firestore modular SDK methods
const { getFirestore, collection, query, where, limit, getDocs, updateDoc, doc, setDoc } = require("firebase/firestore");
const { db } = require("../../config/firebaseAdmin"); // Make sure to export `db` from the firebaseAdmin config

exports.createBooking = async (req, res) => {
  const { studentId, instructorId, date, timeSlot } = req.body;

  try {
    // Access Firestore and prepare the availability query
    const dbInstance = getFirestore(db);
    const availabilityRef = collection(dbInstance, "availability");
    const availabilityQuery = query(
      availabilityRef,
      where("instructorId", "==", instructorId),
      where("date", "==", date),
      where("timeSlot", "==", timeSlot),
      where("status", "==", "available"),
      limit(1)
    );

    // Fetch availability data
    const availabilitySnapshot = await getDocs(availabilityQuery);
    if (availabilitySnapshot.empty) {
      throw new Error("Slot not available");
    }

    // Get the first document in the snapshot
    const availabilityDoc = availabilitySnapshot.docs[0];
    const availabilityDocRef = availabilityDoc.ref;

    // Update the availability document to mark it as booked
    await updateDoc(availabilityDocRef, { status: "booked" });

    // Create the new booking
    const bookingRef = doc(collection(dbInstance, "bookings"));
    await setDoc(bookingRef, {
      studentId,
      instructorId,
      date,
      timeSlot,
      status: "confirmed"
    });

    res.status(200).send("Booking confirmed");
  } catch (error) {
    console.error("Error booking slot: ", error);
    res.status(400).send("Error booking slot");
  }
};
