// server/routes/fooditem.js
const express = require('express');
const FoodItem = require('../models/FoodItem');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// Get all food items (optionally filter by location, unclaimed only)
router.get('/all', auth, async (req, res) => {
  try {

    const items = await FoodItem.find({collectStatus: "pending"}).sort({ postedAt: -1 });
    res.json(items);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new food item (authenticated users/businesses only)
router.post('/upload', auth, upload.single("imageUrl"), async (req, res) => {
  try {
    const { name, description, location, expiryDate, postedById, postedByRole } = req.body;
	const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";
	
	if (!mongoose.Types.ObjectId.isValid(postedById)) {
		  return res.status(400).json({ error: 'Invalid postedById' });
	}
	
    const newFoodItem = new FoodItem({
      name,
      description,
      imageUrl,
      location,
      expiryDate,
      postedBy: { id: postedById, role: postedByRole },
	  claimed: false,
	  claimedBy: null
    });
	
    await newFoodItem.save();
    res.json(newFoodItem);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get food item by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const userId = req.params.id;
	const item = await FoodItem.find({ 'postedBy.id': userId }).sort({ postedAt: -1 });
    if (!item) return res.status(404).json({ msg: 'Food item not found' });
    res.json(item);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update food item (only poster can update)
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await FoodItem.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Food item not found' });

    if (item.postedBy.id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const { name, description, imageUrl, location, expiryDate } = req.body;

    if (name) item.name = name;
    if (description) item.description = description;
    if (imageUrl) item.imageUrl = imageUrl;
    if (location) item.location = location;
    if (expiryDate) item.expiryDate = expiryDate;

    await item.save();
    res.json(item);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete food item (only poster can delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await FoodItem.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Food item not found' });

    if (item.postedBy.id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await item.remove();
    res.json({ msg: 'Food item deleted' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
