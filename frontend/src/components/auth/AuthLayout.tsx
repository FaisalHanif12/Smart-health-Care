import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
}

const AuthLayout = ({ children, title }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center">
          {/* User icon in a circle */}
          <div className="mx-auto w-24 h-24 relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="h-px w-full bg-white/30"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="w-20 h-20 rounded-full border border-white/30 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/70" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-white">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;