import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import Education from './components/Education';
import Contact from './components/Contact';
import Activeproject from './components/Activeproject';
import Workexperience from './components/Workexperience';

function App() {
  return (
    <div className="bg-black">
      <Navbar />
      <Hero />
      <Education />
      <Workexperience />
      <Activeproject />
      <Projects />
      <Contact />
    </div>
  );
}

export default App;