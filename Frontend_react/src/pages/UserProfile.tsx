import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Shield, Check, X } from 'lucide-react';
import { doc, updateDoc, setDoc } from 'firebase/firestore'; // Added setDoc for more robust writing
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';
import toast from 'react-hot-toast';

interface FormData {
  fullName: string;
  phoneNumber: string;
  university: string;
  preferredRole: string;
  receivedCallback: boolean;
}

interface UserData {
  emailgencount: number;
  trialCount: number;
  fullName?: string;
  phoneNumber?: string;
  university?: string;
  preferredRole?: string;
  receivedCallback?: boolean;
  [key: string]: any;
}

interface Message {
  type: string;
  content: string;
}

interface CustomSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { userData } = useUserData() as { userData: UserData | null };
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phoneNumber: '',
    university: '',
    preferredRole: '',
    receivedCallback: false
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<Message>({ type: '', content: '' });

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || '',
        phoneNumber: userData.phoneNumber || '',
        university: userData.university || '',
        preferredRole: userData.preferredRole || '',
        receivedCallback: userData.receivedCallback || false
      });
      setLoading(false);
    }
  }, [userData]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      if (!user) {
        toast.error('No user logged in');
        return;
      }

      const userRef = doc(db, 'user_profiles', user.uid);
      
      // Use setDoc instead of updateDoc to create the document if it doesn't exist
      await setDoc(userRef, {
        ...formData,
        updatedAt: new Date().toISOString(),
        userId: user.uid, // Explicitly add user ID
        email: user.email // Add email if available
      }, { merge: true }); // merge: true allows partial updates

      toast.success('Profile updated successfully!');
      setMessage({ type: 'success', content: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Detailed Error updating profile:', error);
      
      // More detailed error handling
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
        setMessage({ 
          type: 'error', 
          content: `Failed to update profile: ${error.message}` 
        });
      } else {
        toast.error('Unknown error occurred');
        setMessage({ 
          type: 'error', 
          content: 'An unknown error prevented profile update' 
        });
      }
    }
  };


  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const CustomSwitch: React.FC<CustomSwitchProps> = ({ checked, onChange }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)} // Fixed the toggle logic
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? 'bg-blue-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {message.content && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'error' 
            ? 'bg-red-50 border border-red-200 text-red-700'
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {message.type === 'error' ? (
            <X className="h-5 w-5 text-red-400" />
          ) : (
            <Check className="h-5 w-5 text-green-400" />
          )}
          <p className="text-sm">{message.content}</p>
        </div>
      )}

      <div className="bg-slate-900/50 rounded-xl shadow-lg overflow-hidden border border-slate-700">
        <div className="border-b border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            Personal Information
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg 
                         text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         placeholder-slate-400"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg 
                         text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         placeholder-slate-400"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-xl shadow-lg overflow-hidden border border-slate-700">
        <div className="border-b border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-400" />
            Professional Details
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">University</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="university"
                value={formData.university}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg 
                         text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         placeholder-slate-400"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Preferred Role</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="preferredRole"
                value={formData.preferredRole}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg 
                         text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         placeholder-slate-400"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-xl shadow-lg overflow-hidden border border-slate-700">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-200">Received Callback</label>
              <p className="text-sm text-slate-400">Toggle if you've received a callback</p>
            </div>
            <CustomSwitch
              checked={formData.receivedCallback}
              onChange={(checked) => setFormData(prev => ({ ...prev, receivedCallback: !prev.receivedCallback }))}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 px-4 bg-blue-500 text-white font-medium rounded-lg 
                 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 
                 focus:ring-offset-2 transition-colors duration-200"
      >
        Save Changes
      </button>
    </form>
  );
};

export default UserProfile;