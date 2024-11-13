const express = require("express");
const cors = require("cors");
const app = express();
const { db } = require('./config/firebaseAdmin')


const BookClassController = require("./controllers/studnetControllers/BookClassController");
const CanelBookingController = require("./controllers/studnetControllers/CancelClassbooking");
const RegisterController = require("./controllers/userControllers/RegisterController");
const LoginController = require("./controllers/userControllers/LoginController");
const AvailabilityController = require("./controllers/instructorControllers/availabilityController");
const EditAvailabilityController = require("./controllers/instructorControllers/EditAvailabilityController");
const DeleteAvailabilityController = require("./controllers/instructorControllers/DeleteAvailabilityController");

app.use(cors());
app.use(express.json());


app.post('/register',RegisterController );
app.post('/login',LoginController);


app.post('/instructoravaliability', AvailabilityController);
app.put('/editavaliability/:availabilityId', EditAvailabilityController);
app.delete('/deleteavaliability/:availabilityId/:userId',DeleteAvailabilityController);

app.post('/bookclass',BookClassController)
app.delete('/cancelbooking/:bookingId/:userId',CanelBookingController)

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
