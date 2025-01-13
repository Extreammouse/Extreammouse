import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Github, Linkedin } from 'lucide-react';

const SocialLink = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
  >
    {icon}
  </a>
);

const ContactInfo = ({ 
  icon, 
  text, 
  link 
}: { 
  icon: React.ReactNode; 
  text: string;
  link: string;
}) => (
  <a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group cursor-pointer"
  >
    <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
      {icon}
    </div>
    <span>{text}</span>
  </a>
);

const Contact = () => {
  return (
    <section id="contact" className="min-h-screen bg-black text-white py-20 select-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Let's collaborate on turning your ideas into reality. Feel free to reach out through any of the channels below.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold mb-4">Let's work together!</h3>
              <p className="text-gray-200 mb-6">
                I'm always open to discussing new projects, creative ideas or
                opportunities to be part of your visions.
              </p>
              <div className="space-y-4 mb-6">
                <ContactInfo 
                  icon={<Mail className="text-blue-300" />} 
                  text="ehushubham@gmail.com"
                  link="mailto:ehushubham@gmail.com"
                />
                <ContactInfo 
                  icon={<Phone className="text-green-300" />} 
                  text="+1 7744189894"
                  link="tel:+17744189894"
                />
                <ContactInfo 
                  icon={<MapPin className="text-red-300" />} 
                  text="Worcester, MA"
                  link="https://maps.google.com/?q=Worcester,MA"
                />
              </div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.8 }}
                className="flex gap-6"
              >
                <SocialLink href="mailto:ehushubham@gmail.com" icon={<Mail />} />
                <SocialLink href="tel:+17744189894" icon={<Phone />} />
                <SocialLink href="https://maps.google.com/?q=Worcester,MA" icon={<MapPin />} />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gray-900 p-8 rounded-2xl shadow-lg"
          >
            <h3 className="text-2xl font-bold mb-6">Connect with me</h3>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="flex gap-6 justify-center"
            >
              <SocialLink href="https://github.com/Extreammouse" icon={<Github />} />
              <SocialLink href="https://www.linkedin.com/in/shubhamshaw" icon={<Linkedin />} />
              <SocialLink href="mailto:ehushubham@gmail.com" icon={<Mail />} />
            </motion.div>
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <p className="text-gray-300 text-center">
                Available for freelance opportunities and full-time positions
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;