import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const projects = [
  {
    id: 1,
    title: 'Jar Replacement Automation',
    description: 'Developed a Bash script integrated with Jira to automate the replacement of critical .jar files, including backup and version updates. Automated approval checks reduced manual errors and cut replacement time from 3–4 hours to 1 minute, ensuring robust version control and system reliability.',
    image: 'https://www.networkworld.com/wp-content/uploads/2023/11/2017_11_nw_linuxtips-100744213-orig.jpg?quality=50&strip=all&w=1024',
    tags: ['Bash', 'Jira', 'Automation'],
  },
  {
    id: 2,
    title: 'Log Analysis and Automatic Mailing',
    description: 'Created a Python and Bash solution to detect specific keywords in logs and automatically email alerts. Saved 2–3 hours of daily monitoring time, providing early insights for quick actions.',
    image: 'https://media.ttmind.com/Media/tech/article_61_11-8-201912-12-33PM.jpg',
    tags: ['Python', 'Bash', 'Log Analysis'],
  },
  {
    id: 3,
    title: 'Streamlit Application for Server Monitoring',
    description: 'Built a Python Streamlit application to monitor critical processes like Jenkins and Bitbucket using API keys. Designed an interactive dashboard that reduced manual effort in morning monitoring and eliminated dependency on email alerts.',
    image: 'https://www.dataquest.io/wp-content/uploads/2024/02/Why-Should-You-Learn-Streamlit-in-2024.png',
    tags: ['Python', 'Streamlit', 'Monitoring'],
  },
  {
    id: 4,
    title: 'Jira Ticket Report Automation',
    description: 'Automated daily Jira ticket reporting using Python and Jira Query Language (JQL). Consolidated reports were delivered via email, improving task visibility and streamlining team communication.',
    image: 'https://play-lh.googleusercontent.com/_AZCbg39DTuk8k3DiPRASr9EwyW058pOfzvAu1DsfN9ygtbOlbuucmXaHJi5ooYbokQX',
    tags: ['Python', 'Jira', 'Automation'],
  },
  {
    id: 5,
    title: 'ELK Setup with Custom Python Agent',
    description: 'Set up ELK (Elastic, Logstash, Kibana) using Docker Compose and developed a custom Python agent to send logs and PDFs for Kibana visualization. Configured Grok patterns and dashboards for efficient data analysis.',
    image: 'https://cdn.shortpixel.ai/spio/ret_img,q_orig,to_webp,s_webp/flowygo.com/wp-content/uploads/2021/12/ELK_stack.png',
    tags: ['ELK', 'Docker', 'Python'],
  },
  {
    id: 6,
    title: 'Auto-Deployment of Trading Bots',
    description: 'Automated the deployment process of trading algorithms from QA to production with checks and approvals using Python, Ansible, and Bash. Reduced deployment time from 4 hours to 1 minute, significantly improving operational efficiency.',
    image: 'https://nestcode.co/blog_images/cicd-auto-deploy-your-project-using-gitlab-runner-1000x700.jpg',
    tags: ['Python', 'Ansible', 'Bash'],
  },
  {
    id: 7,
    title: 'Ansible Script for Application Installation',
    description: 'Created an Ansible script to install applications on Windows and Linux servers in parallel. Deployed software like Notepad on Windows and Python on Linux, enhancing installation efficiency across multiple servers.',
    image: 'https://pbs.twimg.com/profile_images/1683941848618868737/4o9qlEj2_400x400.jpg',
    tags: ['Ansible', 'Windows', 'Linux'],
  },
  {
    id: 8,
    title: 'MongoDB and Kafka Deployment',
    description: 'Automated deployment of standalone Kafka and MongoDB setups (with or without authentication) on production servers using Bash and Ansible. Streamlined deployment processes to save time and reduce manual errors.',
    image: 'https://images.contentstack.io/v3/assets/blt39790b633ee0d5a7/blt68e57477677b262a/647a2eaddb873c49809efbb2/header_(1).png',
    tags: ['MongoDB', 'Kafka', 'Ansible'],
  },
  {
    id: 9,
    title: 'MongoDB Backup and Restore',
    description: 'Developed a Bash script for automated backup and restoration of multiple MongoDB databases and collections, improving data reliability and minimizing manual intervention.',
    image: 'https://www.openlogic.com/sites/default/files/styles/social_preview_image/public/image/2021-06/image-blog-openlogic-what-is-mongodb.png?itok=hByLkKJk',
    tags: ['Bash', 'MongoDB', 'Backup'],
  },
  {
    id: 10,
    title: 'Automated Access Control in Jenkins',
    description: 'Created a Groovy script to manage user access controls in Jenkins, enabling secure and automated access management. Simplified permission granting and user role maintenance.',
    image: 'https://www.eficode.com/hs-fs/hubfs/images/blogs/Imported_Blog_Media/cool-jenkins.png?width=640&height=480&name=cool-jenkins.png',
    tags: ['Jenkins', 'Groovy', 'Access Control'],
  },
  {
    id: 11,
    title: 'BSE & NSE IPO Scraper',
    description: 'Built a Python web scraper to extract specific IPO information from BSE and NSE websites for traders. Automated data retrieval facilitated timely and accurate trading decisions.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNH4S2w6U6eO3A-uoYvWnQQ4VJSsgOFs0_KPsZTO-AKb-XZDbpL9QyJzwNwnc9DZ5ZlH4&usqp=CAU',
    tags: ['Python', 'Web Scraping', 'Trading'],
  },
  {
    id: 12,
    title: 'IISL NSE Scraper',
    description: 'Developed a Python script to automate the download of daily CSV data files for trade analysis, ensuring quick access to critical trading data and improving analytical capabilities.',
    image: 'https://miro.medium.com/v2/resize:fit:1132/0*yFME_VrF-p5GrVTH.png',
    tags: ['Python', 'CSV', 'Automation'],
  },
  {
    id: 13,
    title: 'Algorithmic Trading Bot Development',
    description: 'Designed and developed an algorithmic trading bot in MQL4 for automated trading. Implemented data-driven decision-making algorithms to optimize trade execution based on backtested financial data, enhancing market responsiveness.',
    image: 'https://i.ytimg.com/vi/zzLLjR2zNHM/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLC-LonEGgMctV8DSueTgVr75yYSTg',
    tags: ['MQL4', 'Algorithmic Trading', 'Automation'],
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