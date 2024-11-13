# PocketClass Booking System

## Project Overview

The PocketClass Booking System is a platform designed to connect students with instructors specializing in sports, arts, and music. The system provides both students and instructors with a streamlined experience for managing and booking classes, inspired by platforms like Airbnb and Calendly. 

### Features
- **Instructor Interface**: Manage availability, view bookings, and edit or cancel scheduled slots.
- **Student Interface**: View real-time availability of instructors, book slots, and receive booking confirmations.
- **Conflict Prevention**: Prevents double-booking through real-time updates and transaction locks.
- **Scalability and User Experience**: Designed for a seamless experience with efficient data handling and a scalable Firebase backend.

### Tech Stack
- **Frontend**: React, Tailwind CSS, Material-UI, Firebase.
- **Backend**: Node.js, Express, Firebase Admin SDK, and dotenv for environment management.


###  PocketClass Booking System – Backend
- **Overview
This backend system is designed to support the PocketClass Booking System, allowing instructors to set their availability and students to book classes in areas such as sports, arts, and music. The backend is built using Node.js and Firebase to handle data management, authentication, and scheduling.

- **Features**
- **User Authentication:** Secure authentication using Firebase and hashed passwords.
- **Booking Management:** CRUD operations for instructor availability and student bookings.
- **Conflict Prevention:** Real-time updates to prevent double-booking and scheduling conflicts.
- **CORS Support:** Configured to allow cross-origin requests from the frontend.
- **Scripts**
json
Copy code
{
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "nodemon index.js"
  }
}
- **test:** Displays an error message if no tests are specified.
- **dev:** Runs the backend server in development mode using nodemon, which reloads on code changes.
### Dependencies
- **Dependency	Version	Description**
bcrypt	^5.1.1	Used to hash passwords for secure user authentication.
body-parser	^1.20.3	Parses incoming request bodies, allowing access to JSON data in requests.
cors	^2.8.5	Manages Cross-Origin Resource Sharing, allowing secure communication with the frontend.
dotenv	^16.4.5	Loads environment variables from a .env file to secure sensitive information.
env	^0.0.2	Lightweight tool for environment configurations.
express	^4.21.1	Minimal web application framework for handling routing and requests.
firebase	^11.0.1	Firebase SDK for connecting to Firestore for data storage and user authentication.
firebase-admin	^12.7.0	Provides admin control over Firebase services, used here for database and authentication.
nodemon	^3.1.7	Development tool that auto-reloads the server on code changes.
Getting Started
- **Install Dependencies**
Run the following command to install the required dependencies:

bash
Copy code
npm install
- **Environment Variables**
Create a .env file in the root directory and add the following variables:

plaintext
Copy code
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
- **Run the Server**
To start the server in development mode, use the following command:

bash
Copy code
npm run dev








