import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useUserData } from '../hooks/useUserData';
import { Clipboard, Loader2, X } from 'lucide-react';
import AppBar from '../components/AppBar';
import Button from '../components/Button';
import ResumeUpload from '../components/ResumeUpload';
import toast from 'react-hot-toast';
import Confetti from 'react-confetti';

interface CoverLetterResponse {
  cover_letter: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] relative flex flex-col">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-500 hover:text-slate-900 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="overflow-y-auto flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

const WriteCoverLetter: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userData, loading: userDataLoading } = useUserData();
  
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobPosition, setJobPosition] = useState('');
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const appendDebugInfo = (info: string) => {
    setDebugInfo(prev => `${prev}\n${new Date().toISOString()}: ${info}`);
    console.log(info);
  };
  
// Add the resume validation effect
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

      const currentResume = userData.resumes[0];
      
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
  
    const generateCoverLetter = async () => {
      if (!user || !userData) return;
    
      if (userData.trialCount <= 0) {
        toast.error('No cover letter generations remaining. Please upgrade your plan.');
        navigate('/pricing');
        return;
      }
    
      setGenerating(true);
    
      try {
        const response = await fetch('https://jobapplicationprodv3-501349658960.us-south1.run.app/generate_coverletter_output', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            company: companyName,
            position: jobPosition,
            description: jobDescription,
          }),
        });
    
        const data: CoverLetterResponse = await response.json();
        
        // Only throw error if response is not ok after attempting to parse JSON
        if (!response.ok) {
          throw new Error('Failed to generate cover letter');
        }
    
        console.log('Cover letter generated:', data.cover_letter); // Debug log
        
        setGeneratedCoverLetter(data.cover_letter);
        setShowConfetti(true);
        setIsModalOpen(true);
  
        try {
          console.log('Attempting to save to Firestore...'); // Debug log
          const docRef = await addDoc(collection(db, 'cover_letter_history'), {
            userId: user.uid,
            company: companyName,
            position: jobPosition,
            coverLetter: data.cover_letter,
            createdAt: serverTimestamp()
          });
          console.log('Successfully saved to Firestore with ID:', docRef.id); // Debug log
        } catch (firestoreError) {
          console.error('Error saving to Firestore:', firestoreError); // Debug log
          throw firestoreError; // Re-throw to be caught by outer catch block
        }
  
        // Update the trial count in Firestore
        const userRef = doc(db, 'user', user.uid); // Changed from 'user' to 'users'
        await updateDoc(userRef, {
          trialCount: userData.trialCount - 1,
        });
        
        // Show success message
        toast.success('Cover letter generated successfully!');
    
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
        
      } catch (error) {
        console.error('Full error:', error); // Debug log
        // Only show error toast if we actually caught an error
        if (error instanceof Error) {
          toast.error(error.message || 'Failed to generate cover letter. Please try again.');
        }
      } finally {
        setGenerating(false);
      }
    };
  
  const copyToClipboard = async () => {
    if (!generatedCoverLetter) return;
    
    try {
      await navigator.clipboard.writeText(generatedCoverLetter);
      toast.success('Cover letter copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  if (userDataLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-slate-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      <AppBar />
      
      <main className="max-w-7xl mx-auto px-6 py-32">
        {/* Usage Statistics */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-blue-600 mb-1">Email Generations Remaining</p>
            <p className="text-3xl font-bold text-blue-700">
              {userData?.emailgencount || 0}
            </p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-sm text-green-600 mb-1">Resume Uploads Left</p>
            <p className="text-3xl font-bold text-green-700">
              {userData?.trialCount || 0}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-12 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <h1 className="text-4xl font-bold text-slate-900 mb-12">Write Cover Letter</h1>
          
          <div className="space-y-8">
            <div>
              <label className="block text-lg font-medium text-slate-900 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter the company name"
                className="w-full px-4 py-3 text-lg bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all duration-200 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-slate-900 mb-2">
                Job Position
              </label>
              <input
                type="text"
                value={jobPosition}
                onChange={(e) => setJobPosition(e.target.value)}
                placeholder="Enter the job position"
                className="w-full px-4 py-3 text-lg bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all duration-200 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-slate-900 mb-2">
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 text-lg bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all duration-200 placeholder:text-slate-400"
                placeholder="Paste the job description here"
              />
            </div>

            <div>
              <ResumeUpload
                onUploadComplete={handleResumeUpload}
                disabled={generating}
              />
            </div>

            <Button
              onClick={generateCoverLetter}
              disabled={!companyName || !jobDescription || !jobPosition || generating}
              className="w-full bg-slate-900 text-white hover:bg-slate-800 text-lg py-4 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {generating ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : (
                'Generate Cover Letter'
              )}
            </Button>
          </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div>
            <h2 className="text-3xl font-semibold text-slate-900 mb-6">Generated Cover Letter</h2>
            <div className="whitespace-pre-wrap rounded-xl border border-slate-200 p-8 text-lg leading-relaxed text-slate-900 bg-slate-50 mb-6">
              {generatedCoverLetter}
            </div>
            <Button
              onClick={copyToClipboard}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 text-lg py-4 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <Clipboard className="w-5 h-5" />
              <span>Copy to Clipboard</span>
            </Button>
          </div>
        </Modal>
      </main>
    </div>
  );
};

export default WriteCoverLetter;