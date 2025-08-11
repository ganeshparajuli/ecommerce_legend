import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LogOut } from 'lucide-react';
import { logout } from '../../redux/actions/userActions';
import { toast } from 'react-hot-toast';
import api from '../../redux/api';

const SignOut: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Effect to check authentication
  React.useEffect(() => {
    if (!api.checkAuth()) {
      toast.error('You are not logged in');
      navigate('/login');
    }
  }, [navigate]);

  // Handle sign out process
  const handleSignOut = () => {
    dispatch(logout());
    toast.success('You have been signed out successfully');
    navigate('/login');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="h-8 w-8 text-gray-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sign Out</h1>
          <p className="text-gray-600 mt-2">
            Are you sure you want to sign out from your account?
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button
            onClick={() => navigate('/profile')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSignOut}
            className="px-6 py-2 bg-[#AD5C10] text-white rounded-lg hover:bg-[#c26a13] transition-colors flex items-center justify-center"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignOut;