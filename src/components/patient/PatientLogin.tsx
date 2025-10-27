import React, { useState, useEffect } from 'react';
import { Shield, Mail, Lock, Fingerprint, QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase';


export const PatientLogin: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    emergencyContact: '',
    walletAddress: '',
    mobile: '',
  });

  const { login: authContextLogin } = useAuth();

  useEffect(() => {
    return () => {};
  }, [isLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!data.user) throw new Error('Login failed');

      const { data: patientData } = await supabase
        .from('patients')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (patientData) {
        const mappedUser = {
          id: patientData.id,
          name: patientData.name,
          email: patientData.email,
          mobile: patientData.mobile || '',
          dateOfBirth: patientData.date_of_birth || '',
          gender: patientData.gender || '',
          bloodGroup: patientData.blood_group || '',
          walletAddress: patientData.wallet_address || '0x' + Math.random().toString(16).substr(2, 40),
          emergencyContact: patientData.emergency_contact || '',
          qrCode: patientData.qr_code || '',
        };
        await authContextLogin(data.user.id, mappedUser as any, 'patient');
      } else {
        const minimalUser = {
          id: data.user.id,
          name: data.user.user_metadata?.name || 'Patient User',
          email: data.user.email || formData.email,
          mobile: '',
          dateOfBirth: '',
          gender: '',
          bloodGroup: '',
          walletAddress: '0x' + Math.random().toString(16).substr(2, 40),
          emergencyContact: '',
          qrCode: '',
        };
        await authContextLogin(data.user.id, minimalUser, 'patient');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      if (!formData.name || !formData.dateOfBirth || !formData.gender || !formData.bloodGroup || !formData.mobile) {
        setError('Please fill in all personal information fields, including Mobile Number.');
        return;
      }
      setStep(step + 1);
      return;
    }

    if (step < 3) {
      setStep(step + 1);
      return;
    }
    
    setLoading(true);
    try {
      if (!formData.email || !formData.password) {
        setError('Email and password are required for registration.');
        setLoading(false);
        return;
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
          emailRedirectTo: undefined
        }
      });

      if (authError) throw authError;
      if (!data.user) throw new Error('Registration failed');

      const patientDataToSave = {
        id: data.user.id,
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        blood_group: formData.bloodGroup,
        wallet_address: formData.walletAddress || '0x' + Math.random().toString(16).substr(2, 40),
        emergency_contact: formData.emergencyContact,
        qr_code: 'patient-emergency-qr-' + Math.random().toString(36).substr(2, 9),
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      await authContextLogin(data.user.id, patientDataToSave, 'patient');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (isLogin) {
      handleLogin(e);
    } else {
      handleRegistration(e);
    }
  };

  const renderLoginForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your password"
            required
            disabled={loading}
          />
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm text-center mt-3">
          {error}
        </div>
      )}

      <div className="flex items-center justify-center space-x-4 pt-4">
        <button
          type="button"
          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          <Fingerprint className="w-4 h-4" />
          <span>Biometric Login</span>
        </button>
      </div>
    </div>
  );

  const renderRegistrationStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="flex justify-center space-x-2 mb-4">
                <div className="w-8 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
                <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={loading}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={loading}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter mobile number"
                  required
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Create a password (min 6 characters)"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center mt-3">
                {error}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="flex justify-center space-x-2 mb-4">
                <div className="w-8 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-8 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Emergency Contact & Wallet</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact (Optional)</label>
                <input
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter emergency contact"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.walletAddress}
                    onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                    className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter wallet address or auto-generate"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, walletAddress: '0x' + Math.random().toString(16).substr(2, 40) })}
                    className="px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    disabled={loading}
                  >
                    Generate
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This will be used for blockchain transactions and emergency access
                </p>
              </div>
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center mt-3">
                {error}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="flex justify-center space-x-2 mb-4">
                <div className="w-8 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-8 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-8 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Review & Generate QR</h3>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Registration Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Blood Group:</span>
                  <span className="font-medium">{formData.bloodGroup}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mobile:</span>
                  <span className="font-medium">{formData.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Wallet:</span>
                  <span className="font-medium text-xs">{formData.walletAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emergency Contact:</span>
                  <span className="font-medium">{formData.emergencyContact || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-lg mb-4">
                <QrCode className="w-12 h-12 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">
                Your emergency QR code will be generated after registration
              </p>
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center mt-3">
                {error}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>
      
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-2xl">
              <Shield className="w-10 h-10 text-white" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Join EDAV'}
            </h1>
            <p className="text-gray-300">
              {isLogin ? 'Access your secure health vault' : 'Create your emergency health profile'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {isLogin ? renderLoginForm() : renderRegistrationStep()}

            <div className="mt-8">
              <button
                type="submit"
                className="group relative w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-4 rounded-2xl font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none overflow-hidden"
                disabled={loading}
              >
                <span className="relative z-10">
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {isLogin ? 'Signing In...' : 'Creating Account...'}
                    </div>
                  ) : (
                    isLogin ? 'Sign In Securely' : step === 3 ? 'Complete Registration' : 'Continue'
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {!isLogin && step > 1 && (
              <button
                type="button"
                onClick={() => {
                  setStep(step - 1);
                  setError(null);
                }}
                className="w-full mt-3 py-3 px-4 text-gray-300 hover:text-white transition-all duration-300 border border-white/30 rounded-2xl hover:bg-white/10 backdrop-blur-sm transform hover:scale-105"
                disabled={loading}
              >
                Back
              </button>
            )}
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setStep(1);
                setError(null);
                setLoading(false);
                setFormData({
                  email: '',
                  password: '',
                  name: '',
                  dateOfBirth: '',
                  gender: '',
                  bloodGroup: '',
                  emergencyContact: '',
                  walletAddress: '',
                  mobile: '',
                });
              }}
              className="text-blue-300 hover:text-white font-medium transition-all duration-300 hover:scale-105"
            >
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Sign In'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
            
            <div className="flex items-center justify-center space-x-6 mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">256-bit Encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-gray-400">HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};