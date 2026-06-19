import { ReactNode } from 'react';
import Navigation from './Navigation';
import ExpiryAlertBanner from '../Alert/ExpiryAlertBanner';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <ExpiryAlertBanner />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="scroll-reveal">
          {children}
        </div>
      </main>
      
      <footer className="bg-amber-900 text-parchment-100 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="font-display text-lg mb-2">
            🗺️ 临期猎人 · 寻宝日志
          </p>
          <p className="text-sm text-parchment-200 opacity-80">
            每一次捡漏都是一次探险，每一分节省都是一份收获
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
