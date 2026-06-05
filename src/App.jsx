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

                {/* Public — browse the catalog and keep a guest garage
                    (stored in localStorage until the user signs in). */}
                <Route path="/" element={<VehicleSelectionPage />} />
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