import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useMetaMask } from './useMetaMask';
import EDAVAccessABI from '../contracts/EDAVAccess.json';

// For demo purposes, we'll use a mock contract address
// Replace with actual deployed contract address
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export const useContract = () => {
  const { isConnected } = useMetaMask();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        provider.getSigner().then(signer => {
          const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, EDAVAccessABI.abi, signer);
          setContract(contractInstance);
        }).catch(error => {
          console.warn('Contract initialization failed:', error);
        });
      } catch (error) {
        console.warn('Provider initialization failed:', error);
      }
    }
  }, [isConnected]);

  const registerPatient = async (patientAddress: string, ipfsHash: string, guardians: string[]) => {
    if (!contract || !contract.registerPatient) return null;
    setLoading(true);
    try {
      const tx = await contract.registerPatient(patientAddress, ipfsHash, guardians);
      await tx.wait();
      return tx;
    } finally {
      setLoading(false);
    }
  };

  const requestAccess = async (patientAddress: string) => {
    if (!contract || !contract.requestAccess) return null;
    setLoading(true);
    try {
      const tx = await contract.requestAccess(patientAddress);
      await tx.wait();
      return tx;
    } finally {
      setLoading(false);
    }
  };

  const approveAccess = async (requestId: number) => {
    if (!contract || !contract.approveAccess) return null;
    setLoading(true);
    try {
      const tx = await contract.approveAccess(requestId);
      await tx.wait();
      return tx;
    } finally {
      setLoading(false);
    }
  };

  return {
    contract,
    loading,
    registerPatient,
    requestAccess,
    approveAccess,
    isReady: !!contract
  };
};