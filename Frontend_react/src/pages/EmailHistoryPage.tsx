import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import AppBar from '../components/AppBar';
import { Calendar, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

// Updated interface to match Firebase structure
interface RecruiterDetail {
  [key: string]: string;
}

interface EmailHistory {
  id: string;
  userId: string;
  company: string;
  jobPosition: string;
  generatedEmail: string;
  emailSubject: string;
  recruiterDetails: RecruiterDetail[];
  generatedAt: {
    toDate: () => Date;
  };
}

const EmailHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([]);
  const [loading, setLoading] = useState(true);

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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  useEffect(() => {
    const fetchEmailHistory = async () => {
      if (!user?.uid) {
        console.log('No user ID available');
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching emails for user:', user.uid);
        
        const emailQuery = query(
          collection(db, 'email_history'),
          where('userId', '==', user.uid),
          orderBy('generatedAt', 'desc')
        );

        try {
          const querySnapshot = await getDocs(emailQuery);
          console.log('Query snapshot size:', querySnapshot.size);
          
          const emails = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as EmailHistory[];
          
          console.log('Processed emails:', emails.length);
          setEmailHistory(emails);
        } catch (queryError: any) {
          if (queryError?.message?.includes('index')) {
            toast.error('System is being initialized. Please try again in a few minutes.');
            console.log('Index creation required:', queryError.message);
          } else {
            throw queryError;
          }
        }

      } catch (error) {
        console.error('Error fetching email history:', error);
        toast.error('Failed to load email history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmailHistory();
  }, [user?.uid]);

  const EmailHistoryCard: React.FC<{ email: EmailHistory }> = ({ email }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getRecruiterNameAndEmail = (recruiter: RecruiterDetail) => {
      const entry = Object.entries(recruiter)[0];
      if (!entry) return { name: 'No name', email: 'No email' };
      return { name: entry[0], email: entry[1] };
    };

    return (
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all duration-200">
        <div className="flex flex-col gap-4">
          {/* Company and Position */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-50 mb-1">
                {email.company || 'No Company'}
              </h3>
              <p className="text-slate-400">{email.jobPosition || 'No Position'}</p>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {formatDate(email.generatedAt)}
              </span>
            </div>
          </div>

          {/* Email Subject */}
          <div className="border-t border-slate-700 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-lg font-medium text-blue-400">Subject:</p>
              <button
                onClick={() => copyToClipboard(email.emailSubject)}
                className="text-slate-400 hover:text-blue-400 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-50">{email.emailSubject || 'No Subject'}</p>
          </div>

          {/* Email Content */}
          <div className="border-t border-slate-700 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-lg font-medium text-blue-400">Email Content:</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(email.generatedEmail)}
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
                {email.generatedEmail || 'No Email Content'}
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

          {/* Recruiter Details */}
          <div className="border-t border-slate-700 pt-4">
            <p className="text-lg font-medium text-blue-400 mb-2">Recruiters:</p>
            <div className="space-y-2">
              {email.recruiterDetails?.map((recruiter, index) => {
                const { name, email: recruiterEmail } = getRecruiterNameAndEmail(recruiter);
                return (
                  <div key={index} className="flex items-center justify-between">
                    <p className="text-slate-50">
                      {name} - {recruiterEmail}
                    </p>
                    <button
                      onClick={() => copyToClipboard(`${name} <${recruiterEmail}>`)}
                      className="text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              {(!email.recruiterDetails || email.recruiterDetails.length === 0) && (
                <p className="text-slate-400">No recruiter details available</p>
              )}
            </div>
          </div>
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
          <h1 className="text-3xl font-bold text-slate-50 mb-8">Email History</h1>
          
          <div className="space-y-6">
            {emailHistory.length > 0 ? (
              emailHistory.map((email) => (
                <EmailHistoryCard key={email.id} email={email} />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 mb-2">No emails found in your history</p>
                <p className="text-slate-500 text-sm">
                  Generated emails will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailHistoryPage;