import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Issuers from './pages/Issuers';
import Retirement from './pages/Retirement';

export default function App() {
  return (
    <WalletProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/issuers" element={<Issuers />} />
              <Route path="/retirement" element={<Retirement />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </WalletProvider>
  );
}
