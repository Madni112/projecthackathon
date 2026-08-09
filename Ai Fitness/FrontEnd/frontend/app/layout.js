import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata = {
  title: 'AI Fitness Coach | Editorial AI Platform',
  description: 'AI-driven platform for body analysis, posture estimation, personalized workout/diet plans, daily habit tracking, and comprehensive admin moderation panel.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#f5f5f5] text-[#0c0a09]">
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#0c0a09',
              border: '1px solid #e7e5e4',
              borderRadius: '9999px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
              fontSize: '13px',
              padding: '10px 20px',
              fontFamily: 'Inter, sans-serif'
            }
          }}
        />
        {children}
      </body>
    </html>
  );
}
