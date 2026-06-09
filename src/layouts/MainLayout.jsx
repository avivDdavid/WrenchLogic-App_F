import { Outlet } from 'react-router-dom';
import AppNavigation from '../components/AppNavigation';

export default function MainLayout() {
  return (
    <div dir="rtl" className="bg-[#121212] text-on-surface font-body-md min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:bg-orange-500 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:z-50"
      >
        דלג לתוכן הראשי
      </a>
      <AppNavigation />
      <div id="main-content" tabIndex={-1}>
        <Outlet />
      </div>
    </div>
  );
}
