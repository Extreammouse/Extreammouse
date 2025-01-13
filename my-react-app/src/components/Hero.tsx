import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Cloud, Server, Database, Container, GitBranch, Terminal } from 'lucide-react';
import profileSvg from '../assets/photo.png';

const FloatingIcon = ({ Icon, style }: { Icon: React.ComponentType; style: React.CSSProperties }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 0.1, scale: 1 }}
    transition={{ duration: 1.5, ease: "easeOut" }}
    className="absolute"
    style={style}
  >
    <Icon />
  </motion.div>
);

const Hero = () => {
  const icons = [Cloud, Server, Database, Container, GitBranch, Terminal];
  const floatingIcons = Array.from({ length: 20 }, (_, i) => ({
    Icon: icons[Math.floor(Math.random() * icons.length)],
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animation: `float ${Math.random() * 4 + 3}s ease-in-out infinite`,
      transform: `rotate(${Math.random() * 360}deg)`,
    },
  }));

  return (
    <section id="home" className="min-h-screen relative overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0">
        <div className="tech-grid" />
        <div className="floating-icons">
          {floatingIcons.map((icon, index) => (
            <FloatingIcon key={index} Icon={icon.Icon} style={icon.style} />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-black/70 to-black" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex-1 space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
                Hi, I'm <span className="text-blue-500">Ehu Shubham Shaw</span>
              </h1>
              <h2 className="text-3xl md:text-5xl font-bold gradient-text">
                Software Developer & DevOps Engineer
              </h2>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-lg text-gray-300 max-w-2xl leading-relaxed"
            >
            Bridging the gap between development and operations with expertise in software development and DevOps practices. Proficient in designing and managing cloud infrastructure, building robust CI/CD pipelines, and implementing automated deployment solutions to ensure seamless integration and delivery.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="flex gap-6"
            >
              <SocialLink href="https://github.com/Extreammouse" icon={<Github />} />
              <SocialLink href="https://www.linkedin.com/in/shubhamshaw" icon={<Linkedin />} />
              <SocialLink href="ehushubham@gmail.com" icon={<Mail />} />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex-1"
          >
            <div className="relative w-full aspect-square max-w-2xl mx-auto">
              <img
                src={profileSvg}
                alt="Profile"
                className="w-full h-full object-contain scale-125"
                style={{
                  filter: 'drop-shadow(0 35px 35px rgb(0 0 0 / 0.25))',
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const SocialLink = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
  <motion.a
    href={href}
    className="p-4 bg-blue-500/10 rounded-full hover:bg-blue-500/20 transition-colors duration-300"
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
  >
    {icon}
  </motion.a>
);

export default Hero;