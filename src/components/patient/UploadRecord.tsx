import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { patientAPI } from '../../services/api';
import { supabase } from '../../supabase';
import CryptoJS from 'crypto-js';



export const UploadRecord: React.FC<{ onUploadSuccess: () => void }> = ({ onUploadSuccess }) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setUploadError(null);
    }
  };

  const generateEncryptionKey = () => {
    const newKey = CryptoJS.lib.WordArray.random(256 / 8).toString();
    setEncryptionKey(newKey);
    alert("Generated Encryption Key (Store This Safely!): " + newKey);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const uploadToIPFS = async (file: File, _key: string) => {
    if (!user || !user.id) {
      setUploadError("User not logged in.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    // Read file as array buffer and encrypt it first
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);
    
    // Encrypt file data
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.lib.WordArray.create(fileData), 
      key
    ).toString();
    
    try {
      // Create encrypted file blob
      const encryptedBlob = new Blob([encrypted], { type: 'text/plain' });
      
      // Upload to Pinata IPFS
      const formData = new FormData();
      formData.append('file', encryptedBlob, `encrypted_${file.name}`);
      
      const metadata = JSON.stringify({
        name: `encrypted_${file.name}`,
        keyvalues: {
          patient_id: user.id,
          original_name: file.name,
          encrypted: 'true'
        }
      });
      formData.append('pinataMetadata', metadata);
      
      const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT}`
        },
        body: formData
      });
      
      console.log('Pinata response status:', pinataResponse.status);
      
      console.log('Pinata response status:', pinataResponse.status);
      
      if (!pinataResponse.ok) {
        const errorText = await pinataResponse.text();
        console.error('Pinata error response:', errorText);
        throw new Error(`Failed to upload to IPFS: ${pinataResponse.status} - ${errorText}`);
      }
      
      const responseText = await pinataResponse.text();
      console.log('Pinata raw response:', responseText);
      
      let pinataData;
      try {
        pinataData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse Pinata response:', parseError);
        throw new Error('Invalid response from Pinata');
      }
      
      const ipfsHash = pinataData.IpfsHash;
      if (!ipfsHash) {
        console.error('No IPFS hash in response:', pinataData);
        throw new Error('No IPFS hash returned from Pinata');
      }
      
      console.log('Successfully uploaded to IPFS:', ipfsHash);
      
      // Store record in database with IPFS hash and encryption key
      try {
        const { error: dbError } = await supabase.from('health_records').insert({
          patient_id: user.id,
          name: file.name,
          type: file.type,
          upload_date: new Date().toISOString(),
          ipfs_cid: ipfsHash,
          encryption_key: key,
          is_encrypted: true,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        });
        
        if (dbError) {
          console.warn('Database storage failed:', dbError);
          // Continue without throwing error since IPFS upload succeeded
        }
      } catch (dbErr) {
        console.warn('Database metadata storage failed:', dbErr);
        // Continue without throwing error since IPFS upload succeeded
      }
      
      setSelectedFile(null);
      setEncryptionKey('');
      alert(`File encrypted and uploaded to IPFS successfully!\nIPFS Hash: ${ipfsHash}`);
      onUploadSuccess();
    } catch (err: any) {
      console.error('IPFS upload failed:', err);
      setUploadError(`IPFS upload failed: ${err.message}. Please check your Pinata configuration.`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload New Health Record</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleUploadClick}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            disabled={uploading}
          >
            <Upload className="w-5 h-5" />
            <span>{selectedFile ? selectedFile.name : 'Choose File'}</span>
          </button>
          {selectedFile && (
            <p className="text-sm text-gray-500 mt-2">Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Encryption Key (Temporary Example)</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={encryptionKey}
              onChange={(e) => setEncryptionKey(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter encryption key or generate"
              disabled={uploading}
            />
            <button
              type="button"
              onClick={generateEncryptionKey}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              disabled={uploading}
            >
              Generate Key
            </button>
          </div>
          <p className="text-xs text-red-500 mt-1">
            WARNING: In a real system, securely manage this key. Do NOT store it in plain text in Firestore!
          </p>
        </div>

        {uploadError && (
          <div className="text-red-500 text-sm mt-3">{uploadError}</div>
        )}

        <button
          type="button"
          onClick={() => selectedFile && encryptionKey && uploadToIPFS(selectedFile, encryptionKey)}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          disabled={!selectedFile || !encryptionKey || uploading}
        >
          {uploading ? 'Uploading...' : 'Encrypt & Upload to IPFS'}
        </button>
      </div>
    </div>
  );
};