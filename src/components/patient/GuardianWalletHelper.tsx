import React, { useState } from 'react';
import { Wallet, Copy, ExternalLink, Info } from 'lucide-react';

export const GuardianWalletHelper: React.FC = () => {
  const [showHelper, setShowHelper] = useState(false);
  const [generatedWallet, setGeneratedWallet] = useState<{address: string, privateKey: string} | null>(null);

  const generateSampleWallet = () => {
    // Generate a sample wallet address for demonstration
    const address = '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const privateKey = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    setGeneratedWallet({ address, privateKey });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (!showHelper) {
    return (
      <button
        onClick={() => setShowHelper(true)}
        className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
      >
        <Info className="w-4 h-4" />
        <span>Need help with wallet addresses?</span>
      </button>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium text-blue-900">Guardian Wallet Address Help</h4>
        <button
          onClick={() => setShowHelper(false)}
          className="text-blue-600 hover:text-blue-800"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-3 text-sm text-blue-800">
        <p>Your guardian needs a crypto wallet to approve emergency access. Here's what they need:</p>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            <span>Install MetaMask or similar wallet app</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            <span>Create a new wallet account</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            <span>Share their wallet address with you</span>
          </div>
        </div>

        <div className="border-t border-blue-200 pt-3">
          <p className="font-medium mb-2">For testing purposes, you can generate a sample address:</p>
          
          {!generatedWallet ? (
            <button
              onClick={generateSampleWallet}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Wallet className="w-4 h-4" />
              <span>Generate Sample Wallet</span>
            </button>
          ) : (
            <div className="space-y-2">
              <div className="bg-white rounded p-2 border">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium">Address:</span>
                  <button
                    onClick={() => copyToClipboard(generatedWallet.address)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <code className="text-xs break-all">{generatedWallet.address}</code>
              </div>
              
              <p className="text-xs text-blue-600">
                ⚠️ This is for testing only. In production, use real wallet addresses from MetaMask, etc.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-blue-200 pt-3">
          <a
            href="https://metamask.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Download MetaMask</span>
          </a>
        </div>
      </div>
    </div>
  );
};