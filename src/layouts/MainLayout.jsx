import { Outlet } from 'react-router-dom';
import AppNavigation from '../components/AppNavigation';

export default function MainLayout() {
  return (
    <div dir="rtl" className="bg-[#121212] text-on-surface font-body-md min-h-screen">
      <AppNavigation />
      <Outlet />
    </div>
  );
}
