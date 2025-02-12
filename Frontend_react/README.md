# QuickSend AI

QuickSend AI is a powerful application that helps job seekers create personalized emails and cover letters using AI technology. The application integrates with Firebase for authentication and storage, and uses advanced AI to generate professional communications.

## Features

- 🤖 AI-powered email generation
- ✍️ Cover letter creation
- 📄 Resume upload and management
- 🔍 Resume search functionality
- 💰 Subscription-based pricing plans
- 🔒 Secure authentication
- 💾 Cloud storage integration

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm (v9 or higher)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/quicksend-ai.git
cd quicksend-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication, Firestore, and Storage
   - Copy your Firebase configuration

4. Create environment variables:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and configurations
├── pages/         # Application pages/routes
└── main.tsx       # Application entry point
```

## Key Components

- `AppBar`: Main navigation component
- `AuthLayout`: Layout wrapper for authentication pages
- `Button`: Reusable button component
- `Input`: Form input component
- `ResumeUpload`: Resume upload handling component
- `EmailTypeSelector`: Email format selection component
- `GeneratedEmail`: Email display component

## Authentication

The application uses Firebase Authentication with email/password sign-in. Features include:
- User registration
- Login
- Password reset
- Session management

## Database Structure

Firestore collections:
- `users`
  - `email`: string
  - `emailgencount`: number
  - `trialCount`: number
  - `resumes`: object
    - `fileContent`: string (base64)
    - `fileName`: string
    - `fileType`: string
    - `fileSize`: number
    - `uploadedAt`: timestamp

## API Integration

The application integrates with two main API endpoints:
- Email Generation: `https://jobapplicationprodv1-501349658960.us-central1.run.app/generate-job-output`
- Cover Letter Generation: `https://jobapplicationprodv1-501349658960.us-central1.run.app/generate-coverletter`

## Payment Integration

PayPal integration is included for subscription management with two plans:
- Basic Plan ($9.99/month)
- Pro Plan ($19.99/month)

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@quicksend.ai or create an issue in the repository.