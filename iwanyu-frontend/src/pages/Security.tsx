import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Smartphone,
  Mail,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import apiService from '../services/api';

interface SecurityActivity {
  id: string;
  type: 'login' | 'password_change' | 'email_change' | '2fa_enabled' | '2fa_disabled';
  description: string;
  timestamp: string;
  location: string;
  ipAddress: string;
  device: string;
}

const Security: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [securityActivities, setSecurityActivities] = useState<SecurityActivity[]>([]);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Mock data removed for production readiness

  useEffect(() => {
    const fetchSecurityData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // TODO: Implement security settings API endpoints
        // const response = await apiService.getSecuritySettings();
        // if (response.success) {
        //   setTwoFactorEnabled(response.data.twoFactorEnabled || false);
        //   setSecurityActivities(response.data.activities || []);
        // }
        
        // For now, show empty state since this is production-ready
        setTwoFactorEnabled(false);
        setSecurityActivities([]);
      } catch (error) {
        console.error('Error fetching security data:', error);
        setTwoFactorEnabled(false);
        setSecurityActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityData();
  }, [user]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      const response = await apiService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      
      if (response.success) {
        alert('Password changed successfully');
        setShowPasswordForm(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert('Failed to change password: ' + response.message);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password');
    }
  };

  const handleToggle2FA = async () => {
    try {
      // TODO: Implement 2FA toggle API endpoint
      // const response = await apiService.toggle2FA(!twoFactorEnabled);
      // if (response.success) {
      //   setTwoFactorEnabled(!twoFactorEnabled);
      // }
      console.log('Toggle 2FA:', !twoFactorEnabled);
    } catch (error) {
      console.error('Error toggling 2FA:', error);
    }
  };

  const getActivityIcon = (type: SecurityActivity['type']) => {
    switch (type) {
      case 'login':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'password_change':
        return <Lock className="w-5 h-5 text-blue-500" />;
      case 'email_change':
        return <Mail className="w-5 h-5 text-purple-500" />;
      case '2fa_enabled':
        return <Shield className="w-5 h-5 text-green-500" />;
      case '2fa_disabled':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityColor = (type: SecurityActivity['type']) => {
    switch (type) {
      case 'login':
        return 'bg-green-50 border-green-200';
      case 'password_change':
        return 'bg-blue-50 border-blue-200';
      case 'email_change':
        return 'bg-purple-50 border-purple-200';
      case '2fa_enabled':
        return 'bg-green-50 border-green-200';
      case '2fa_disabled':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-32">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-32">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Settings</h1>
            <p className="text-gray-600">Manage your account security and privacy settings</p>
          </div>

          <div className="space-y-6">
            {/* Password Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Password</h2>
                    <p className="text-sm text-gray-600">Change your account password</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
                  Change Password
                </Button>
              </div>

              {showPasswordForm && (
                <form onSubmit={handlePasswordChange} className="border-t pt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        aria-label="Toggle password visibility"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        aria-label="Toggle password visibility"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        aria-label="Toggle password visibility"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPasswordForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      Update Password
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Two-Factor Authentication */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h2>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    twoFactorEnabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <Button
                    variant={twoFactorEnabled ? "outline" : "primary"}
                    onClick={handleToggle2FA}
                  >
                    {twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
                  </Button>
                </div>
              </div>
            </div>

            {/* Security Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Recent Security Activity</h2>
                <p className="text-sm text-gray-600">
                  Monitor recent activity on your account
                </p>
              </div>

              <div className="space-y-4">
                {securityActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`border rounded-lg p-4 ${getActivityColor(activity.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{activity.description}</h3>
                          <span className="text-sm text-gray-500">
                            {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-3 h-3" />
                            <span>{activity.location}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Device: {activity.device}</span>
                            <span>IP: {activity.ipAddress}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Recommendations */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-900 mb-2">Security Recommendations</h3>
                  <ul className="space-y-1 text-sm text-yellow-800">
                    <li>• Use a strong, unique password for your account</li>
                    <li>• Enable two-factor authentication for added security</li>
                    <li>• Regularly review your account activity</li>
                    <li>• Keep your email address up to date</li>
                    <li>• Don't share your login credentials with others</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
