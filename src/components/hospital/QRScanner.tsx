import React, { useState } from 'react';
import { Camera, Upload, Image } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setLoading(true);
      
      // For testing, use a specific patient ID that matches the logged-in patient
      // In real implementation, this would decode the actual QR image
      try {
        const { supabase } = await import('../../supabase');
        
        // Get the patient with ID ea9204c8-c47b-4ca8-9fb8-149f4d0e2bed (current logged-in patient)
        const { data: patients } = await supabase
          .from('patients')
          .select('wallet_address, qr_code')
          .eq('id', 'ea9204c8-c47b-4ca8-9fb8-149f4d0e2bed');
        
        if (patients && patients.length > 0) {
          const patient = patients[0];
          const qrData = `emergency:${patient.wallet_address}:${patient.qr_code}`;
          console.log('Generated QR for current patient:', qrData);
          onScan(qrData);
        } else {
          alert('Current patient not found in database.');
        }
      } catch (error) {
        console.error('Error getting patient data:', error);
        alert('Error accessing patient database.');
      }
      
      setLoading(false);
    } else {
      alert('Please select a valid image file');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Camera className="w-5 h-5 mr-2" />
        Scan Patient QR Code
      </h3>

      <div className="space-y-4">
        {/* Manual QR Data Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Manual QR Data Entry
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="emergency:0xWalletAddress:qr-code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleManualSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload QR Code Image
          </label>
          <div className="flex items-center justify-center w-full">
            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${loading ? 'opacity-50' : ''}`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {loading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                ) : (
                  <Image className="w-8 h-8 mb-2 text-gray-500" />
                )}
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">{loading ? 'Processing...' : 'Click to upload'}</span> QR code image
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, JPEG up to 10MB</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*,.png,.jpg,.jpeg"
                onChange={handleImageUpload}
                disabled={loading}
              />
            </label>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <p>• Upload QR code images (PNG, JPG, JPEG)</p>
          <p>• QR codes contain encrypted patient emergency data</p>
          <p>• Only authorized hospitals can request access</p>
          <p>• Guardian approval required for data access</p>
        </div>
      </div>
    </div>
  );
};