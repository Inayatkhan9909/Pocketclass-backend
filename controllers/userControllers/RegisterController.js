const { db, auth } = require('../../config/firebaseAdmin');

const RegisterController = async (req, res) => {
    console.log("first");
    const { firstname, lastname, email, contact, gender, dob, password, role } = req.body;

    try {
        // Validate required fields
        if (!firstname || !lastname || !email || !contact || !gender || !dob || !password || !role) {
            return res.status(400).send({ message: 'All credentials are required!' });
        }

        // Validate password length
        if (typeof password !== 'string' || password.length < 6) {
            return res.status(400).send({ message: 'Password must be at least 6 characters long.' });
        }

        // Create user in Firebase Authentication
        let userRecord;
        try {
            userRecord = await auth.createUser({
                email: email,
                password: password,
                displayName: `${firstname} ${lastname}`,
            });
        } catch (error) {
            if (error.code === 'auth/email-already-exists') {
                return res.status(400).send({ message: 'Email already registered' });
            }
            if (error.code === 'auth/invalid-password') {
                return res.status(400).send({ message: 'Password must be at least 6 characters long.' });
            }
            if (error.code === 'auth/invalid-email') {
                return res.status(400).send({ message: 'Invalid email format.' });
            }
            throw error; // Re-throw if it's a different error
        };

        // Save additional user data to Firestore with uid as document ID
        await db.collection('users').doc(userRecord.uid).set({
            firstname,
            lastname,
            email,
            contact,
            gender,
            dob,
            password: password,
            role,
        });

        
        res.status(200).send({ message: 'Registration successful' });
    } catch (error) {
        console.error('Error saving registration data:', error);
        res.status(500).send('Error registering user');
    }
}

module.exports = RegisterController;
