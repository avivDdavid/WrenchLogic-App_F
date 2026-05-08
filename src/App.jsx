import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { VehicleProvider } from './context/VehicleContext';
import { GarageProvider } from './context/GarageContext';
import MainLayout from './layouts/MainLayout';
import VehicleSelectionPage from './pages/VehicleSelectionPage';
import CatalogPage from './pages/CatalogPage';
import CategoryViewPage from './pages/CategoryViewPage';
import PartDetailsPage from './pages/PartDetailsPage';
import MyGaragePage from './pages/MyGaragePage';
import UserProfilePage from './pages/UserProfilePage';

export default function App() {
  return (
    <VehicleProvider>
      <GarageProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<VehicleSelectionPage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/catalog/category/:categoryId" element={<CategoryViewPage />} />
              <Route path="/catalog/:partId" element={<PartDetailsPage />} />
              <Route path="/garage" element={<MyGaragePage />} />
              <Route path="/profile" element={<UserProfilePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </GarageProvider>
    </VehicleProvider>
  );
}