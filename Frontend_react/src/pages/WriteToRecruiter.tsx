import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';
import AppBar from '../components/AppBar';
import Input from '../components/Input';
import Button from '../components/Button';
import ResumeUpload from '../components/ResumeUpload';
import EmailTypeSelector from '../components/EmailTypeSelector';
import RecruiterEmailPopup from '../components/RecruiterEmailPopup';
import toast from 'react-hot-toast';
import Confetti from 'react-confetti';

// Parse recruiter emails to extract full name and email
const parseRecruiterEmails = (emails: string[]): { name: string, email: string, highlightedName: string }[] => {
  return emails.map(entry => {
    const [name, email] = entry.split('  = ');
    return { 
      name: name.trim(), 
      email: email.trim(),
      highlightedName: name.trim().replace(/(\w+)/g, match => 
        `**${match}**`
      )
    };
  });
};

interface Resume {
  fileContent: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

interface TailoredEmail {
  concise?: {
    subject: string;
    body: string;
  };
  detailed?: {
    subject: string;
    body: string;
  };
}

interface APIResponse {
  emails_rec: string[]; 
  tailored_email?: {
    concise?: {
      subject: string;
      body: string;
    };
    detailed?: {
      subject: string;
      body: string;
    };
    error?: string;
  };
  error?: string;
}

const WriteToRecruiter: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userData, loading: userDataLoading } = useUserData();
  
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobPosition, setJobPosition] = useState('');
  const [emailType, setEmailType] = useState<'long' | 'short'>('short');
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<{
    email_rec: string;
    subject: string;
    body: string;
  } | null>(null);
  const [isEmailPopupOpen, setIsEmailPopupOpen] = useState(false);
  const [data, setData] = useState<APIResponse | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showEmailType, setShowEmailType] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const appendDebugInfo = (info: string) => {
    setDebugInfo(prev => `${prev}\n${new Date().toISOString()}: ${info}`);
    console.log(info);
  };

  // Check for existing resume when userData loads
  useEffect(() => {
    const checkResume = () => {
      if (!userData) {
        appendDebugInfo('No userData available');
        return;
      }

      try {
        appendDebugInfo('Checking resume data...');
        
        if (!Array.isArray(userData.resumes)) {
          appendDebugInfo('Resumes array is not valid');
          setHasResume(false);
          setResumeUploaded(false);
          return;
        }

        const currentResume = userData.resumes[0] as Resume;
        
        if (!currentResume || typeof currentResume !== 'object') {
          appendDebugInfo('Invalid resume object structure');
          setHasResume(false);
          setResumeUploaded(false);
          return;
        }

        // Validate base64 content and required fields
        const isValidResume = Boolean(
          currentResume.fileContent?.startsWith('data:') &&
          currentResume.fileName &&
          currentResume.fileType === 'application/pdf'
        );

        if (isValidResume) {
          appendDebugInfo(`Valid resume found: ${currentResume.fileName}`);
          setHasResume(true);
          setResumeUploaded(true);
        } else {
          appendDebugInfo('Resume missing required fields or invalid format');
          setHasResume(false);
          setResumeUploaded(false);
        }

      } catch (error) {
        appendDebugInfo(`Error checking resume: ${error}`);
        setHasResume(false);
        setResumeUploaded(false);
      }
    };

    checkResume();
  }, [userData]);

  const handleResumeUpload = (encodedContent: string) => {
    try {
      if (!encodedContent) {
        throw new Error('No resume content provided');
      }

      if (!encodedContent.startsWith('data:')) {
        throw new Error('Invalid resume format');
      }

      appendDebugInfo('Resume content validation passed');
      setResumeUploaded(true);
      setHasResume(true);
      appendDebugInfo('Resume upload states updated successfully');
      
    } catch (error) {
      appendDebugInfo(`Resume upload error: ${error}`);
      setResumeUploaded(false);
      setHasResume(false);
      toast.error('Failed to upload resume. Please try again.');
    }
  };

  const handleGenerateClick = () => {
    if (!companyName || !jobDescription || !jobPosition) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!hasResume && !resumeUploaded) {
      appendDebugInfo('Resume verification failed');
      appendDebugInfo(`Current resume state: ${JSON.stringify({
        hasResume,
        resumeUploaded,
        resumes: userData?.resumes || 'no resumes'
      }, null, 2)}`);
      toast.error('Please upload your resume first');
      return;
    }

    setShowEmailType(true);
    appendDebugInfo('Generate clicked - showing email type selector');
  };

  const generateEmail = async () => {
    if (!user || !userData) {
      appendDebugInfo('Missing user or userData');
      return;
    }
  
    // Calculate required tokens based on email type
    const requiredTokens = emailType === 'long' ? 2 : 1;
  
    // Check if user has enough tokens
    if (userData.emailgencount < requiredTokens) {
      toast.error(`You need ${requiredTokens} email generation${requiredTokens > 1 ? 's' : ''} for a ${emailType} email. Please upgrade your plan.`);
      navigate('/pricing');
      return;
    }
  
    if (!hasResume && !resumeUploaded) {
      appendDebugInfo('Resume validation failed before generation');
      toast.error('Please ensure your resume is uploaded');
      return;
    }
  
    setGenerating(true);
    appendDebugInfo('Starting email generation process...');
  
    try {
      // Update Firebase with decremented count based on email type
      const userRef = doc(db, 'user', user.uid);
      const userUpdate = {
        jobDescription,
        company: companyName,
        jobPosition,
        emailtype: emailType,
        emailGeneratedAt: new Date().toISOString(),
        emailgencount: userData.emailgencount - requiredTokens
      };
  
      await updateDoc(userRef, userUpdate);
      appendDebugInfo('User document updated successfully');
  
      // API call
      const API_URL = 'https://jobapplicationprodv3-501349658960.us-south1.run.app/generate-job-output';
  
      const requestBody = {
        email: user.email,
        companyName,
        jobPosition,
        jobDescription,
        emailType,
      };
  
      appendDebugInfo(`Request payload: ${JSON.stringify(requestBody, null, 2)}`);
  
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status}. Details: ${errorText}`);
      }
  
      const responseData = await response.json() as APIResponse;
  
      if (responseData.tailored_email?.error) {
        throw new Error(responseData.tailored_email.error);
      }
  
      if (responseData.error) {
        throw new Error(responseData.error);
      }
  
      if (!responseData.emails_rec || responseData.emails_rec.length === 0) {
        throw new Error('No recruiter emails found');
      }
  
      const emailContent = responseData.tailored_email?.[emailType === 'short' ? 'concise' : 'detailed'];
      
      if (!emailContent?.subject || !emailContent?.body) {
        throw new Error('Missing email content in response');
      }
  
      // Prepare recruiter details
      const recruiterList = responseData.emails_rec.map(email => {
        const [name, emailAddress] = email.split('  = ');
        return {
          name: name.trim(),
          email: emailAddress.trim(),
          highlightedName: name.trim().replace(/(\w+)/g, match => `**${match}**`)
        };
      });
  
      // Store email history in Firebase
      const emailHistoryRef = collection(db, 'email_history');
      await addDoc(emailHistoryRef, {
        userId: user.uid,
        company: companyName,
        jobPosition: jobPosition,
        emailSubject: emailContent.subject,
        emailBody: emailContent.body,
        recruiterDetails: recruiterList,
        generatedAt: new Date().toISOString(),
      });
  
      setData(responseData);
      
      setGeneratedEmail({
        email_rec: responseData.emails_rec[0],
        subject: emailContent.subject,
        body: emailContent.body
      });
  
      setIsEmailPopupOpen(true);
      setShowConfetti(true);
  
      // Updated success message to show correct token usage
      toast.success(`Email generated successfully! You have ${userData.emailgencount - requiredTokens} generation${(userData.emailgencount - requiredTokens) !== 1 ? 's' : ''} remaining.`);
      
      setTimeout(() => setShowConfetti(false), 5000);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      appendDebugInfo(`Generate email error: ${errorMessage}`);
      toast.error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  if (userDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {showConfetti && <Confetti />}
      <AppBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        {/* Add Usage Statistics Section here */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-blue-600 mb-1">Email Generations Remaining</p>
            <p className="text-3xl font-bold text-blue-700">
              {userData?.emailgencount || 0}
            </p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-sm text-green-600 mb-1">Resume Upload Remaining</p>
            <p className="text-3xl font-bold text-green-700">
              {userData?.trialCount || 0}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300 p-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-6xl font-bold text-slate-900">Write to Recruiter</h1>
            {userData && (
              <div className="text-xl text-slate-600">
                {userData.emailgencount} generations remaining
              </div>
            )}
          </div>

          <div className="space-y-16">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12">
              <h2 className="text-5xl font-bold text-slate-900 mb-6">Tips for best results:</h2>
              <ul className="list-disc list-inside text-slate-600 space-y-4 text-xl leading-relaxed">
                <li>Enter company domain (e.g., company.com) for accurate recruiter search</li>
                <li>Upload your latest resume first</li>
                <li>Include detailed job description</li>
                <li>Specify accurate company name and position</li>
              </ul>
            </div>

            <div>
              <label className="block text-xl font-medium text-slate-900 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company domain (e.g., company.com)"  
                className="w-full px-4 py-3 text-xl border-2 border-slate-300 rounded-3xl shadow-lg 
                  focus:outline-none focus:ring-4 focus:ring-slate-900 focus:border-transparent 
                  transition-all duration-300
                  bg-white bg-opacity-50 backdrop-blur-sm
                  hover:bg-opacity-70
                  placeholder-slate-400"
              />
            </div>


            <div>
              <label className="block text-xl font-medium text-slate-900 mb-2">  
                Job Position
              </label>
              <input 
                type="text"
                value={jobPosition}
                onChange={(e) => setJobPosition(e.target.value)}
                placeholder="Enter the job position"
                className="w-full px-4 py-3 text-xl border-2 border-slate-300 rounded-3xl shadow-lg
                  focus:outline-none focus:ring-4 focus:ring-slate-900 focus:border-transparent
                  transition-all duration-300  
                  bg-white bg-opacity-50 backdrop-blur-sm
                  hover:bg-opacity-70
                  placeholder-slate-400"  
              />
            </div>


            <div>
              <label className="block text-xl font-medium text-slate-900 mb-2">
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 text-xl border-2 border-slate-300 rounded-3xl shadow-lg 
                  focus:outline-none focus:ring-4 focus:ring-slate-900 focus:border-transparent 
                  transition-all duration-300 
                  bg-white bg-opacity-50 backdrop-blur-sm 
                  hover:bg-opacity-70 
                  placeholder-slate-400"
                placeholder="Paste the job description here"
              />
            </div>

            <ResumeUpload
              onUploadComplete={handleResumeUpload}
              disabled={generating}
            />

            {!showEmailType ? (
              <Button
                onClick={handleGenerateClick}
                disabled={generating || (!hasResume && !resumeUploaded)}
                className="w-full text-xl py-4 bg-slate-900 text-white hover:bg-slate-800 transition-colors duration-300"
                count={userData?.emailgencount}
              >
                Generate Email
              </Button>
            ) : (
              <div className="space-y-6">
                <EmailTypeSelector
                  value={emailType}
                  onChange={setEmailType}
                />
                <Button
                  onClick={generateEmail}
                  disabled={generating || (!hasResume && !resumeUploaded)}
                  className="w-full text-xl py-4 bg-slate-900 text-white hover:bg-slate-800 transition-colors duration-300"
                  loading={generating}
                  count={userData?.emailgencount}
                >
                  {generating ? 'Generating...' : 'Generate Email'}
                </Button>
              </div>
            )}
          </div>

          {generatedEmail && data?.emails_rec && (
            <RecruiterEmailPopup
              isOpen={isEmailPopupOpen}
              onClose={() => setIsEmailPopupOpen(false)}
              email={generatedEmail}
              recruiterList={parseRecruiterEmails(data.emails_rec)}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default WriteToRecruiter;