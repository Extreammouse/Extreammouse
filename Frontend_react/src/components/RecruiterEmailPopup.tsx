import React, { useState } from 'react';
import { Copy, Mail, Send, X, ChevronRight, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from './Button';

// Recruiter interface
interface Recruiter {
  name: string;
  email: string;
  highlightedName: string;
}

interface RecruiterEmailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  email: {
    email_rec: string;
    subject: string;
    body: string;
  };
  recruiterList?: Recruiter[];
}

const BUTTON_MESSAGES = [
  "View Next Recruiter",
  "Next Opportunity",
  "Explore More Contacts",
  "Continue Recruitment Search",
  "View Additional Recruiter",
  "Next Professional Contact",
  "Proceed to Next Lead",
  "Advance to Next Recruiter",
  "Discover Next Connection",
  "Review Next Potential Opportunity"
];

// Utility function to generate HTML for bolded text
const generateBoldHTML = (text: string) => {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

const RecruiterEmailPopup: React.FC<RecruiterEmailPopupProps> = ({ 
  isOpen, 
  onClose, 
  email, 
  recruiterList = [] 
}) => {
  // Limit to first 10 recruiters
  const limitedRecruiterList = recruiterList.slice(0, 10);
  const [currentRecruiterIndex, setCurrentRecruiterIndex] = useState(0);
  const [currentButtonMessage, setCurrentButtonMessage] = useState(BUTTON_MESSAGES[0]);

  // Copy function with toast feedback
  const copyToClipboard = (text: string, successMessage: string) => {
    navigator.clipboard.writeText(text);
    toast.success(successMessage);
  };

  const openEmailClient = (client: 'gmail' | 'outlook', toEmail: string) => {
    let emailUrl = '';
    
    // Remove double asterisks from body for email clients
    const cleanBody = email.body.replace(/\*\*(.*?)\*\*/g, '$1');
    
    if (client === 'gmail') {
      emailUrl = `https://mail.google.com/mail/u/0/?fs=1&tf=cm&to=${encodeURIComponent(toEmail)}&su=${encodeURIComponent(
        email.subject
      )}&body=${encodeURIComponent(cleanBody)}`;
    } else {
      // Outlook web compose URL
      emailUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(toEmail)}&subject=${encodeURIComponent(
        email.subject
      )}&body=${encodeURIComponent(cleanBody)}`;
    }
    
    window.open(emailUrl, '_blank');
  };

  const handleNextRecruiter = () => {
    // Move to next recruiter
    const nextIndex = (currentRecruiterIndex + 1) % (limitedRecruiterList.length || 1);
    setCurrentRecruiterIndex(nextIndex);

    // Select a random button message
    const randomMessage = BUTTON_MESSAGES[Math.floor(Math.random() * BUTTON_MESSAGES.length)];
    setCurrentButtonMessage(randomMessage);
  };

  // Current recruiter (fallback to original email_rec if no list)
  const currentRecruiter = limitedRecruiterList[currentRecruiterIndex] || { 
    name: 'Recruiter', 
    email: email.email_rec,
    highlightedName: 'Recruiter'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-neutral-600 hover:text-black transition-colors duration-300 hover:scale-105"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="p-12 pb-0">
          <h2 className="text-4xl font-bold text-black mb-6">Generated Email</h2>
        </div>

        {/* Recruiter Navigation */}
        {limitedRecruiterList.length > 1 && (
          <div className="px-12 py-4 bg-neutral-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">
                Recruiter {currentRecruiterIndex + 1} of {limitedRecruiterList.length}
              </span>
              <Button
                variant="secondary"
                onClick={handleNextRecruiter}
                className="flex items-center gap-2"
              >
                {currentButtonMessage}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Email Content */}
        <div className="p-12 space-y-6">
          {/* Recipient */}
          <div>
            <label className="block text-lg font-medium text-black mb-2">To:</label>
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-lg text-black" dangerouslySetInnerHTML={{
                  __html: generateBoldHTML(currentRecruiter.name)
                }} />
                <p className="text-sm text-neutral-600">({currentRecruiter.email})</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => copyToClipboard(currentRecruiter.email, 'Email copied!')}
                className="ml-auto"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-lg font-medium text-black mb-2">Subject:</label>
            <div className="flex items-center space-x-4">
              <p 
                className="text-lg text-black flex-grow" 
                dangerouslySetInnerHTML={{
                  __html: generateBoldHTML(email.subject)
                }} 
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => copyToClipboard(email.subject, 'Subject copied!')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Body */}
          <div>
            <label className="block text-lg font-medium text-black mb-2">Body:</label>
            <div className="relative">
              <div 
                className="whitespace-pre-wrap text-lg leading-relaxed text-black rounded-3xl border border-neutral-200 p-6 pr-16 bg-neutral-50"
                dangerouslySetInnerHTML={{
                  __html: generateBoldHTML(email.body)
                }}
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="absolute top-4 right-4"
                onClick={() => copyToClipboard(email.body, 'Email body copied!')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-6">
            {/* Full Email Copy */}
            <Button 
              variant="outline"
              className="flex-grow"
              onClick={() => {
                const fullEmail = `To: ${currentRecruiter.email}\nSubject: ${email.subject}\n\n${email.body}`;
                copyToClipboard(fullEmail, 'Full email copied!');
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Full Email
            </Button>

            {/* Open in Gmail */}
            <Button 
              variant="secondary"
              className="flex-grow"
              onClick={() => openEmailClient('gmail', currentRecruiter.email)}
            >
              <Mail className="w-4 h-4 mr-2" />
              Gmail
            </Button>

            {/* Open in Outlook */}
            <Button 
              variant="secondary"
              className="flex-grow"
              onClick={() => openEmailClient('outlook', currentRecruiter.email)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Outlook
            </Button>

            {/* Send to All */}
            {limitedRecruiterList.length > 1 && (
              <Button 
                variant="primary"
                className="flex-grow"
                onClick={() => openEmailClient('gmail', limitedRecruiterList.map(r => r.email).join(','))}
              >
                <Send className="w-4 h-4 mr-2" />
                Send to All
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterEmailPopup;