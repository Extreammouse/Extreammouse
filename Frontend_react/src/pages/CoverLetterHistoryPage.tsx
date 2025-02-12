import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import AppBar from '../components/AppBar';
import { Calendar, Copy, ChevronDown, ChevronUp, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

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

const CoverLetterHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coverLetterHistory, setCoverLetterHistory] = useState<CoverLetterHistory[]>([]);
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
    const fetchCoverLetterHistory = async () => {
      if (!user?.uid) {
        console.log('No user ID available');
        return;
      }
  
      try {
        setLoading(true);
        console.log('Fetching cover letters for user:', user.uid);
        
        const coverLetterQuery = query(
          collection(db, 'cover_letter_history'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
  
        try {
          const querySnapshot = await getDocs(coverLetterQuery);
          const coverLetters = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as CoverLetterHistory[];
          
          setCoverLetterHistory(coverLetters);
        } catch (queryError: any) {
          console.error('Detailed Query Error:', queryError);
          if (queryError?.message?.includes('index')) {
            toast.error('System is being initialized. Please try again in a few minutes.');
          } else {
            throw queryError;
          }
        }
  
      } catch (error) {
        console.error('Error fetching cover letter history:', error);
        toast.error('Failed to load cover letter history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchCoverLetterHistory();
  }, [user?.uid]);
  
  const CoverLetterHistoryCard: React.FC<{ coverLetter: CoverLetterHistory }> = ({ coverLetter }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const downloadPDF = () => {
      // Create a new jsPDF instance
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set up document properties
      doc.setFontSize(12);
      
      // Margins
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Add title
      doc.setFontSize(16);
      doc.text(`Cover Letter for ${coverLetter.position}`, margin, margin);
      
      // Add company information
      doc.setFontSize(12);
      doc.text(`Company: ${coverLetter.company}`, margin, margin + 10);
      
      // Add date
      const formattedDate = formatDate(coverLetter.createdAt);
      doc.text(`Date: ${formattedDate}`, margin, margin + 20);
      
      // Prepare cover letter content
      const splitText = doc.splitTextToSize(coverLetter.coverLetter, pageWidth - 2 * margin);
      
      // Add cover letter content with auto page breaking
      doc.text(splitText, margin, margin + 30);
      
      // Save the PDF
      doc.save(`${coverLetter.company}_${coverLetter.position}_Cover_Letter.pdf`);
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
          <div className="border-t border-slate-700 pt-4 flex space-x-4">
            <button
              onClick={downloadPDF}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 
                       hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
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
          <h1 className="text-3xl font-bold text-slate-50 mb-8">Cover Letter History</h1>
          
          <div className="space-y-6">
            {coverLetterHistory.length > 0 ? (
              coverLetterHistory.map((coverLetter) => (
                <CoverLetterHistoryCard key={coverLetter.id} coverLetter={coverLetter} />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 mb-2">No cover letters found in your history</p>
                <p className="text-slate-500 text-sm">
                  Generated cover letters will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoverLetterHistoryPage;