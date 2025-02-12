import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, FileText, Search, Brain, Share2 } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import AppBar from '../components/AppBar';

const ShareButton: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 mx-auto"
    >
      <Share2 className="w-5 h-5 text-slate-600" />
      <span className="text-slate-900 font-medium">
        {copied ? 'Copied!' : 'Share with friends'}
      </span>
    </button>
  );
};

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ElementType;
  onClick?: () => void;
  comingSoon?: boolean;
}> = ({ title, description, icon: Icon, onClick, comingSoon }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative bg-white rounded-3xl p-12 transition-all duration-300
                  ${comingSoon ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1'}
                  ${isHovered ? 'shadow-2xl' : 'shadow-xl'}`}
      onClick={!comingSoon ? onClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-8">
          <Icon className={`w-16 h-16 ${isHovered ? 'text-slate-900' : 'text-slate-600'} transition-colors`} />
        </div>
        
        <h3 className="text-3xl font-semibold text-slate-900 mb-4">{title}</h3>
        <p className="text-lg text-slate-600 leading-relaxed max-w-md mx-auto">{description}</p>
        
        {comingSoon && (
          <div className="absolute top-6 right-6 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium">
            Coming Soon
          </div>
        )}
        
        <div className={`mt-8 inline-flex items-center gap-2 
                      ${isHovered ? 'text-slate-900' : 'text-slate-600'} transition-colors`}>
          <span className="text-sm font-medium">
            {comingSoon ? 'Stay tuned' : 'Get started'}
          </span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleFeatureClick = async (path: string, requiresApproval: boolean) => {
    if (!requiresApproval) {
      navigate(path);
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert('Please sign in to access this feature');
      return;
    }

    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'user', user.uid));
      
      if (!userDoc.exists()) {
        alert('User profile not found');
        return;
      }

      const userData = userDoc.data();
      const approvalStatus = userData.approvalStatus;

      if (approvalStatus !== 'approved') {
        alert('Please email us to get your domain approved for accessing this feature');
        return;
      }

      navigate(path);
    } catch (error) {
      console.error('Error checking approval status:', error);
      alert('Error checking access permissions');
    }
  };

  const features = [
    {
      title: "Write to Recruiter",
      description: "Craft personalized outreach messages that stand out. Our AI helps you connect authentically with recruiters.",
      icon: Mail,
      path: '/write-to-recruiter',
      requiresApproval: false
    },
    {
      title: "Cover Letter Generator",
      description: "Transform your experience into compelling cover letters tailored for each role you're pursuing.",
      icon: FileText,
      path: '/write-cover-letter',
      requiresApproval: false
    },
    {
      title: "Resume Search",
      description: "Find the perfect match between your skills and job requirements with our intelligent search.",
      icon: Search,
      path: '/resume-search',
      requiresApproval: true
    },
    {
      title: "Interview Preparation",
      description: "Get ready for your interviews with AI-powered practice sessions and personalized feedback.",
      icon: Brain,
      comingSoon: true
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <AppBar />
      
      {/* Share Section */}
      <div className="bg-slate-900 pt-8 pb-4">
        <ShareButton />
      </div>
      
      {/* Hero Section */}
      <section className="bg-slate-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-white mb-6">
              Accelerate Your Job Search
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Use AI-powered tools to create personalized outreach, compelling applications,
              and stand out in your job search journey.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-16 -mt-16 mb-32">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              onClick={() => feature.path && handleFeatureClick(feature.path, feature.requiresApproval || false)}
              comingSoon={feature.comingSoon}
            />
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-3xl shadow-xl p-12 mb-32 transform hover:scale-105 transition-transform duration-300">
          <div className="grid md:grid-cols-3 gap-16 text-center">
            <div className="p-6 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="text-4xl font-bold text-slate-900 mb-2">150K+</div>
              <div className="text-lg text-slate-600">Messages Sent</div>
            </div>
            <div className="p-6 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="text-4xl font-bold text-slate-900 mb-2">85%</div>
              <div className="text-lg text-slate-600">Response Rate</div>
            </div>
            <div className="p-6 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="text-4xl font-bold text-slate-900 mb-2">10K+</div>
              <div className="text-lg text-slate-600">Success Stories</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;