import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Projects from './pages/Projects';
import Calculator from './pages/Calculator';
import HowItWorks from './pages/HowItWorks';
import About from './pages/About';
import Contact from './pages/Contact';
import Issuers from './pages/Issuers';
import Retirement from './pages/Retirement';

export default function App() {
  return (
    <WalletProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              {/* Legacy/Admin Routes - Kept accessible but maybe not in main nav */}
              <Route path="/issuers" element={<Issuers />} />
              <Route path="/retirement" element={<Retirement />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </WalletProvider>
  );
}
