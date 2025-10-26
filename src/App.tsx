import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Import AuthProvider and useAuth from your updated AuthContext
import { AuthProvider, useAuth } from './context/AuthContext';

// Import your page/component files
import { PatientLogin } from './components/patient/PatientLogin';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { HospitalLogin } from './components/hospital/HospitalLogin';
import { HospitalDashboard } from './components/hospital/HospitalDashboard';


// Import Lucide React icons
import { Shield, Hospital, User } from 'lucide-react';

// --- LandingPage Component ---
const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Sophisticated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Premium Navigation */}
      <nav className="relative z-50 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">EDAV</span>
                <div className="text-xs text-blue-300 font-medium">Emergency Digital Access Vault</div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white font-medium transition-all duration-300 hover:scale-105">Features</a>
              <a href="#security" className="text-gray-300 hover:text-white font-medium transition-all duration-300 hover:scale-105">Security</a>
              <a href="#contact" className="text-gray-300 hover:text-white font-medium transition-all duration-300 hover:scale-105">Support</a>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex items-center space-x-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-8 shadow-2xl relative">
              <Shield className="w-12 h-12 text-white" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
            Emergency
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">Health Access</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
            Next-generation blockchain platform revolutionizing emergency medical care. 
            <br className="hidden md:block" />
            Trusted by leading healthcare institutions worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
              <span className="relative z-10">Explore Platform</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <button className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      {/* Premium Portal Cards */}
      <div className="relative z-10 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Patient Portal */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-500">
                <div className="flex items-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-6 shadow-2xl">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Patient Portal</h2>
                    <p className="text-blue-200">Secure Health Management</p>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  {[
                    'Military-grade encryption for medical records',
                    'AI-powered guardian management system',
                    'Instant emergency QR code generation',
                    'Blockchain-verified access control',
                    'Real-time security monitoring'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-200">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mr-4"></div>
                      <span className="font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
                <a href="/patient" className="group/btn relative w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 px-6 rounded-2xl font-semibold text-center hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 inline-block overflow-hidden">
                  <span className="relative z-10">Enter Patient Portal</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                </a>
              </div>
            </div>

            {/* Hospital Portal */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-500">
                <div className="flex items-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mr-6 shadow-2xl">
                    <Hospital className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Hospital Portal</h2>
                    <p className="text-emerald-200">Emergency Medical Access</p>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  {[
                    'Advanced QR code scanning technology',
                    'Instant emergency access requests',
                    'HIPAA-compliant record viewing',
                    'Comprehensive audit trail system',
                    'Multi-factor authentication'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-200">
                      <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mr-4"></div>
                      <span className="font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
                <a href="/hospital" className="group/btn relative w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 px-6 rounded-2xl font-semibold text-center hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 inline-block overflow-hidden">
                  <span className="relative z-10">Enter Hospital Portal</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Features Section */}
      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">How EDAV Works</h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">Revolutionary three-step process ensuring secure emergency medical access</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Secure Upload',
                description: 'Advanced encryption algorithms protect medical records with military-grade security standards.',
                gradient: 'from-blue-500 to-purple-500',
                icon: '🔒'
              },
              {
                step: '02', 
                title: 'Emergency Scan',
                description: 'AI-powered QR scanning initiates blockchain-verified emergency access requests instantly.',
                gradient: 'from-emerald-500 to-teal-500',
                icon: '⚡'
              },
              {
                step: '03',
                title: 'Guardian Approval',
                description: 'Smart contracts automatically process guardian approvals, unlocking critical medical data.',
                gradient: 'from-orange-500 to-red-500',
                icon: '✅'
              }
            ].map((item, index) => (
              <div key={index} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500`}></div>
                <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 text-center hover:bg-white/15 transition-all duration-500">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${item.gradient} rounded-2xl mb-6 shadow-2xl text-2xl`}>
                    {item.icon}
                  </div>
                  <div className="text-6xl font-bold text-white/20 mb-4">{item.step}</div>
                  <h4 className="text-2xl font-bold text-white mb-4">{item.title}</h4>
                  <p className="text-gray-300 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Premium Trust Section */}
      <div className="relative z-10 py-16 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h4 className="text-2xl font-bold text-white mb-4">Trusted by Healthcare Leaders</h4>
            <p className="text-gray-400">Enterprise-grade security and compliance standards</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Shield, label: 'HIPAA Compliant', color: 'text-blue-400' },
              { icon: '🛡️', label: 'SOC 2 Type II', color: 'text-green-400' },
              { icon: '🔐', label: 'AES-256 Encryption', color: 'text-purple-400' },
              { icon: '⛓️', label: 'Blockchain Secured', color: 'text-cyan-400' }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center group">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/20 transition-all duration-300">
                  {typeof item.icon === 'string' ? (
                    <span className="text-2xl">{item.icon}</span>
                  ) : (
                    <item.icon className={`w-8 h-8 ${item.color}`} />
                  )}
                </div>
                <span className="text-sm font-semibold text-white text-center">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 🔐 ProtectedRoute wrapper
const ProtectedRoute: React.FC<{
  children: JSX.Element;
  allowedRole: 'patient' | 'hospital' | 'admin'; // Use specific types for roles
}> = ({ children, allowedRole }) => {
  const { isAuthenticated, userType, loadingAuth } = useAuth(); // Get loadingAuth

  // Show a loading state while authentication is being checked
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-700 text-lg">Loading secure content...</p>
      </div>
    );
  }

  // If not authenticated OR userType does not match allowedRole, redirect to home
  if (!isAuthenticated || userType !== allowedRole) {
    // Optionally log why they're redirected for debugging
    console.log(`Redirecting: isAuthenticated=${isAuthenticated}, userType=${userType}, allowedRole=${allowedRole}`);
    return <Navigate to="/" replace />;
  }

  return children;
};

// 📦 Routes Setup
const AppRoutes: React.FC = () => {
  const { isAuthenticated, userType, loadingAuth } = useAuth(); // Destructure loadingAuth

  // Display a loading indicator while Firebase Auth state is being determined
  // This is the CRITICAL change to prevent blank page on initial load
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-700 text-lg">Initializing application...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/patient"
        element={
          isAuthenticated && userType === 'patient' ? (
            // If authenticated as a patient, show PatientDashboard via ProtectedRoute
            <ProtectedRoute allowedRole="patient">
              <PatientDashboard />
            </ProtectedRoute>
          ) : (
            // Otherwise, show PatientLogin
            <PatientLogin />
          )
        }
      />
      <Route
        path="/hospital"
        element={
          isAuthenticated && userType === 'hospital' ? (
            // If authenticated as a hospital, show HospitalDashboard via ProtectedRoute
            <ProtectedRoute allowedRole="hospital">
              <HospitalDashboard />
            </ProtectedRoute>
          ) : (
            // Otherwise, show HospitalLogin
            <HospitalLogin />
          )
        }
      />
      {/* Fallback route for any unknown paths */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// --- Main App Component ---
const App: React.FC = () => {
  return (
    <AuthProvider> {/* AuthProvider wraps the entire application to provide context */}
      <Router> {/* Router wraps the routes for navigation */}
        <AppRoutes /> {/* AppRoutes handles conditional rendering based on auth state */}
      </Router>
    </AuthProvider>
  );
};

export default App;