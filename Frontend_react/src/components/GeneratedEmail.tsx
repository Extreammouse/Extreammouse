import React, { useState } from 'react';
import { Copy, Mail, ArrowRight, ArrowLeft, Send } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';
import toast from 'react-hot-toast';

// Recruiter interface
interface Recruiter {
  name: string;
  email: string;
  highlightedName: string;
}

interface GeneratedEmailProps {
  email: {
    email_rec: string;
    subject: string;
    body: string;
  };
  recruiterList?: Recruiter[];
  companyName?: string;
  jobPosition?: string;
}

const GeneratedEmail: React.FC<GeneratedEmailProps> = ({ 
  email, 
  recruiterList = [],
  companyName = '',
  jobPosition = ''
}) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [currentRecruiterIndex, setCurrentRecruiterIndex] = useState(0);

  const copyToClipboard = () => {
    const fullEmail = `To: ${recruiterList[currentRecruiterIndex]?.email || email.email_rec}\nSubject: ${email.subject}\n\n${email.body}`;
    navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    toast.success('Email copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const openInGmail = async (toEmail: string, isSendToAll: boolean = false) => {
    const gmailUrl = `https://mail.google.com/mail/u/0/?fs=1&tf=cm&to=${toEmail}&su=${encodeURIComponent(
      email.subject
    )}&body=${encodeURIComponent(email.body)}`;
    
    // Open Gmail
    window.open(gmailUrl, '_blank');

    // Store email in Firebase
    try {
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      const emailHistoryRef = collection(db, 'email_history');
      await addDoc(emailHistoryRef, {
        userId: user.uid,
        company: companyName,
        jobPosition: jobPosition,
        emailSubject: email.subject,
        emailBody: email.body,
        recruiterDetails: isSendToAll 
          ? recruiterList 
          : [recruiterList[currentRecruiterIndex] || { 
              name: 'Recruiter', 
              email: email.email_rec,
              highlightedName: 'Recruiter'
            }],
        sentAt: new Date().toISOString(),
        sentVia: 'Gmail',
        method: isSendToAll ? 'Send to All' : 'Individual'
      });

      toast.success('Email history recorded');
    } catch (error) {
      console.error('Error storing email history:', error);
      toast.error('Failed to record email history');
    }
  };

  const handleNextRecruiter = () => {
    setCurrentRecruiterIndex((prev) => 
      (prev + 1) % (recruiterList.length || 1)
    );
  };

  const handlePrevRecruiter = () => {
    setCurrentRecruiterIndex((prev) => 
      prev === 0 ? (recruiterList.length || 1) - 1 : prev - 1
    );
  };

  // Current recruiter (fallback to original email_rec if no list)
  const currentRecruiter = recruiterList[currentRecruiterIndex] || { 
    name: 'Recruiter', 
    email: email.email_rec,
    highlightedName: 'Recruiter'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Generated Email</h3>
        <div className="flex gap-2">
          {/* Copy Button */}
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="w-4 h-4 mr-2" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>

          {/* Open Gmail for Current Recruiter */}
          <Button size="sm" onClick={() => openInGmail(currentRecruiter.email)}>
            <Mail className="w-4 h-4 mr-2" />
            Open in Gmail
          </Button>

          {/* Send to All Recruiters */}
          {recruiterList.length > 1 && (
            <Button size="sm" onClick={() => openInGmail(recruiterList.map(r => r.email).join(','), true)}>
              <Send className="w-4 h-4 mr-2" />
              Send to All
            </Button>
          )}
        </div>
      </div>

      {/* Recruiter Navigation */}
      {recruiterList.length > 1 && (
        <div className="flex items-center justify-between mb-4 bg-gray-50 p-2 rounded-md">
          <button 
            onClick={handlePrevRecruiter}
            className="p-1 hover:bg-gray-200 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">
            Recruiter {currentRecruiterIndex + 1} of {recruiterList.length}
          </span>
          <button 
            onClick={handleNextRecruiter}
            className="p-1 hover:bg-gray-200 rounded-full"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Email Details */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">To:</label>
          <div className="mt-1 flex items-center space-x-2">
            <p>{currentRecruiter.name}</p>
            <p className="text-gray-500 text-sm">({currentRecruiter.email})</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Subject:</label>
          <p className="mt-1">{email.subject}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Body:</label>
          <div className="mt-1 whitespace-pre-wrap rounded-md border border-gray-200 p-4">
            {email.body}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedEmail;