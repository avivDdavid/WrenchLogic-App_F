import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { VehicleProvider } from './context/VehicleContext';
import { GarageProvider }  from './context/GarageContext';
import { AuthProvider }    from './context/AuthContext';
import { ThemeProvider }   from './context/ThemeContext';
import MainLayout          from './layouts/MainLayout';
import ProtectedRoute      from './components/ProtectedRoute';
import LoginPage           from './pages/LoginPage';
import VehicleSelectionPage from './pages/VehicleSelectionPage';
import CatalogPage         from './pages/CatalogPage';
import CategoryViewPage    from './pages/CategoryViewPage';
import PartDetailsPage     from './pages/PartDetailsPage';
import MyGaragePage        from './pages/MyGaragePage';
import UserProfilePage     from './pages/UserProfilePage';

// Root redirect — the marketing landing page is a standalone static app
// served from /landing/index.html (outside the Vite SPA bundle).
function RootRedirect() {
  useEffect(() => {
    window.location.href = '/landing/index.html';
  }, []);
  return null;
}

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <VehicleProvider>
        <GarageProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes — no MainLayout chrome for login */}
              <Route path="/login" element={<LoginPage />} />

              {/* Routes with sidebar/nav */}
              <Route element={<MainLayout />}>

                {/* Root now shows the standalone marketing landing page. */}
                <Route path="/" element={<RootRedirect />} />

                {/* Vehicle selection moved here so it stays reachable. */}
                <Route path="/select" element={<VehicleSelectionPage />} />

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
          </BrowserRouter>
        </GarageProvider>
      </VehicleProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}