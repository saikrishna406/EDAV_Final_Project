import React, { useState } from 'react';
import { Shield, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface AccessRequest {
  id: string;
  patient: string;
  hospital: string;
  timestamp: string;
  approvals: string;
  executed: boolean;
}

export const GuardianDashboard: React.FC = () => {
  const [pendingRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const handleApproveAccess = async (requestId: string) => {
    setLoading(true);
    try {
      const guardianPrivateKey = prompt('Enter your guardian private key:');
      if (!guardianPrivateKey) return;

      const response = await fetch('http://localhost:5001/api/guardian/approve-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, guardianPrivateKey })
      });

      const result = await response.json();
      if (result.success) {
        alert('Access approved successfully!');
      } else {
        alert('Failed to approve access: ' + result.error);
      }
    } catch (error) {
      alert('Error approving access');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <Shield className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Guardian Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Review and approve emergency access requests for patients under your guardianship.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Pending Access Requests
          </h2>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">No pending access requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                        <h3 className="font-semibold text-gray-900">
                          Emergency Access Request #{request.id}
                        </h3>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Patient:</strong> {request.patient}</p>
                        <p><strong>Hospital:</strong> {request.hospital}</p>
                        <p><strong>Time:</strong> {new Date(parseInt(request.timestamp) * 1000).toLocaleString()}</p>
                        <p><strong>Approvals:</strong> {request.approvals}/2 required</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleApproveAccess(request.id)}
                      disabled={loading || request.executed}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Approving...' : 'Approve Access'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};