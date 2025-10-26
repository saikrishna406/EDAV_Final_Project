const API_BASE_URL = 'http://localhost:5002/api';

export const patientAPI = {
  generateWallet: async () => {
    const response = await fetch(`${API_BASE_URL}/patient/generate-wallet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  },

  registerOnBlockchain: async (patientAddress: string, ipfsHash: string, guardianAddresses: string[]) => {
    const response = await fetch(`${API_BASE_URL}/patient/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientAddress, ipfsHash, guardianAddresses })
    });
    return response.json();
  },

  uploadRecord: async (file: File, patientId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patientId', patientId);

    const response = await fetch(`${API_BASE_URL}/patient/upload-record`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  generateQR: async (patientAddress: string, ipfsHash: string) => {
    const response = await fetch(`${API_BASE_URL}/patient/generate-qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientAddress, ipfsHash })
    });
    return response.json();
  },

  addGuardian: async (patientId: string, guardianData: any) => {
    const response = await fetch(`${API_BASE_URL}/patient/add-guardian`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, ...guardianData })
    });
    return response.json();
  },

  getGuardians: async (patientId: string) => {
    const response = await fetch(`${API_BASE_URL}/patient/guardians/${patientId}`);
    return response.json();
  }
};

export const guardianAPI = {
  getPendingRequests: async (guardianAddress: string) => {
    const response = await fetch(`${API_BASE_URL}/guardian/pending-requests/${guardianAddress}`);
    return response.json();
  },

  approveAccess: async (requestId: string, guardianPrivateKey: string) => {
    const response = await fetch(`${API_BASE_URL}/guardian/approve-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, guardianPrivateKey })
    });
    return response.json();
  }
};

export const hospitalAPI = {
  requestAccess: async (patientAddress: string, hospitalId: string) => {
    const response = await fetch(`${API_BASE_URL}/hospital/request-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientAddress, hospitalId })
    });
    return response.json();
  },

  checkAccessStatus: async (requestId: string) => {
    const response = await fetch(`${API_BASE_URL}/hospital/access-status/${requestId}`);
    return response.json();
  },

  downloadRecord: async (requestId: string, patientId: string) => {
    const response = await fetch(`${API_BASE_URL}/hospital/download-record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, patientId })
    });
    return response.json();
  },

  parseQR: async (qrData: string) => {
    const response = await fetch(`${API_BASE_URL}/hospital/parse-qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrData })
    });
    return response.json();
  }
};