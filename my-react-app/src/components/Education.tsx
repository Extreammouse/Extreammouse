import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { GraduationCap, Calendar, MapPin } from 'lucide-react';

const education = [
  {
    id: 1,
    degree: 'Master of Science in Computer Science',
    institution: 'Worcester Polytechnic Institute',
    location: 'Worchester, Massachusetts',
    period: '2024 - 2026',
  },
  {
    id: 2,
    degree: 'Bachelor of Engineering, Biomedical Engineering',
    institution: 'Dwarkadas Sanghvi College of Engineering',
    location: 'Mumbai, India',
    period: '2019 - 2022',
  },
];

const Education = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section
      id="education"
      className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-16"
        >
          Education
        </motion.h2>

        <div ref={ref} className="space-y-12">
          {education.map((edu, index) => (
            <motion.div
              key={edu.id}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="relative"
            >
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-8 shadow-xl border border-gray-700">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="text-blue-400" size={24} />
                      <h3 className="text-2xl font-bold text-blue-400">
                        {edu.degree}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin size={16} />
                        <span>{edu.institution}, {edu.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar size={16} />
                        <span>{edu.period}</span>
                      </div>
                    </div>

                    <p className="text-gray-400">{edu.description}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Education;