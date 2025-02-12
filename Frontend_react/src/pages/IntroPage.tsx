import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, FileText, Search, Star, Twitter, Linkedin, Instagram, Facebook, Youtube } from 'lucide-react';
import Button from '../components/Button';
import Section from '../components/Section';

const IntroPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/signin');
  };

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Blog', href: '/blog' },
      { name: 'Press', href: '/press' }
    ],
    product: [
      { name: 'Features', href: '/features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Security', href: '/security' },
      { name: 'Enterprise', href: '/enterprise' }
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'API Status', href: '/status' },
      { name: 'Documentation', href: '/docs' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'GDPR', href: '/gdpr' }
    ]
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section with 3D Logo */}
      <div className="h-screen flex flex-col items-center justify-center relative">
        <div className="text-center flex flex-col items-center">
          <div className="flex flex-col items-center">
            <div className="relative w-[800px] h-[800px]">
              <img 
                src="/images/Quicksend_logo_new.png" 
                alt="QuickSend AI Logo" 
                className="w-full h-full object-contain transform transition-transform hover:scale-105 drop-shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))'
                }}
              />
            </div>
            <h1 className="text-6xl font-bold text-white -mt-20 mb-16">QuickSendAI</h1>
          </div>
          <div 
            className="animate-bounce cursor-pointer absolute bottom-2"
            onClick={() => document.querySelector('#features-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <svg 
              className="w-12 h-12 text-slate-400 hover:text-slate-600 transition-colors"
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      </div>

{/* Features Section with clickable cards */}
<div id="features-section" className="bg-slate-50 py-32">
        <div className="max-w-8xl mx-auto px-8">
          <h2 className="text-5xl font-bold text-center mb-20 text-slate-900">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-16">
            <div 
              className="bg-white p-12 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer"
              onClick={handleSignIn}
            >
              <Mail className="w-16 h-16 text-slate-700 mb-8" />
              <h3 className="text-3xl font-semibold mb-6">Smart Emails</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Our AI technology crafts personalized, professional emails that get responses from recruiters. 
                Stand out in crowded inboxes with perfectly tuned communication.
              </p>
            </div>
            
            <div 
              className="bg-white p-12 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer"
              onClick={handleSignIn}
            >
              <FileText className="w-16 h-16 text-slate-700 mb-8" />
              <h3 className="text-3xl font-semibold mb-6">Cover Letters</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Generate tailored cover letters that showcase your unique value proposition. 
                Each letter is customized to the role and company you're targeting.
              </p>
            </div>
            
            <div 
              className="bg-white p-12 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer"
              onClick={handleSignIn}
            >
              <Search className="w-16 h-16 text-slate-700 mb-8" />
              <h3 className="text-3xl font-semibold mb-6">Job Matching</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Find opportunities that align with your skills and aspirations. 
                Our intelligent matching system connects you with the right positions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About Our Service Section */}
      <div className="bg-black bg-opacity-10 py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white text-slate-900 mb-6">Why Choose QuickSendAI?</h2>
            <p className="text-xl text-white text-slate-600 max-w-3xl mx-auto">
              We combine cutting-edge AI technology with deep recruitment industry knowledge to give you the competitive edge in your job search.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl text-white font-semibold mb-4 text-slate-900">AI-Powered Precision</h3>
                <p className="text-slate-600 text-white ">Our advanced AI algorithms analyze successful communication patterns to create perfectly crafted messages that resonate with recruiters.</p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-4 text-slate-900">Time-Saving Efficiency</h3>
                <p className="text-slate-600 text-white">What typically takes hours can be accomplished in minutes, letting you focus on what matters most - preparing for interviews.</p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-4 text-slate-900">Personalized Approach</h3>
                <p className="text-slate-600 text-white">Every communication is tailored to your unique skills, experience, and target role, ensuring authentic and effective messaging.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-50 p-6 rounded-xl">
                <h4 className="text-4xl font-bold text-slate-900 mb-2">95%</h4>
                <p className="text-slate-600">Response rate improvement</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl">
                <h4 className="text-4xl font-bold text-slate-900 mb-2">10x</h4>
                <p className="text-slate-600">Faster application process</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl">
                <h4 className="text-4xl font-bold text-slate-900 mb-2">50k+</h4>
                <p className="text-slate-600">Successful placements</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl">
                <h4 className="text-4xl font-bold text-slate-900 mb-2">24/7</h4>
                <p className="text-slate-600">AI assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-slate-50 py-32">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-900">What Our Users Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-slate-700 mb-6">"QuickSendAI transformed my job search. I landed interviews at top tech companies within weeks. The personalized emails and cover letters made all the difference."</p>
              <div className="border-t pt-4 border-slate-100">
                <p className="font-semibold text-slate-900">David Chen</p>
                <p className="text-slate-600">C.S Student at NEU</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-slate-700 mb-6">"The AI-generated cover letters are incredibly well-written and personalized. It saved me countless hours and helped me land my dream job."</p>
              <div className="border-t pt-4 border-slate-100">
                <p className="font-semibold text-slate-900">Sarah Thompson</p>
                <p className="text-slate-600">Business school student at WPI</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-slate-700 mb-6">"As a career switcher, I was struggling to present my skills effectively. QuickSendAI helped me communicate my value proposition perfectly."</p>
              <div className="border-t pt-4 border-slate-100">
                <p className="font-semibold text-slate-900">Michael Rodriguez</p>
                <p className="text-slate-600">Data Science student at Cambridge</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="hover:text-white transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Product Info */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="hover:text-white transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="hover:text-white transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="hover:text-white transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social Links and Copyright */}
          <div className="mt-16 pt-8 border-t border-slate-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex space-x-6 mb-4 md:mb-0">
              <a 
                  href="https://youtube.com/YourChannelName" 
                  className="hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Youtube size={20} />
                </a>
                <a 
                  href="https://linkedin.com/in/YourProfile" 
                  className="hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin size={20} />
                </a>
                <a 
                  href="https://www.instagram.com/quick_send.co.in?igsh=M3JtcTgwMHFiZWJh" 
                  className="hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram size={20} />
                </a>
              </div>
              <p className="text-sm text-slate-400">
                © {new Date().getFullYear()} QuickSendAI. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IntroPage;