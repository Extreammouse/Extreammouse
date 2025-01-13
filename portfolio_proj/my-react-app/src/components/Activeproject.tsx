import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import quicksendImage from '../assets/quicksend_1.png';


const projects = [
    {
      id: 1,
      title: 'Co-Founder & Technical Lead, QuickSend',
      description: `
        Designed and launched a full-stack AI-powered personalized email platform for job seekers, optimizing recruiter outreach by utilizing a Python backend with Flask API and a Flutter-based frontend.  
        
        - **Custom Email Solution:** Developed a tailored solution for generating personalized recruiter outreach emails and cover letters, achieving a 40% improvement in response rates compared to generic templates.  
        - **Scalable Architecture:** Designed and deployed a robust cloud-native architecture leveraging Docker, Google Cloud (GCP), and load balancing to efficiently distribute traffic across multiple instances.  
        - **High Performance:** Ensured the platform maintained high scalability and reliability, supporting growing user demand with average response times under 100 milliseconds for daily active users.  
      `,
      image: quicksendImage,
      tags: ['Python', 'Flask', 'Flutter', 'AI', 'Docker', 'GCP'],
      link: 'https://quick-send.co.in',
    },
  ];

const Projects = () => {
  return (
    <section id="projects" className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-16"
        >
          Featured Projects
        </motion.h2>

        <div className="space-y-32">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ProjectCard = ({ project, index }: { project: any; index: number }) => {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className={`flex flex-col ${
        index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
      } gap-8 items-center`}
    >
      <div className="flex-1">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="relative rounded-lg overflow-hidden shadow-2xl"
        >
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-[400px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </motion.div>
      </div>

      <div className="flex-1 space-y-6">
        <motion.h3
          initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-3xl font-bold"
        >
          {project.title}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-gray-300"
        >
          {project.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap gap-2"
        >
          {project.tags.map((tag: string) => (
            <span
              key={tag}
              className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Projects;