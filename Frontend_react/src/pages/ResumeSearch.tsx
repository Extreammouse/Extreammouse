import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getAuth } from 'firebase/auth';
import AppBar from '../components/AppBar';
import Input from '../components/Input';
import Button from '../components/Button';
import { FileText, Download, Search, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface Resume {
  userData: {
    name: string;
    email: string;
  };
  resumeFile: {
    fileName: string;
    fileContent: string;
  };
  match_score: number;
  matched_skills: string[];
}

const ResumeSearch: React.FC = () => {
  const [skills, setSkills] = useState('');
  const [searching, setSearching] = useState(false);
  const [matchedResumes, setMatchedResumes] = useState<Resume[]>([]);
  const [remainingSearches, setRemainingSearches] = useState(0);

  useEffect(() => {
    initializeSearchCount();
  }, []);

  const initializeSearchCount = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      toast.error('Please sign in to search candidates');
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'user', user.uid));
      if (!userDoc.exists()) {
        toast.error('User document not found');
        return;
      }

      setRemainingSearches(userDoc.data()?.searchcount || 0);
    } catch (error) {
      console.error('Error initializing search count:', error);
      toast.error('Error loading search count');
    }
  };

  const checkAndUpdateSearchCount = async (): Promise<boolean> => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      toast.error('Please sign in to search candidates');
      return false;
    }

    try {
      const userDoc = await getDoc(doc(db, 'user', user.uid));
      if (!userDoc.exists()) {
        toast.error('User document not found');
        return false;
      }

      const searchCount = userDoc.data()?.searchcount || 0;
      if (searchCount <= 0) {
        // Show upgrade dialog
        if (window.confirm('You have used all your free searches! Would you like to upgrade your plan?')) {
          // Navigate to pricing page
          window.location.href = '/pricing';
        }
        return false;
      }

      // Decrease count
      await updateDoc(doc(db, 'user', user.uid), {
        searchcount: increment(-1)
      });

      // Update remaining searches
      const updatedDoc = await getDoc(doc(db, 'user', user.uid));
      const remaining = updatedDoc.data()?.searchcount || 0;
      setRemainingSearches(remaining);

      if (remaining <= 1) {
        toast((t) => (
          <span>
            {remaining > 0 ? `You have ${remaining} search remaining!` : 'This was your last free search.'}
            <button
              onClick={() => {
                const auth = getAuth();
                if (auth.currentUser?.email) {
                  window.location.href = `mailto:contactquicklyandsend@gmail.com?subject=New%20Recruiter%20Registration%20Request&body=User%20Email:%20${auth.currentUser.email}%0D%0AUser%20ID:%20${auth.currentUser.uid}`;
                }
                toast.dismiss(t.id);
              }}
              className="ml-2 text-blue-500 hover:text-blue-700"
            >
              Contact Sales
            </button>
          </span>
        ));
      }

      return true;
    } catch (error) {
      console.error('Error updating search count:', error);
      toast.error('Error updating search count');
      return false;
    }
  };

  const searchResumes = async () => {
    if (!skills.trim()) {
      toast.error('Please enter skills to search for');
      return;
    }

    setSearching(true);
    try {
      // Check search count before making API call
      if (!(await checkAndUpdateSearchCount())) {
        setSearching(false);
        return;
      }

      const skillsArray = skills.split(',').map(skill => skill.trim());
      const response = await fetch('https://jobapplicationprodv3-501349658960.us-south1.run.app/match_resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          required_skills: skillsArray,
          top_n: 5,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status code: ${response.status}`);
      }

      const data = await response.json();
      if (data?.matches) {
        setMatchedResumes(data.matches);
        if (data.matches.length > 0) {
          toast.success(`Found ${data.matches.length} matches!`);
        } else {
          toast.error('No matches found for the given skills');
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error searching resumes');
    } finally {
      setSearching(false);
    }
  };

  const downloadResume = (resume: Resume) => {
    try {
      const { fileContent, fileName } = resume.resumeFile;
      const normalizedContent = fileContent.replace(/-/g, '+').replace(/_/g, '/');
      const padding = '='.repeat((4 - (normalizedContent.length % 4)) % 4);
      const base64Content = normalizedContent + padding;
      
      const byteCharacters = atob(base64Content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Resume download started');
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Error downloading resume');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Resume Search</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Search className="w-4 h-4" />
              <span>{remainingSearches} searches left</span>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required Skills
              </label>
              <div className="flex gap-4">
                <Input
                  label=""
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Enter skills (comma-separated)"
                  className="flex-1"
                />
                <Button
                  onClick={searchResumes}
                  disabled={searching || !skills.trim()}
                >
                  {searching ? 'Searching...' : 'Search'}
                </Button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Example: react, typescript, node.js
              </p>
            </div>

            {matchedResumes.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Matching Resumes</h2>
                <div className="divide-y divide-gray-200">
                  {matchedResumes.map((resume, index) => (
                    <div key={index} className="py-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {resume.userData.name?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{resume.userData.name}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span>Match Score: {resume.match_score.toFixed(1)}%</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {resume.matched_skills.map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadResume(resume)}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResumeSearch;