const express = require('express');
const cors = require('cors');
require('dotenv').config();

const patientRoutes = require('./routes/patient');
const hospitalRoutes = require('./routes/hospital');
const guardianRoutes = require('./routes/guardian');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/patient', patientRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/guardian', guardianRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'EDAV Backend Running' });
});

app.listen(PORT, () => {
  console.log(`EDAV Backend running on port ${PORT}`);
});