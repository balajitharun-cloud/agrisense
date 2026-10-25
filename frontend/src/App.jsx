import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Sensors from './pages/Sensors.jsx';
import Weather from './pages/Weather.jsx';
import Satellite from './pages/Satellite.jsx';
import Crops from './pages/Crops.jsx';
import MapView from './pages/MapView.jsx';
import Protection from './pages/Protection.jsx';
import Marketplace from './pages/Marketplace.jsx';
import Gov from './pages/Gov.jsx';
import Account from './pages/Account.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/sensors" element={<Layout><Sensors /></Layout>} />
      <Route path="/weather" element={<Layout><Weather /></Layout>} />
      <Route path="/satellite" element={<Layout><Satellite /></Layout>} />
      <Route path="/crops" element={<Layout><Crops /></Layout>} />
      <Route path="/map" element={<Layout><MapView /></Layout>} />
      <Route path="/protection" element={<Layout><Protection /></Layout>} />
      <Route path="/marketplace" element={<Layout><Marketplace /></Layout>} />
      <Route path="/gov" element={<Layout><Gov /></Layout>} />
      <Route path="/account" element={<Layout><Account /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
