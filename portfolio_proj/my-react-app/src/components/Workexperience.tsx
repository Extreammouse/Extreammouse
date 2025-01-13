import React from 'react';
import { useInView } from 'react-intersection-observer';
import { Briefcase, Calendar, MapPin } from 'lucide-react';

const workExperience = [
  {
    id: 1,
    title: 'DevOps Engineer',
    company: 'Edelweiss',
    location: 'Mumbai, India',
    period: 'June 2022 - Aug 2024',
    achievements: [
      'Designed and implemented enterprise CI/CD pipelines with Jenkins, significantly improving deployment reliability and reducing deployment times by 90%, ensuring near-perfect success rates in production environments.',
      'Automated trading bots deployment infrastructure using Python, Bash, and Ansible, Jira, Jenkins cutting deployment times from 4 hours to under 1 minute while ensuring compliance with security protocols.',
      'Strategized and deployed containerization solutions with Docker and Kubernetes, implementing multiple ELK stack instances to enhance log processing capacity and ensure efficient scaling across workloads.',
      'Automated Java artifact replacement integrated with Jira workflows, reducing processing time from 3-4 hours to 1 minute with zero downtime also Analyzed production logs to identify bottlenecks and optimize system reliability.',
      'Developed a custom ELK stack with a Python-based logging agent for real-time monitoring, enhancing log ingestion and analytics. Created a Custom Docker Compose file for seamless ELK stack deployment, also improving incident response efficiency with quality assurance.',
      'Developed custom Python web scrapers for BSE and NSE, automating the extraction of IPO data and market metrics, and enabling users to visually access calculated insights on a centralized platform saving 2 hours of manual work.',
      'Created configurable data pipeline processing 1000+ financial instruments daily with 99.9% accuracy, enabling real-time trading decisions.',
      'Built production-ready MongoDB and Kafka cluster setup script using Bash and Ansible, applying Infrastructure as Code principles to automate resource provisioning and configuration management. This reduced setup time by 80% and ensured project risks were managed through an approval process setup.'
    ]
  }
];

const WorkExperience = () => {
  return (
    <section
      id="work-experience"
      className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-16 animate-fade-in">
          Work Experience
        </h2>

        <div className="space-y-12">
          {workExperience.map((work, index) => (
            <div
              key={work.id}
              className="relative animate-fade-in"
            >
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-8 shadow-xl border border-gray-700 hover:bg-gray-800/60 transition-colors duration-300">
                <div className="flex flex-col gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Briefcase className="text-blue-400" size={24} />
                      <h3 className="text-2xl font-bold text-blue-400">
                        {work.title}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin size={16} />
                        <span>{work.company}, {work.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar size={16} />
                        <span>{work.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-3 text-gray-400 list-disc pl-6">
                      {work.achievements.map((achievement, i) => (
                        <li key={i} className="leading-relaxed">
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkExperience;