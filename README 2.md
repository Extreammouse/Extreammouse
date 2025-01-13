# Modern Portfolio Website

A sleek, modern portfolio website built with React, TypeScript, and Framer Motion. Features smooth animations, responsive design, and a futuristic aesthetic.

## Features

- Responsive design that works on all devices
- Smooth animations powered by Framer Motion
- Dynamic project showcase
- Contact form for inquiries
- Interactive UI elements
- Modern tech stack

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Vite
- Lucide Icons

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd portfolio-website
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── assets/          # Static assets like images
├── components/      # React components
│   ├── Hero.tsx    # Landing section
│   ├── Navbar.tsx  # Navigation bar
│   ├── Projects.tsx # Projects section
│   ├── Education.tsx # Education section
│   └── Contact.tsx  # Contact section
├── App.tsx         # Main app component
└── main.tsx        # Entry point
```

## Customization

1. Update personal information in `Hero.tsx`
2. Add projects in `Projects.tsx`
3. Update education details in `Education.tsx`
4. Modify contact information in `Contact.tsx`
5. Customize colors and styling in `tailwind.config.js`

## Requirements

```
node >= 18.0.0
npm >= 9.0.0
```

## Development

The project uses Vite for fast development and building. Key commands:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint