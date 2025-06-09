const express = require('express');
const Report = require('../models/Report');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a new report
router.post('/', auth, async (req, res) => {
  try {
    const {
      reportedEntityId,
      reportedEntityType,
      reportType,
      description
    } = req.body;

    // reporterId and reporterType come from auth middleware
    const reporterId = req.user.id;
    const reporterType = req.user.role;

    const newReport = new Report({
      reporterId,
      reporterType,
      reportedEntityId,
      reportedEntityType,
      reportType,
      description
    });

    await newReport.save();
    res.status(201).json(newReport);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reports (can add filters later, admin only maybe)
router.get('/', auth, async (req, res) => {
  try {
    // TODO: Add authorization to restrict who can see all reports

    const reports = await Report.find()
      .sort({ reportDate: -1 })
      .populate('reporterId', 'name email') // populate user/business info
      .populate('reportedEntityId');

    res.json(reports);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update report status (e.g., mark reviewed/resolved) - admin only
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    // TODO: check if req.user is admin or authorized to update status

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ msg: 'Report not found' });

    report.status = status;
    await report.save();

    res.json(report);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
