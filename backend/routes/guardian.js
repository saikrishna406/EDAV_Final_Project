const express = require('express');
const { approveAccess, contract } = require('../utils/web3');

const router = express.Router();

// Get pending access requests for guardian
router.get('/pending-requests/:guardianAddress', async (req, res) => {
  try {
    const { guardianAddress } = req.params;
    
    // In a real implementation, you'd query events or maintain a database
    // For now, return mock pending requests
    const pendingRequests = []; // This would be populated from blockchain events
    
    res.json({
      success: true,
      pendingRequests
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Approve access request
router.post('/approve-access', async (req, res) => {
  try {
    const { requestId, guardianPrivateKey } = req.body;
    
    const txHash = await approveAccess(requestId, guardianPrivateKey);
    
    res.json({
      success: true,
      transactionHash: txHash,
      message: 'Access approved successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get request details
router.get('/request-details/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await contract.accessRequests(requestId);
    const guardians = await contract.getPatientGuardians(request[1]);
    
    res.json({
      success: true,
      request: {
        id: request[0].toString(),
        patient: request[1],
        hospital: request[2],
        timestamp: request[4].toString(),
        approvals: request[5].toString(),
        executed: request[6],
        guardians: guardians
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;