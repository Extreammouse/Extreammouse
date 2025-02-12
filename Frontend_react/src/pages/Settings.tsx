import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  MessageSquare, 
  UserCircle, 
  Settings as SettingsIcon, 
  Crown, 
  Zap, 
  FileText, 
  Calendar, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink 
} from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import AppBar from '../components/AppBar';
import Button from '../components/Button';
import { useUserData } from '../hooks/useUserData';
import { useAuth } from '../hooks/useAuth';
import UserProfile from './UserProfile';
import toast from 'react-hot-toast';

interface UserData {
  email: string | null;
  plan: string | null;
  emailgencount: number;
  trialCount: number;
}

interface UseUserDataReturn {
  userData: UserData | null;
  loading: boolean;
}

interface EmailHistory {
  id: string;
  userId: string;
  company: string;
  jobPosition: string;
  generatedEmail: string;
  emailSubject: string;
  recruiterDetails: Array<{
    name: string;
    email: string;
  }>;
  generatedAt: {
    toDate: () => Date;
  };
  status?: 'pending' | 'responded' | 'followup';
  lastResponse?: string;
  followUpCount?: number;
  lastFollowUpDate?: {
    toDate: () => Date;
  };
}

interface CoverLetterHistory {
  id: string;
  userId: string;
  company: string;
  position: string;
  coverLetter: string;
  createdAt: {
    toDate: () => Date;
  };
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userData, loading } = useUserData() as UseUserDataReturn;
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([]);
  const [coverLetterHistory, setCoverLetterHistory] = useState<CoverLetterHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const openContactEmail = (): void => {
    const subject = encodeURIComponent('QuickSend AI Support Request');
    const body = encodeURIComponent('I need assistance with:\n\n');
    
    // Open Gmail
    const gmailUrl = `https://mail.google.com/mail/u/0/?fs=1&tf=cm&to=contactquicklyandsend@gmail.com&su=${subject}&body=${body}`;
    
    // Open Outlook
    const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=contactquicklyandsend@gmail.com&subject=${subject}&body=${body}`;
    
    // Attempt to open Gmail first, fallback to Outlook
    const emailUrl = window.innerWidth > 768 ? gmailUrl : outlookUrl;
    
    window.open(emailUrl, '_blank');
  };
  
  const openFeedbackEmail = (): void => {
    const subject = encodeURIComponent('QuickSend AI Feedback');
    const body = encodeURIComponent('I would like to share my feedback about QuickSend AI:\n\n');
    
    // Open Gmail
    const gmailUrl = `https://mail.google.com/mail/u/0/?fs=1&tf=cm&to=contactquicklyandsend@gmail.com&su=${subject}&body=${body}`;
    
    // Open Outlook
    const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=contactquicklyandsend@gmail.com&subject=${subject}&body=${body}`;
    
    // Attempt to open Gmail first, fallback to Outlook
    const emailUrl = window.innerWidth > 768 ? gmailUrl : outlookUrl;
    
    window.open(emailUrl, '_blank');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const formatDate = (dateValue: { toDate: () => Date }) => {
    try {
      const date = dateValue.toDate();
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date not available';
    }
  };
  const CoverLetterHistoryCard: React.FC<{ coverLetter: CoverLetterHistory }> = ({ coverLetter }) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
  
    const formatDate = (dateValue: { toDate: () => Date }) => {
      try {
        const date = dateValue.toDate();
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      } catch (error) {
        console.error('Error formatting date:', error);
        return 'Date not available';
      }
    };
  
    return (
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all duration-200">
        <div className="flex flex-col gap-4">
          {/* Company and Position */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-50 mb-1">
                {coverLetter.company || 'No Company'}
              </h3>
              <p className="text-slate-400">{coverLetter.position || 'No Position'}</p>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {formatDate(coverLetter.createdAt)}
              </span>
            </div>
          </div>
  
          {/* Cover Letter Content */}
          <div className="border-t border-slate-700 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-lg font-medium text-blue-400">Cover Letter:</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(coverLetter.coverLetter)}
                  className="text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-slate-400 hover:text-blue-400 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${
              isExpanded ? 'max-h-none' : 'max-h-32'
            }`}>
              <p className="text-slate-50 whitespace-pre-wrap">
                {coverLetter.coverLetter || 'No Cover Letter Content'}
              </p>
            </div>
            {!isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="text-blue-400 hover:text-blue-300 text-sm mt-2"
              >
                Show more
              </button>
            )}
          </div>
  
          {/* Action Buttons */}
          <div className="border-t border-slate-700 pt-4">
            <button
              onClick={() => navigate('/cover-letter-history')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 
                       hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
            <Send className="w-4 h-4" /> 
            </button>
          </div>
        </div>
      </div>
    );
  };
  const EmailHistoryCard: React.FC<{ email: EmailHistory }> = ({ email }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getStatusBadge = (status?: string) => {
      if (!status) return null;
      
      const statusColors = {
        pending: 'bg-yellow-500/20 text-yellow-400',
        responded: 'bg-green-500/20 text-green-400',
        followup: 'bg-blue-500/20 text-blue-400'
      };

      return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          statusColors[status as keyof typeof statusColors]
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    };

    return (
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all duration-200">
        <div className="flex flex-col gap-4">
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <AppBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="bg-slate-900/50 rounded-3xl shadow-2xl border border-slate-700 p-12">
          {/* Header */}
          <div className="flex items-center gap-4 mb-12">
            <SettingsIcon className="w-12 h-12 text-blue-400" />
            <h1 className="text-5xl font-bold text-slate-50">Settings</h1>
          </div>

          {/* Account Information */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Crown className="w-8 h-8 text-blue-400" />
              <h2 className="text-4xl font-bold text-slate-50">Account Information</h2>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-lg text-slate-400 mb-2">Email Address</p>
                  <p className="text-xl text-slate-50 font-medium">
                    {userData?.email || 'Not available'}
                  </p>
                </div>
                <div>
                  <p className="text-lg text-slate-400 mb-2">Current Plan</p>
                  <p className="text-xl text-slate-50 font-medium">
                    {userData?.plan ? 
                      userData.plan.charAt(0).toUpperCase() + userData.plan.slice(1) : 
                      'Free'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Zap className="w-8 h-8 text-blue-400" />
              <h2 className="text-4xl font-bold text-slate-50">Usage Statistics</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-blue-500/10 rounded-2xl p-8 border border-blue-500/20">
                <p className="text-lg text-blue-400 mb-2">Email Generations Remaining</p>
                <p className="text-5xl font-bold text-blue-500">
                  {userData?.emailgencount ?? 0}
                </p>
              </div>
              <div className="bg-emerald-500/10 rounded-2xl p-8 border border-emerald-500/20">
                <p className="text-lg text-emerald-400 mb-2">Resume Upload Left</p>
                <p className="text-5xl font-bold text-emerald-500">
                  {userData?.trialCount ?? 0}
                </p>
              </div>
            </div>
          </div>
          {/* Profile Section */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <UserCircle className="w-8 h-8 text-blue-400" />
                <h2 className="text-4xl font-bold text-slate-50">Profile Settings</h2>
              </div>
              <Button
                onClick={() => setShowProfile(!showProfile)}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold
                         hover:bg-blue-600 transform hover:scale-105 transition-all duration-200
                         focus:ring-4 focus:ring-blue-500/50 flex items-center gap-2"
              >
                <UserCircle className="w-5 h-5" />
                {showProfile ? 'Hide Profile' : 'Edit Profile'}
              </Button>
            </div>
            
            {showProfile && (
              <div className="mt-8">
                <UserProfile />
              </div>
            )}
          </div>
          {/* Email History */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Mail className="w-8 h-8 text-blue-400" />
                <h2 className="text-4xl font-bold text-slate-50">Email History</h2>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/email-history')}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold
                           hover:bg-blue-600 transform hover:scale-105 transition-all duration-200
                           focus:ring-4 focus:ring-blue-500/50 flex items-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  View All History
                </button>
              </div>
            </div>
            <div className="space-y-6">
              {historyLoading ? (
                <div className="flex items-center justify-center p-0">
                  {/* <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div> */}
                </div>
              ) : emailHistory.length > 0 ? (
                <>
                  {emailHistory.map((email) => (
                    <EmailHistoryCard key={email.id} email={email} />
                  ))}
                  <button
                    onClick={() => navigate('/email-history')}
                    className="w-full py-4 text-blue-400 hover:text-blue-300 
                             font-medium text-center border border-blue-500/20 
                             rounded-xl hover:bg-blue-500/10 transition-all duration-200"
                  >
                    View all emails
                  </button>
                </>
              ) : (
                <p className="text-slate-400 text-center py-8">No emails generated yet</p>
              )}
            </div>
          </div>
         {/* Cover Letter History */}
         <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-400" />
                <h2 className="text-4xl font-bold text-slate-50">Cover Letter History</h2>
              </div>
              <button
                onClick={() => navigate('/cover-letter-history')}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold
                         hover:bg-blue-600 transform hover:scale-105 transition-all duration-200
                         focus:ring-4 focus:ring-blue-500/50 flex items-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                View All Coverletters
              </button>
            </div>
            <div className="space-y-6">
              {historyLoading ? (
                <div className="flex items-center justify-center p-0">
                  {/* <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div> */}
                </div>
              ) : coverLetterHistory.length > 0 ? (
                <>
                  {coverLetterHistory.map((coverLetter) => (
                    <CoverLetterHistoryCard key={coverLetter.id} coverLetter={coverLetter} />
                  ))}
                  <button
                    onClick={() => navigate('/cover-letter-history')}
                    className="w-full py-4 text-blue-400 hover:text-blue-300 
                             font-medium text-center border border-blue-500/20 
                             rounded-xl hover:bg-blue-500/10 transition-all duration-200"
                  >
                    View all cover letters
                  </button>
                </>
              ) : (
                <p className="text-slate-400 text-center py-8">No cover letters generated yet</p>
              )}
            </div>
          </div>

          {/* Contact & Feedback */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <MessageSquare className="w-8 h-8 text-blue-400" />
              <h2 className="text-4xl font-bold text-slate-50">Support & Feedback</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <button
                onClick={openContactEmail}
                className="flex items-center justify-center gap-3 px-8 py-6
                         bg-slate-800/50 hover:bg-slate-800 rounded-2xl
                         border border-slate-700 hover:border-blue-500/50
                         transform hover:scale-105 transition-all duration-200
                         group"
              >
                <Mail className="w-6 h-6 text-blue-400 group-hover:text-blue-500" />
                <span className="text-xl font-semibold text-slate-50">Contact Support</span>
              </button>
              <button
                onClick={openFeedbackEmail}
                className="flex items-center justify-center gap-3 px-8 py-6
                         bg-slate-800/50 hover:bg-slate-800 rounded-2xl
                         border border-slate-700 hover:border-blue-500/50
                         transform hover:scale-105 transition-all duration-200
                         group"
              >
                <MessageSquare className="w-6 h-6 text-blue-400 group-hover:text-blue-500" />
                <span className="text-xl font-semibold text-slate-50">Send Feedback</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;              