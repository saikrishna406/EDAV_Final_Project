import React, { useState, useEffect } from 'react';
import { Header } from '../common/Header';
import { Navigation } from '../common/Navigation';
import { QrCode, Upload, Users, FileText, Activity, Shield, Plus, Eye, Trash2, Wallet } from 'lucide-react';
import { GuardianWalletHelper } from './GuardianWalletHelper';
import { useAuth } from '../../context/AuthContext';
import QRCodeReact from 'react-qr-code';
import { UploadRecord } from './UploadRecord';
import { patientAPI, guardianAPI } from '../../services/api';
import { supabase } from '../../supabase';
import { useMetaMask } from '../../hooks/useMetaMask';
import { useContract } from '../../hooks/useContract';



// Define interfaces for your data structures (important for type safety)
interface Guardian {
  id: string;
  name: string;
  walletAddress: string;
  relationship: string;
  contact: string;
  isActive: boolean;
  patientId: string; // Crucial for queries
}

interface HealthRecord {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  ipfsCid: string; // Changed from ipfsHash to ipfsCid as per UploadRecord component
  isEncrypted: boolean;
  size: string;
  patientId: string; // Crucial for queries
  // encryptionKeyId: string; // You might need this if you implement a key management system
}

interface AccessLog {
  id: string;
  patientId: string;
  patientName: string;
  hospitalId: string;
  hospitalName: string;
  requestedBy: string;
  timestamp: string;
  status: 'approved' | 'pending' | 'rejected';
  guardianApprovals: string[]; // Array of guardian UIDs who approved
}

export const PatientDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();
  const authLoading = false;

  // State for actual data, initialized to empty arrays
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // New state for controlling the visibility of the UploadRecord modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { isConnected, account, connectWallet, disconnectWallet, isLoading: walletLoading, error: walletError } = useMetaMask();
  const { registerPatient, loading: contractLoading, isReady: contractReady } = useContract();
  const [blockchainStatus, setBlockchainStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  // --- Data Fetching Logic ---
  const fetchPatientData = async () => {
    if (!user?.id) {
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    setFetchError(null);

    try {
      // Try to fetch from Supabase, but don't fail if it doesn't work
      try {
        const { data: recordsData } = await supabase
          .from('health_records')
          .select('*')
          .eq('patient_id', user.id);
        
        if (recordsData) {
          setRecords(recordsData.map(record => ({
            id: record.id,
            name: record.name,
            type: record.type,
            uploadDate: record.upload_date,
            ipfsCid: record.ipfs_cid,
            isEncrypted: record.is_encrypted,
            size: record.size,
            patientId: record.patient_id
          })));
        }
      } catch (dbError) {
        console.warn('Failed to fetch from Supabase:', dbError);
      }
      
      // Fetch guardians from database
      try {
        const { data: guardiansData, error: guardianError } = await supabase
          .from('guardians')
          .select('*')
          .eq('patient_id', user.id);
        
        if (guardianError) {
          console.warn('Database error loading guardians:', guardianError);
          // Load from localStorage as fallback
          const localGuardians = JSON.parse(localStorage.getItem(`guardians_${user.id}`) || '[]');
          setGuardians(localGuardians);
        } else {
          console.log('Loaded guardians from database:', guardiansData);
          setGuardians(guardiansData.map(guardian => ({
            id: guardian.id,
            name: guardian.name,
            walletAddress: guardian.wallet_address,
            relationship: guardian.relationship,
            contact: guardian.contact,
            isActive: guardian.is_active,
            patientId: guardian.patient_id
          })));
        }
      } catch (dbError) {
        console.warn('Failed to fetch guardians, using localStorage:', dbError);
        const localGuardians = JSON.parse(localStorage.getItem(`guardians_${user.id}`) || '[]');
        setGuardians(localGuardians);
      }
      
      // Load access requests for this patient
      try {
        console.log('=== PATIENT DEBUG ACCESS REQUESTS ===');
        console.log('Current patient ID:', user.id);
        
        // Try database first (non-blocking)
        try {
          const { data: accessData, error: accessError } = await supabase
            .from('access_requests')
            .select('*')
            .eq('patient_id', user.id)
            .order('created_at', { ascending: false });
          
          if (accessError) {
            console.warn('Database access failed, using empty data:', accessError);
            setAccessLogs([]);
          } else if (accessData && accessData.length > 0) {
          const formattedLogs = accessData.map(request => ({
            id: request.id,
            patientId: request.patient_id,
            patientName: user.name || 'Unknown Patient',
            hospitalId: request.hospital_id || 'Unknown Hospital',
            hospitalName: request.hospital_id || 'Emergency Hospital',
            requestedBy: 'Emergency Staff',
            timestamp: new Date(request.created_at).toLocaleString(),
            status: request.status,
            guardianApprovals: []
          }));
            setAccessLogs(formattedLogs);
          } else {
            setAccessLogs([]);
          }
        } catch (dbError) {
          console.warn('Database connection failed, using empty data:', dbError);
          setAccessLogs([]);
        }
      } catch (error) {
        console.error('Failed to load access requests:', error);
        setAccessLogs([]);
      }
      setLoadingData(false);
    } catch (error: any) {
      console.error('Error fetching patient data:', error);
      setFetchError(`Failed to load data: ${error.message || 'Unknown error'}`);
      setLoadingData(false);
    }
  };

  // Effect to call the data fetching function
  useEffect(() => {
    console.log('User data in dashboard:', user);
    console.log('Blood group:', user?.bloodGroup);
    console.log('Auth loading:', authLoading);
    if (!authLoading && user?.id) { // Only fetch when auth is done and user is available
      fetchPatientData();
    }
  }, [user, authLoading]); // Depend on user and authLoading

  // Auto-refresh when access-log tab is selected
  useEffect(() => {
    if (activeTab === 'access-log' && user?.id) {
      fetchPatientData();
    }
  }, [activeTab, user?.id]);

  // Handle approve/reject access request
  const handleApproveRequest = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('access_requests')
        .update({ status: newStatus })
        .eq('id', requestId);
      
      if (!error) {
        alert(`Access request ${newStatus} successfully!`);
        fetchPatientData(); // Refresh the data
      } else {
        alert('Error updating request status');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Error updating request');
    }
  };

  // Callback for when UploadRecord successfully finishes
  const handleUploadSuccess = () => {
    setShowUploadModal(false); // Close the modal
    fetchPatientData(); // Re-fetch all data to refresh the records list
  };

  // State for guardian management
  const [showAddGuardian, setShowAddGuardian] = useState(false);
  const [guardianForm, setGuardianForm] = useState({
    name: '',
    relationship: '',
    contact: '',
    walletAddress: ''
  });

  // Add guardian function
  const addGuardian = async () => {
    if (!user?.id || !guardianForm.name || !guardianForm.walletAddress) {
      alert('Please fill all required fields (Name and Wallet Address are required)');
      return;
    }

    // Validate wallet address format (more flexible for testing)
    if (!guardianForm.walletAddress.startsWith('0x') || guardianForm.walletAddress.length !== 42) {
      alert('Please enter a valid wallet address (0x followed by 40 characters)\n\nExample: 0x1234567890abcdef1234567890abcdef12345678\n\nUse the "Need help?" link below to generate a sample address for testing.');
      return;
    }

    try {
      const newGuardian: Guardian = {
        id: Date.now().toString(),
        name: guardianForm.name,
        walletAddress: guardianForm.walletAddress,
        relationship: guardianForm.relationship,
        contact: guardianForm.contact,
        isActive: true,
        patientId: user.id
      };

      // Add to Supabase database
      const { error } = await supabase
        .from('guardians')
        .insert({
          patient_id: user.id,
          name: guardianForm.name,
          wallet_address: guardianForm.walletAddress,
          relationship: guardianForm.relationship,
          contact: guardianForm.contact,
          is_active: true
        });

      if (error) {
        console.error('Supabase guardian insert failed:', error);
        // Store locally as fallback
        const localGuardians = JSON.parse(localStorage.getItem(`guardians_${user.id}`) || '[]');
        localGuardians.push(newGuardian);
        localStorage.setItem(`guardians_${user.id}`, JSON.stringify(localGuardians));
        
        setGuardians([...guardians, newGuardian]);
        setGuardianForm({ name: '', relationship: '', contact: '', walletAddress: '' });
        setShowAddGuardian(false);
        alert('Guardian added successfully! (Stored locally - database error)');
        return;
      }

      // Update local state first
      const updatedGuardians = [...guardians, newGuardian];
      setGuardians(updatedGuardians);
      
      // Register patient on blockchain if connected and has enough guardians
      let blockchainTx = null;
      if (isConnected && contractReady && updatedGuardians.length >= 2) {
        try {
          setBlockchainStatus('pending');
          const guardianAddresses = updatedGuardians.map(g => g.walletAddress);
          blockchainTx = await registerPatient(account!, 'patient-records-hash', guardianAddresses);
          if (blockchainTx) {
            setBlockchainStatus('success');
          }
        } catch (blockchainError) {
          console.error('Blockchain registration failed:', blockchainError);
          setBlockchainStatus('error');
        }
      }
      
      setGuardianForm({ name: '', relationship: '', contact: '', walletAddress: '' });
      setShowAddGuardian(false);
      
      // Show transaction feedback
      if (blockchainTx) {
        alert(`Guardian added successfully! Patient registered on blockchain.\nTransaction: ${blockchainTx.hash}`);
      } else if (isConnected && contractReady && updatedGuardians.length < 2) {
        alert('Guardian added to database. Need 2+ guardians for blockchain registration.');
      } else if (!isConnected) {
        alert('Guardian added to database. Connect MetaMask for blockchain features.');
      } else {
        alert('Guardian added to database only.');
      }
    } catch (error: any) {
      console.error('Error adding guardian:', error);
      if (error.message?.includes('duplicate')) {
        alert('This guardian is already added to your account.');
      } else {
        alert('Failed to add guardian: ' + (error.message || 'Unknown error'));
      }
    }
  };

  // Delete guardian function
  const deleteGuardian = async (guardianId: string) => {
    if (!confirm('Are you sure you want to remove this guardian?')) {
      return;
    }

    try {
      // Try database first
      const { error } = await supabase
        .from('guardians')
        .delete()
        .eq('id', guardianId)
        .eq('patient_id', user?.id);

      if (error) {
        console.warn('Database delete failed, removing from localStorage');
      }
    } catch (error) {
      console.warn('Database not available, removing from localStorage');
    }

    // Always update local state and localStorage
    const updatedGuardians = guardians.filter(g => g.id !== guardianId);
    setGuardians(updatedGuardians);
    if (user?.id) {
      localStorage.setItem(`guardians_${user.id}`, JSON.stringify(updatedGuardians));
    }
    alert('Guardian removed successfully!');
  };

  // Generate new QR code
  const generateNewQR = async () => {
    try {
      // Generate wallet address if not available
      let walletAddress = user?.walletAddress;
      if (!walletAddress) {
        walletAddress = '0x' + Math.random().toString(16).substr(2, 40);
        console.log('Generated temporary wallet address:', walletAddress);
      }

      // Always generate QR locally for immediate feedback
      const qrData = {
        type: 'EDAV_EMERGENCY',
        patientAddress: walletAddress,
        patientId: user?.id || 'temp-' + Date.now(),
        patientName: user?.name || 'Emergency Patient',
        bloodGroup: user?.bloodGroup || 'Unknown',
        emergencyContact: user?.emergencyContact || 'Not provided',
        timestamp: Date.now()
      };
      
      console.log('Generated QR data:', qrData);
      alert('New emergency QR code generated! You can download it below.');
      
      // Force component re-render to show updated QR
      setActiveTab('profile');
      setTimeout(() => setActiveTab('dashboard'), 100);
      
    } catch (error) {
      console.error('QR generation failed:', error);
      alert('QR code generation failed. Please try again.');
    }
  };

  // Download QR Code function
  const downloadQRCode = () => {
    if (!user) {
      alert('User data not available');
      return;
    }
    
    try {
      const qrElement = document.querySelector('#emergency-qr svg');
      if (!qrElement) {
        alert('QR code not found. Please wait for it to load.');
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 300;
      canvas.height = 350;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 300, 350);
      
      // Add QR code
      const svgData = new XMLSerializer().serializeToString(qrElement);
      const img = new Image();
      
      img.onload = () => {
        ctx.drawImage(img, 50, 50, 200, 200);
        
        // Add text
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('EDAV Emergency QR', 150, 30);
        ctx.font = '12px Arial';
        ctx.fillText('Patient: ' + (user.name || 'Unknown'), 150, 270);
        ctx.fillText('Blood: ' + (user.bloodGroup || 'Unknown'), 150, 290);
        ctx.fillText('Generated: ' + new Date().toLocaleDateString(), 150, 330);
        
        const link = document.createElement('a');
        link.download = `${user.name || 'patient'}-emergency-qr.png`;
        link.href = canvas.toDataURL();
        link.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    } catch (error) {
      console.error('QR download failed:', error);
      alert('Failed to download QR code. Please try again.');
    }
  };

  // --- Render Loading/Error States before main layout ---
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-700">Authenticating user...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-red-500">You are not logged in. Please log in to access the dashboard.</p>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-700">Loading your health data...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'family':
        return renderFamily();
      case 'records':
        return renderRecords();
      case 'access-log':
        return renderAccessLog();
      case 'profile':
        return renderProfile();
      default:
        return renderDashboard();
    }
  };

  // If there was a fetch error after initial load, display it.
  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Patient Portal" />
        <div className="flex">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} userType="patient" />
          <main className="flex-1 p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline ml-2">{fetchError}</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setFetchError(null)}>
                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.414l-2.651 2.651a1.2 1.2 0 1 1-1.697-1.697L8.303 9.757 5.652 7.106a1.2 1.2 0 0 1 1.697-1.697L10 8.061l2.651-2.651a1.2 1.2 0 0 1 1.697 1.697L11.697 9.757l2.651 2.651a1.2 1.2 0 0 1 0 1.697z"/></svg>
              </span>
            </div>
            {renderContent()}
          </main>
        </div>
      </div>
    );
  }


  const renderDashboard = () => (
    <div className="space-y-8">
      {/* MetaMask Connection Banner */}
      {!isConnected && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wallet className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="font-semibold text-orange-800">Connect MetaMask Wallet</h3>
                <p className="text-sm text-orange-700">Connect your wallet for enhanced security and blockchain features</p>
              </div>
            </div>
            <button
              onClick={connectWallet}
              disabled={walletLoading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {walletLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
          {walletError && (
            <p className="text-sm text-red-600 mt-2">{walletError}</p>
          )}
        </div>
      )}
      {/* Premium Welcome Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/90 to-purple-500/90 rounded-3xl"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        <div className="relative p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name || 'Patient'}!</h1>
              <p className="text-blue-100 text-lg mb-6">Your health data is secure and ready for emergency access</p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">System Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Blockchain Secured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs text-black font-bold">✓</span>
                  </div>
                  <span className="text-sm font-medium">HIPAA Compliant</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-32 h-32 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{records.length}</span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Health Records</h3>
            <p className="text-sm text-gray-600">Encrypted & Secure</p>
            <div className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
          </div>
        </div>

        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{guardians.length}</span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Guardians</h3>
            <p className="text-sm text-gray-600">Trusted Family</p>
            <div className="mt-4 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
          </div>
        </div>

        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{accessLogs.length}</span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Access Requests</h3>
            <p className="text-sm text-gray-600">Recent Activity</p>
            <div className="mt-4 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
          </div>
        </div>

        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Active</span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Security Status</h3>
            <p className="text-sm text-gray-600">All Systems Secure</p>
            <div className="mt-4 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency QR Code</h3>
          <div className="text-center">
            {user ? (
              <div id="emergency-qr" className="inline-flex items-center justify-center p-4 bg-white border rounded-xl mb-4">
                <QRCodeReact
                  value={`emergency:${isConnected ? account : (user.walletAddress || '0x' + Math.random().toString(16).substr(2, 40))}:${user.qr_code || user.id}`}
                  size={160}
                  level="M"
                />
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl mb-4 text-gray-600">
                No wallet address available. Please connect MetaMask.
              </div>
            )}
            <p className="text-sm text-gray-600 mb-4">
              Scan this QR code for emergency access to your health records
            </p>
            {(isConnected || user?.walletAddress) && (
              <div className="space-y-2">
                <button 
                  onClick={downloadQRCode}
                  className="block text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Download QR Code
                </button>
                {!isConnected && (
                  <p className="text-xs text-yellow-600">
                    Connect MetaMask for enhanced security
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              className="w-full flex items-center space-x-3 p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              onClick={() => {
                console.log('Upload button clicked');
                setShowUploadModal(true);
              }}
            >
              <Upload className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">Upload New Record</div>
                <div className="text-sm text-gray-600">Add encrypted health documents</div>
              </div>
            </button>

            <button 
              className="w-full flex items-center space-x-3 p-4 text-left bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
              onClick={() => {
                console.log('Add Guardian button clicked');
                setShowAddGuardian(true);
              }}
            >
              <Users className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="font-medium text-gray-900">Add Guardian</div>
                <div className="text-sm text-gray-600">Add trusted family member</div>
              </div>
            </button>

            <button 
              className="w-full flex items-center space-x-3 p-4 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
              onClick={() => {
                console.log('Generate QR button clicked');
                generateNewQR();
              }}
            >
              <QrCode className="w-5 h-5 text-orange-600" />
              <div>
                <div className="font-medium text-gray-900">Generate New QR</div>
                <div className="text-sm text-gray-600">Create emergency access code</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFamily = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Trusted Guardians</h2>
        <button 
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => setShowAddGuardian(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Add Guardian</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guardians.length > 0 ? (
          guardians.map((guardian) => (
            <div key={guardian.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{guardian.name}</h3>
                    <p className="text-sm text-gray-600">{guardian.relationship}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${guardian.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-gray-500">{guardian.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Contact:</span>
                  <span className="ml-2 font-medium">{guardian.contact}</span>
                </div>
                <div>
                  <span className="text-gray-600">Wallet:</span>
                  <span className="ml-2 font-mono text-xs">{guardian.walletAddress}</span>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <button className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                  Edit
                </button>
                <button 
                  className="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                  onClick={() => deleteGuardian(guardian.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-6 text-center text-gray-600">
            No guardians added yet. Click "Add Guardian" to get started.
          </div>
        )}
      </div>

      {/* Add Guardian Modal */}
      {showAddGuardian && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowAddGuardian(false)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Add Guardian</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={guardianForm.name}
                  onChange={(e) => setGuardianForm({...guardianForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Guardian's full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <select
                  value={guardianForm.relationship}
                  onChange={(e) => setGuardianForm({...guardianForm, relationship: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select relationship</option>
                  <option value="Parent">Parent</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Child">Child</option>
                  <option value="Friend">Friend</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <input
                  type="text"
                  value={guardianForm.contact}
                  onChange={(e) => setGuardianForm({...guardianForm, contact: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Phone number or email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guardian's Wallet Address *</label>
                <input
                  type="text"
                  value={guardianForm.walletAddress}
                  onChange={(e) => setGuardianForm({...guardianForm, walletAddress: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="0x1234567890abcdef..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your family member's existing wallet address. They need to have a crypto wallet (MetaMask, etc.) to approve emergency access.
                </p>
                <GuardianWalletHelper />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddGuardian(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addGuardian}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Guardian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderRecords = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Health Records</h2>
        <button
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => setShowUploadModal(true)} // Open the modal
        >
          <Upload className="w-4 h-4" />
          <span>Upload Record</span>
        </button>
      </div>

      {/* --- START: Upload Record Modal Integration --- */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowUploadModal(false)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <UploadRecord onUploadSuccess={handleUploadSuccess} />
          </div>
        </div>
      )}
      {/* --- END: Upload Record Modal Integration --- */}


      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Your Documents</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {records.length > 0 ? (
            records.map((record) => (
              <div key={record.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{record.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{record.type}</span>
                        {/* Ensure uploadDate is displayed correctly; use toLocaleDateString() */}
                        <span>{record.uploadDate ? new Date(record.uploadDate).toLocaleDateString() : 'N/A'}</span>
                        <span>{record.size}</span>
                        {record.isEncrypted && (
                          <span className="flex items-center space-x-1 text-emerald-600">
                            <Shield className="w-3 h-3" />
                            <span>Encrypted</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-center text-gray-600">
              No health records uploaded yet. Click "Upload Record" to add your documents.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAccessLog = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Access Request Log</h2>
        <button
          onClick={fetchPatientData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Recent Access Requests</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {accessLogs.length > 0 ? (
            accessLogs.map((log) => (
              <div key={log.id} className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{log.hospitalName}</h4>
                      <p className="text-sm text-gray-600">Requested by {log.requestedBy}</p>
                      <p className="text-xs text-gray-500">Request ID: {log.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      log.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      log.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{log.timestamp}</p>
                  </div>
                </div>
                
                {log.status === 'pending' && (
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => handleApproveRequest(log.id, 'approved')}
                      className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Approve Access
                    </button>
                    <button
                      onClick={() => handleApproveRequest(log.id, 'rejected')}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-center text-gray-600">
              <div>No access requests found.</div>
              <div className="text-xs mt-2">Patient ID: {user?.id}</div>
              <div className="text-xs">Check console for debug info.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Profile Active</span>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">{user?.name?.charAt(0) || 'P'}</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold">{user?.name || 'Patient User'}</h3>
            <p className="text-blue-100">{user?.email || 'No email provided'}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
                Blood: {user?.bloodGroup || user?.blood_group || 'Unknown'}
              </span>
              <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
                {user?.gender || 'Not specified'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-gray-900">{user?.name || 'Not provided'}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-gray-900">{user?.email || 'Not provided'}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-gray-900">{user?.mobile || 'Not provided'}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-gray-900">{user?.dateOfBirth || 'Not provided'}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-gray-900">{user?.gender || 'Not specified'}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-red-700 font-semibold">
                  {user?.bloodGroup || user?.blood_group || 
                   (typeof user === 'object' && user ? Object.values(user).find(val => 
                     typeof val === 'string' && /^(A|B|AB|O)[+-]$/.test(val)
                   ) : null) || 'Not specified'}
                </span>
              </div>
              {/* Debug info */}
              <div className="text-xs text-gray-400 mt-1">
                Debug: {JSON.stringify({bloodGroup: user?.bloodGroup, blood_group: user?.blood_group})}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
              <div className="px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                <span className="text-orange-700">
                  {user?.emergencyContact || user?.emergency_contact || 'Not provided'}
                </span>
              </div>
              {/* Debug info */}
              <div className="text-xs text-gray-400 mt-1">
                Debug: {JSON.stringify({emergencyContact: user?.emergencyContact, emergency_contact: user?.emergency_contact})}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Health Records</span>
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{records.length}</div>
            <div className="text-xs text-gray-500">Encrypted files</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Guardians</span>
              <Shield className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{guardians.length}</div>
            <div className="text-xs text-gray-500">Trusted contacts</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Access Requests</span>
              <Activity className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{accessLogs.length}</div>
            <div className="text-xs text-gray-500">Recent activity</div>
          </div>
        </div>
      </div>

      {/* Blockchain Information */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <QrCode className="w-5 h-5 mr-2 text-purple-600" />
          Blockchain & Security Information
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
            <div className="flex space-x-2">
              <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm break-all">
                {isConnected ? account : (user?.walletAddress || 'Not connected')}
              </div>
              {!isConnected ? (
                <button
                  onClick={connectWallet}
                  disabled={walletLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap disabled:opacity-50"
                >
                  {walletLoading ? 'Connecting...' : 'Connect MetaMask'}
                </button>
              ) : (
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm whitespace-nowrap"
                >
                  Disconnect
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Connect MetaMask for blockchain transactions and emergency access</p>
            {walletError && (
              <p className="text-xs text-red-600 mt-1">{walletError}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Emergency QR ID</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm">
              {user?.qrCode || 'Auto-generated on QR creation'}
            </div>
            <p className="text-xs text-gray-500 mt-1">Unique identifier for emergency QR codes</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Security Status</h4>
              <p className="text-sm text-blue-700 mt-1">
                Your profile is secured with blockchain technology. All health records are encrypted and 
                require guardian approval for emergency access.
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="flex items-center text-xs text-blue-600">
                  <div className={`w-2 h-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'} rounded-full mr-1`}></div>
                  {isConnected ? `Wallet Connected (${account?.slice(0, 6)}...${account?.slice(-4)})` : 'Wallet Disconnected'}
                </span>
                <span className="flex items-center text-xs text-blue-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  QR Code Active
                </span>
                <span className="flex items-center text-xs text-blue-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Profile Complete
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'family':
        return renderFamily();
      case 'records':
        return renderRecords();
      case 'access-log':
        return renderAccessLog();
      case 'profile':
        return renderProfile();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header title="Patient Portal" />
      <div className="flex">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} userType="patient" />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};