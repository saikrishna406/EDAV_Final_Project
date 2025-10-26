const EventEmitter = require('events');

class NotificationService extends EventEmitter {
  constructor() {
    super();
    this.connections = new Map();
  }

  addConnection(userId, res) {
    this.connections.set(userId, res);
    
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    res.write('data: {"type":"connected"}\n\n');

    res.on('close', () => {
      this.connections.delete(userId);
    });
  }

  sendNotification(userId, notification) {
    const connection = this.connections.get(userId);
    if (connection) {
      connection.write(`data: ${JSON.stringify(notification)}\n\n`);
    }
  }

  broadcastToGuardians(guardianAddresses, notification) {
    guardianAddresses.forEach(address => {
      this.sendNotification(address, notification);
    });
  }

  notifyAccessRequest(patientAddress, hospitalId, requestId, guardianAddresses) {
    const notification = {
      type: 'access_request',
      patientAddress,
      hospitalId,
      requestId,
      timestamp: Date.now(),
      message: `Emergency access requested for patient ${patientAddress}`
    };

    this.broadcastToGuardians(guardianAddresses, notification);
  }

  notifyAccessApproved(requestId, patientAddress, hospitalId) {
    const notification = {
      type: 'access_approved',
      requestId,
      patientAddress,
      hospitalId,
      timestamp: Date.now(),
      message: 'Access request has been approved'
    };

    this.sendNotification(hospitalId, notification);
  }
}

const notificationService = new NotificationService();

module.exports = notificationService;