import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { VehicleProvider } from './context/VehicleContext';
import { GarageProvider }  from './context/GarageContext';
import { AuthProvider }    from './context/AuthContext';
import { ThemeProvider }   from './context/ThemeContext';
import MainLayout          from './layouts/MainLayout';
import ProtectedRoute      from './components/ProtectedRoute';
import FeedbackButton      from './components/FeedbackButton';
import LoginPage           from './pages/LoginPage';
import LandingPage         from './pages/LandingPage';
import VehicleSelectionPage from './pages/VehicleSelectionPage';
import CatalogPage         from './pages/CatalogPage';
import CategoryViewPage    from './pages/CategoryViewPage';
import PartDetailsPage     from './pages/PartDetailsPage';
import MyGaragePage        from './pages/MyGaragePage';
import UserProfilePage     from './pages/UserProfilePage';
import TermsPage           from './pages/TermsPage';
import PrivacyPage         from './pages/PrivacyPage';
import ContactPage         from './pages/ContactPage';

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <VehicleProvider>
        <GarageProvider>
          <BrowserRouter>
            <Routes>
              {/* Standalone — no MainLayout chrome (own navbar / footer) */}
              <Route path="/"        element={<LandingPage />} />
              <Route path="/login"   element={<LoginPage />} />
              <Route path="/terms"   element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Routes with sidebar/nav */}
              <Route element={<MainLayout />}>

                {/* Vehicle selection — reachable from the app nav. */}
                <Route path="/vehicle-selection" element={<VehicleSelectionPage />} />

                {/* Public — browse the catalog and keep a guest garage
                    (stored in localStorage until the user signs in). */}
                <Route path="/catalog"                           element={<CatalogPage />} />
                <Route path="/catalog/category/:categoryId"      element={<CategoryViewPage />} />
                <Route path="/catalog/:partId"                   element={<PartDetailsPage />} />
                <Route path="/garage"                            element={<MyGaragePage />} />

                {/* Protected — redirect to /login if no session */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile"                           element={<UserProfilePage />} />
                </Route>

              </Route>
            </Routes>
            {/* Floating feedback button — visible on every page */}
            <FeedbackButton />
          </BrowserRouter>
          {/* Vercel Web Analytics */}
          <Analytics />
        </GarageProvider>
      </VehicleProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}