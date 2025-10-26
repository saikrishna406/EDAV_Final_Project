const express = require('express');
const notificationService = require('../utils/notifications');

const router = express.Router();

// SSE endpoint for real-time notifications
router.get('/stream/:userId', (req, res) => {
  const { userId } = req.params;
  notificationService.addConnection(userId, res);
});

module.exports = router;