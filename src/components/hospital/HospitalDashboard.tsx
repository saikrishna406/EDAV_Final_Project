import React, { useState, useEffect } from 'react';
import { Header } from '../common/Header';
import { Navigation } from '../common/Navigation';
import { QRScanner } from './QRScanner';
import { Scan, AlertTriangle, Clock, CheckCircle, XCircle, Eye, FileText, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { hospitalAPI } from '../../services/api';
import { supabase } from '../../supabase';
import { useMetaMask } from '../../hooks/useMetaMask';
import { useContract } from '../../hooks/useContract';
import CryptoJS from 'crypto-js';

export const HospitalDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scanInput, setScanInput] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [accessRequests, setAccessRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [selectedPatientRecords, setSelectedPatientRecords] = useState<any>(null);
  const { hospital } = useAuth();
  const { isConnected, account, connectWallet, disconnectWallet, isLoading: walletLoading, error: walletError } = useMetaMask();
  const { requestAccess, loading: contractLoading, isReady: contractReady } = useContract();
  const [blockchainTxHash, setBlockchainTxHash] = useState<string | null>(null);

  useEffect(() => {
    loadAccessRequests();
  }, []);

  const loadAccessRequests = async () => {
    try {
      const { data } = await supabase
        .from('access_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      setAccessRequests(data || []);
      
      const pending = data?.filter(r => r.status === 'pending').length || 0;
      const approved = data?.filter(r => r.status === 'approved').length || 0;
      const rejected = data?.filter(r => r.status === 'rejected').length || 0;
      setStats({ pending, approved, rejected });
    } catch (error) {
      console.error('Error loading access requests:', error);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Hospital Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Emergency Access Portal</h1>
            <p className="text-gray-600">{hospital?.name} - Secure Patient Record Access</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">System Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-gray-600">HIPAA Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <QrCode className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">QR Scanner Ready</span>
            </div>
            <div className="flex items-center space-x-2">
              <Wallet className={`w-4 h-4 ${isConnected ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? `Wallet: ${account?.slice(0, 6)}...${account?.slice(-4)}` : 'Wallet Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.pending}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Pending Requests</h3>
          <p className="text-sm text-gray-600">Awaiting guardian approval</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.approved}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Approved</h3>
          <p className="text-sm text-gray-600">Emergency access granted</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.rejected}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Rejected</h3>
          <p className="text-sm text-gray-600">Access denied</p>
        </div>
      </div>

      {/* Blockchain Status Banner */}
      <div className={`border rounded-xl p-4 mb-6 ${
        isConnected && contractReady ? 'bg-green-50 border-green-200' :
        isConnected ? 'bg-yellow-50 border-yellow-200' :
        'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wallet className={`w-5 h-5 ${
              isConnected && contractReady ? 'text-green-600' :
              isConnected ? 'text-yellow-600' :
              'text-red-600'
            }`} />
            <div>
              <h3 className={`font-medium ${
                isConnected && contractReady ? 'text-green-800' :
                isConnected ? 'text-yellow-800' :
                'text-red-800'
              }`}>
                {isConnected && contractReady ? 'Blockchain Ready' :
                 isConnected ? 'Contract Not Available' :
                 'MetaMask Required'}
              </h3>
              <p className={`text-sm ${
                isConnected && contractReady ? 'text-green-700' :
                isConnected ? 'text-yellow-700' :
                'text-red-700'
              }`}>
                {isConnected && contractReady ? 'Full blockchain functionality available' :
                 isConnected ? 'Database storage only - deploy contract for blockchain features' :
                 'Connect wallet for blockchain emergency access requests'}
              </p>
            </div>
          </div>
          {!isConnected && (
            <button
              onClick={connectWallet}
              disabled={walletLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {walletLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
        {walletError && (
          <p className="text-sm text-red-600 mt-2">{walletError}</p>
        )}
        {blockchainTxHash && (
          <p className="text-sm text-green-600 mt-2 font-mono">
            Last transaction: {blockchainTxHash}
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-emerald-600" />
          Recent Access Requests
        </h3>
        <div className="space-y-4">
          {accessRequests.slice(0, 3).map((request) => (
            <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Patient ID: {request.patient_id}</h4>
                  <p className="text-sm text-gray-600">{new Date(request.created_at).toLocaleString()}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                request.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>
          ))}
          {accessRequests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No access requests yet
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const handleQRScan = async (qrData: string) => {
    try {
      setScanInput(qrData);
      await handleEmergencyAccess(qrData);
    } catch (error) {
      alert('Invalid QR code');
    }
  };

  const viewHealthRecord = async (record: any) => {
    try {
      console.log('Viewing actual uploaded record:', record);
      
      const mimeType = getMimeType(record.name);
      const fileData = await getFileData(record);
      
      if (fileData) {
        // Convert to base64 data URL
        const uint8Array = new Uint8Array(fileData);
        const base64String = btoa(String.fromCharCode(...uint8Array));
        const dataUrl = `data:${mimeType};base64,${base64String}`;
        
        // Open directly with data URL
        window.open(dataUrl, '_blank');
      }
    } catch (error) {
      console.error('Error viewing record:', error);
      alert('File not found. Patient may not have uploaded this record yet.');
    }
  };

  const downloadHealthRecord = async (record: any) => {
    try {
      console.log('Downloading actual uploaded record:', record);
      
      const mimeType = getMimeType(record.name);
      const fileData = await getFileData(record);
      
      if (fileData) {
        const blob = new Blob([fileData], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = record.name; // Use original filename
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      }
    } catch (error) {
      console.error('Error downloading record:', error);
      alert('File not found. Patient may not have uploaded this record yet.');
    }
  };

  const getFileData = async (record: any) => {
    try {
      console.log('Getting and decrypting file for record:', record);
      
      let encryptedData = null;
      
      // Try IPFS first
      if (record.ipfs_cid) {
        console.log('Fetching encrypted file from IPFS:', record.ipfs_cid);
        try {
          const response = await fetch(`https://gateway.pinata.cloud/ipfs/${record.ipfs_cid}`);
          if (response.ok) {
            encryptedData = await response.text();
          }
        } catch (ipfsError) {
          console.warn('IPFS fetch failed:', ipfsError);
        }
      }
      
      // Fallback to database storage
      if (!encryptedData && record.file_data) {
        console.log('Using encrypted data from database');
        encryptedData = record.file_data;
      }
      
      if (encryptedData && record.encryption_key) {
        console.log('Decrypting file with stored key');
        
        // Decrypt the file
        const decrypted = CryptoJS.AES.decrypt(encryptedData, record.encryption_key);
        const decryptedWordArray = decrypted.toString(CryptoJS.enc.Base64);
        
        // Convert back to array buffer
        const binaryString = atob(decryptedWordArray);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        console.log('File decrypted successfully, size:', bytes.length);
        return bytes.buffer;
      }
      
      throw new Error(`Cannot decrypt file. Missing encrypted data or encryption_key.`);
    } catch (error) {
      console.error('Error getting/decrypting file data:', error);
      throw error;
    }
  };

  const getMimeType = (filename: string) => {
    const ext = filename.toLowerCase().split('.').pop();
    const mimeTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'csv': 'text/csv',
      'json': 'application/json'
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  };

  const viewPatientRecords = async (patientId: string) => {
    try {
      const { data: patient } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();
      
      const { data: records } = await supabase
        .from('health_records')
        .select('*')
        .eq('patient_id', patientId);
      
      console.log('Patient data:', patient);
      console.log('Health records:', records);
      
      if (patient) {
        setSelectedPatientRecords({
          patientId: patient.id,
          name: patient.name,
          bloodGroup: patient.blood_group,
          emergencyContact: patient.emergency_contact,
          gender: patient.gender,
          records: records || []
        });
      }
    } catch (error) {
      console.error('Error loading patient records:', error);
      alert('Error loading patient records');
    }
  };

  const handleEmergencyAccess = async (qrData: string) => {
    setLoading(true);
    try {
      if (qrData.startsWith('emergency:')) {
        const parts = qrData.split(':');
        const walletAddress = parts[1];
        const qrCode = parts[2];
        
        console.log('QR Data:', qrData);
        console.log('Wallet:', walletAddress);
        console.log('QR Code:', qrCode);
        
        // First, let's see all patients in database
        const { data: allPatients } = await supabase
          .from('patients')
          .select('id, name, wallet_address, qr_code');
        
        console.log('All patients in DB:', allPatients);
        if (allPatients) {
          allPatients.forEach(p => {
            console.log(`Patient ${p.name}: wallet=${p.wallet_address}, qr=${p.qr_code}`);
          });
        }
        
        // Search by wallet address
        const { data: walletPatients } = await supabase
          .from('patients')
          .select('*')
          .eq('wallet_address', walletAddress);
        
        console.log('Wallet search results:', walletPatients);
        
        // Search by QR code
        const { data: qrPatients } = await supabase
          .from('patients')
          .select('*')
          .eq('qr_code', qrCode);
        
        console.log('QR search results:', qrPatients);
        
        let patient = null;
        
        // Find patient that matches the QR data exactly
        if (qrPatients && qrPatients.length > 0) {
          // Use QR match first as it's more specific
          patient = qrPatients[0];
        } else if (walletPatients && walletPatients.length > 0) {
          // Fallback to wallet match
          patient = walletPatients[0];
        }
        
        if (patient) {
          setSelectedPatient(patient);
          
          const { data: insertData, error } = await supabase
            .from('access_requests')
            .insert({
              patient_id: patient.id,
              hospital_id: hospital?.id || 'hospital-1',
              status: 'pending'
            })
            .select();
          
          console.log('Insert result:', insertData, 'Error:', error);
          console.log('Inserted patient_id:', patient.id);
          console.log('Hospital ID:', hospital?.id);
          
          if (!error) {
            let blockchainTx = null;
            // Create blockchain request if connected
            if (isConnected && contractReady) {
              try {
                blockchainTx = await requestAccess(patient.wallet_address || account!);
                if (blockchainTx) {
                  setBlockchainTxHash(blockchainTx.hash);
                }
              } catch (blockchainError) {
                console.error('Blockchain request failed:', blockchainError);
              }
            }
            
            setTimeout(async () => {
              await loadAccessRequests();
            }, 1000);
            
            // Show dual storage feedback
            if (blockchainTx) {
              alert(`Emergency access request created for patient ${patient.name}\n\nDatabase: ✓ Stored\nBlockchain: ✓ Transaction ${blockchainTx.hash.slice(0, 10)}...`);
            } else if (isConnected && contractReady) {
              alert(`Emergency access request created for patient ${patient.name}\n\nDatabase: ✓ Stored\nBlockchain: ✗ Failed`);
            } else {
              alert(`Emergency access request created for patient ${patient.name}\n\nDatabase: ✓ Stored\nBlockchain: - Not connected`);
            }
          } else {
            console.error('Access request error:', error);
            alert(`Error creating access request: ${error.message}`);
          }
        } else {
          alert(`Patient not found. Searched for wallet: ${walletAddress} and QR: ${qrCode}`);
        }
      } else {
        alert('Invalid QR code format. Expected: emergency:wallet:qrcode');
      }
    } catch (error) {
      console.error('Error processing emergency access:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderEmergencyAccess = () => (
    <div className="space-y-6">
      <QRScanner onScan={handleQRScan} />
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Access Request</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scan QR Code or Enter Patient ID
            </label>
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="emergency:0x742d35Cc...QR-123 or Patient ID"
                />
              </div>
              <button
                onClick={() => handleEmergencyAccess(scanInput)}
                disabled={loading || !scanInput}
                className="px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Scan className="w-4 h-4" />
                <span>Scan</span>
              </button>
            </div>
          </div>

          {selectedPatient && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Patient Preview</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{selectedPatient.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Blood Group:</span>
                  <span className="ml-2 font-medium text-red-600">{selectedPatient.blood_group}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Emergency Contact:</span>
                  <span className="ml-2 font-medium text-orange-600">{selectedPatient.emergency_contact || 'Not provided'}</span>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button 
                  onClick={() => handleEmergencyAccess(`emergency:${selectedPatient.wallet_address}:${selectedPatient.qr_code}`)}
                  disabled={loading}
                  className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>{loading ? 'Processing...' : 'Request Emergency Access'}</span>
                </button>
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    This will send a blockchain request to patient guardians for approval
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Requests</h3>
        <div className="space-y-4">
          {accessRequests.map((request) => (
            <div key={request.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">Patient ID: {request.patient_id}</h4>
                  <p className="text-sm text-gray-600">{new Date(request.created_at).toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  request.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>
              
              {request.status === 'approved' && (
                <div className="space-y-3">
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => viewPatientRecords(request.patient_id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Records</span>
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      Download Securely
                    </button>
                  </div>
                  
                  {selectedPatientRecords && selectedPatientRecords.patientId === request.patient_id && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-3">Patient Emergency Information</h5>
                      
                      {/* Basic Emergency Info */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div><strong>Name:</strong> {selectedPatientRecords.name}</div>
                        <div><strong>Blood Group:</strong> <span className="text-red-600 font-bold">{selectedPatientRecords.bloodGroup}</span></div>
                        <div><strong>Emergency Contact:</strong> {selectedPatientRecords.emergencyContact}</div>
                        <div><strong>Gender:</strong> {selectedPatientRecords.gender}</div>
                      </div>
                      
                      {/* Health Records */}
                      <div className="border-t border-blue-200 pt-3">
                        <h6 className="font-medium text-blue-900 mb-2">Health Records ({selectedPatientRecords.records?.length || 0})</h6>
                        {selectedPatientRecords.records && selectedPatientRecords.records.length > 0 ? (
                          <div className="space-y-2">
                            {selectedPatientRecords.records.map((record: any) => (
                              <div key={record.id} className="bg-white p-3 rounded border">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium text-gray-900">{record.name}</div>
                                    <div className="text-sm text-gray-600">
                                      {record.type} • {record.size} • {new Date(record.upload_date).toLocaleDateString()}
                                    </div>
                                    {record.ipfs_cid && (
                                      <div className="text-xs text-green-600 font-mono">IPFS: {record.ipfs_cid.substring(0, 20)}...</div>
                                    )}
                                  </div>
                                  <div className="flex space-x-2">
                                    <button 
                                      onClick={() => viewHealthRecord(record)}
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                      title="Decrypt and view file"
                                    >
                                      🔓 View
                                    </button>
                                    <button 
                                      onClick={() => downloadHealthRecord(record)}
                                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                                      title="Decrypt and download file"
                                    >
                                      📥 Download
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-600 text-sm">No health records uploaded</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {request.status === 'approved' && (
                <div className="mt-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Approved by guardians</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRecords = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Patient Records Viewer</h2>
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Selected</h3>
          <p className="text-gray-600 mb-6">
            Request emergency access to view patient records securely
          </p>
          <button
            onClick={() => setActiveTab('emergency')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Go to Emergency Access
          </button>
        </div>
      </div>
    </div>
  );

  const renderAuditTrail = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Audit Trail</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Access History</h3>
            <div className="flex space-x-2">
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                <option>All Status</option>
                <option>Approved</option>
                <option>Pending</option>
                <option>Rejected</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {accessRequests.map((log) => (
            <div key={log.id} className="px-6 py-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">Patient ID: {log.patient_id}</h4>
                  <p className="text-sm text-gray-600">Request ID: {log.id}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    log.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                    log.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{new Date(log.created_at).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <div>Requested by: {hospital?.name}</div>
                <div>Type: Emergency Access</div>
                <div>Status: {log.status}</div>
                {log.blockchain_tx && (
                  <div className="font-mono text-xs">TX: {log.blockchain_tx}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'emergency':
        return renderEmergencyAccess();
      case 'records':
        return renderRecords();
      case 'audit':
        return renderAuditTrail();
      default:
        return renderDashboard();
    }
  };

  if (!hospital) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Hospital Portal" />
      <div className="flex">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} userType="hospital" />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};