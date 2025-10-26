const request = require('supertest');
const express = require('express');

// Mock app for testing
const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'EDAV Backend Running' });
});

app.post('/api/patient/generate-wallet', (req, res) => {
  res.json({
    success: true,
    wallet: {
      address: '0x1234567890123456789012345678901234567890',
      privateKey: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    }
  });
});

describe('API Endpoints', () => {
  test('GET /health', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('EDAV Backend Running');
  });

  test('POST /api/patient/generate-wallet', async () => {
    const response = await request(app)
      .post('/api/patient/generate-wallet')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.wallet).toHaveProperty('address');
    expect(response.body.wallet).toHaveProperty('privateKey');
  });
});