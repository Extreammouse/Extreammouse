import React, { useRef, useState } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';
import toast from 'react-hot-toast';
import { logger } from '../lib/logger';
import { useUserData } from '../hooks/useUserData';


interface ResumeUploadProps {
  onUploadComplete: (encodedContent: string) => void;
  disabled?: boolean;
}

interface Resume {
  fileContent: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUploadComplete, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string>('');
  const { userData, loading: userDataLoading } = useUserData();
  const { user } = useAuth();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      setUploadStatus('error');
      return;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('File size should be less than 5MB');
      setUploadStatus('error');
      return;
    }
    // Check if userData is still loading or undefined
    if (userDataLoading || !userData) {
      toast.error('Please wait while we load your data');
      return;
    }

    // Check if user has remaining trial count
    if (userData.trialCount <= 0) {
      toast.error('No remaining resume uploads. Please upgrade your plan.');
      return;
    }
    setUploading(true);
    setFileName(file.name);

    try {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const base64Content = reader.result as string;

          // Create resume object with proper structure
          const resumeData: Resume = {
            fileContent: base64Content, // Keep full data URL
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            uploadedAt: new Date().toISOString()
          };

          // Update Firestore document with resumes as an array
          const userRef = doc(db, 'user', user.uid);
          await updateDoc(userRef, {
            resumes: [resumeData] // Set as array with single resume
          });

          logger.info(`Resume uploaded successfully for user: ${user.uid}`);
          onUploadComplete(base64Content);
          setUploadStatus('success');
          // Update the trial count in Firestore
          await updateDoc(userRef, {
            resumes: [resumeData],
            trialCount: userData.trialCount - 1
          });

          toast.success('Resume uploaded successfully');
        } catch (error) {
          logger.error('Error processing file:', error);
          setUploadStatus('error');
          toast.error('Error processing file. Please try again.');
        }
      };

      reader.onerror = () => {
        logger.error('Error reading file');
        setUploadStatus('error');
        toast.error('Error reading file. Please try again.');
      };

      // Read as data URL to keep the base64 prefix
      reader.readAsDataURL(file);
    } catch (error) {
      logger.error('Upload error:', error);
      setUploadStatus('error');
      toast.error('Error uploading resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    if (uploading || disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="mt-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf"
        className="hidden"
      />
      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          disabled={disabled || uploading}
          className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed"
        >
          {uploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
          ) : (
            <>
              <Upload className="w-8 h-8 mb-2" />
              <span className="text-sm">Click to upload your resume (PDF only, max 5MB)</span>
            </>
          )}
        </Button>

        {uploadStatus !== 'idle' && (
          <div 
            className={`flex items-center gap-2 p-3 rounded-lg ${
              uploadStatus === 'success' ? 'bg-green-50' : 'bg-red-50'
            }`}
            role="alert"
          >
            {uploadStatus === 'success' ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-700">
                  Successfully uploaded: {fileName}
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-700">
                  Error uploading file. Please try again.
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;