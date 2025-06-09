// server/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Business = require('../models/Business');

const router = express.Router();

// Register User
router.post('/register/user', async (req, res) => {
  try {
    const { firstname, lastname, email, password, address, postcode, state, phoneNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
	
    const newUser = new User({
		firstname,
		lastname,
		email,
		passwordHash,
		address,
		postcode,
		state,
		phoneNumber
    });
	console.log(newUser);

    await newUser.save();
	console.log("user saved");
    res.json({ msg: 'User registered successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register Business
router.post('/register/business', async (req, res) => {
  try {
    const { businessName, email, password, phoneNumber, businessType, address, postcode, state, ownerFirstName, ownerLastName } = req.body;

    const existingBusiness = await Business.findOne({ email });
    if (existingBusiness) return res.status(400).json({ msg: 'Business already exists' });

    const passwordHash = await bcrypt.hash(password, 10);

    const newBusiness = new Business({
      businessName,
      email,
      passwordHash,
      phoneNumber,
      businessType,
	  address,
	  postcode,
	  state,
	  ownerFirstName,
	  ownerLastName
    });

    await newBusiness.save();
    res.json({ msg: 'Business registered successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login (User or Business)
router.post('/login', async (req, res) => {
  try {
	console.log(req.body);
    const { email, password, role } = req.body; // role = 'user' or 'business'

    let entity;
    if (role === 'user') {
      entity = await User.findOne({ email });
    } else if (role === 'business') {
      entity = await Business.findOne({ email });
    } else {
      return res.status(400).json({ msg: 'Invalid role' });
    }

    if (!entity) return res.status(400).json({ msg: 'User/Business not found' });

    const isMatch = await bcrypt.compare(password, entity.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid password' });

    // Create JWT Token
    const token = jwt.sign(
      { id: entity._id, role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
	  role,
      user: {
        id: entity._id,
        name: entity.name || entity.businessName,
        email: entity.email
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
