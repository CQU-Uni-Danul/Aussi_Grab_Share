// server/routes/claim.js
const express = require('express');
const Claim = require('../models/Claim');
const FoodItem = require('../models/FoodItem');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a claim on a food item
router.patch('/:id', auth, async (req, res) => {
  try {
	foodItemId = req.params.id;  
    const foodItem = await FoodItem.findById(req.params.id);
    if (!foodItem) return res.status(404).json({ msg: 'Food item not found' });

    if (foodItem.claimed) return res.status(400).json({ msg: 'Food item already claimed' });
	
	foodItem.claimed = true;
    foodItem.claimedBy = {
      id: req.user.id,
      role: req.user.role
    };

    await foodItem.save();
	
    const newClaim = new Claim({
      claimerId: req.user.id,
      claimerType: req.user.role,
      foodItemId,
      status: 'pending'
    });

    await newClaim.save();

    res.json(newClaim);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get claims for current user/business
router.get('/claimed-by-id', auth, async (req, res) => {
  try {
    const items = await FoodItem.find({ 
      claimed: true, 
      "claimedBy.id": req.user.id 
    }).sort({ postedAt: -1 });
	res.json(items);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve or reject claim - this should be done by the poster (or admin)
// For simplicity, assuming poster approves via this endpoint
router.patch('/status/:id', auth, async (req, res) => {
  try {
    foodItemId = req.params.id;  
	console.log(foodItemId);
    const claimedItem = await Claim.findOne({
		foodItemId: foodItemId,
	});
    console.log(claimedItem);

	if (!claimedItem) return res.status(404).json({ msg: 'Claimed food item not found' });
	
	const foodItem = await FoodItem.findById(req.params.id);
	
	foodItem.collectStatus = "collected";

    await foodItem.save();
	
	claimedItem.status = "collected";

    await claimedItem.save();

    res.json({ msg: "Collect food item approved", claimedItem });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel a claim
router.delete('/cancel-claim/:id', auth, async (req, res) => {
  try {
    const foodItemId = req.params.id;

    // Find the food item
    const foodItem = await FoodItem.findById(foodItemId);
    if (!foodItem) return res.status(404).json({ error: "Food item not found" });

    // Ensure the current user is the one who claimed it
    if (!foodItem.claimedBy || foodItem.claimedBy.id.toString() !== req.user.id) {
      return res.status(403).json({ error: "You did not claim this item." });
    }

    // Reset claim in food item
    foodItem.claimed = false;
    foodItem.claimedBy = null;
    await foodItem.save();

    // Delete the claim record
    await Claim.deleteOne({ foodItemId: foodItemId, claimerId: req.user.id });

    res.json({ msg: "Claim successfully canceled." });

  } catch (error) {
    console.error("Cancel claim error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
