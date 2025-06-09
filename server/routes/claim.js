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
    const claims = await Claim.find({ claimerId: req.user.id, claimerType: req.user.role })
      .populate('foodItemId');
    res.json(claims);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve or reject claim - this should be done by the poster (or admin)
// For simplicity, assuming poster approves via this endpoint
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body; // approved or rejected
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ msg: 'Claim not found' });

    const foodItem = await FoodItem.findById(claim.foodItemId);

    // Only poster can approve/reject
    if (foodItem.postedBy.id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    claim.status = status;
    await claim.save();

    if (status === 'approved') {
      foodItem.claimed = true;
      foodItem.claimedBy = { id: claim.claimerId, role: claim.claimerType };
      await foodItem.save();
    }

    res.json(claim);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
