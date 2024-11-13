const { auth } = require('../../config/firebaseAdmin'); // Firebase Admin SDK

const LoginController = async (req, res) => {
    
    const idToken = req.body.token || req.headers.authorization?.split(' ')[1];

    try {
        if (!idToken) {
            return res.status(400).send({ message: 'ID token is required' });
        }

        // Verify the ID token using Firebase Admin SDK
        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // You can now access user details like uid, email, etc.
        const userRecord = await auth.getUser(uid);

        const userData = {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName, // Firebase stores display name by default
            role: userRecord.customClaims?.role // If you have custom claims like role
        };

        // Send the user data as the response
        res.status(200).send({
            message: 'Login successful',
            userData
        });
    } catch (error) {
        console.error('Error logging in:', error);
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).send({ message: 'ID token expired' });
        }
        if (error.code === 'auth/argument-error') {
            return res.status(400).send({ message: 'Invalid ID token' });
        }
        res.status(500).send({ message: 'Error logging in' });
    }
};

module.exports = LoginController;
