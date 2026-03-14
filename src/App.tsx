import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import CountryDetail from './pages/CountryDetail';
import Compare from './pages/Compare';
import About from './pages/About';
import IndiaLayout from './pages/india/IndiaLayout';
import IndiaLanding from './pages/india/IndiaLanding';
import PurchasingPower from './pages/india/PurchasingPower';
import PriceLookup from './pages/india/PriceLookup';
import SpikeTimeline from './pages/india/SpikeTimeline';
import BudgetStress from './pages/india/BudgetStress';
import SectorCards from './pages/india/SectorCards';
import ShareStory from './pages/india/ShareStory';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename="/price-rise">
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/country/:code" element={<CountryDetail />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/about" element={<About />} />
            <Route path="/india" element={<IndiaLayout />}>
              <Route index element={<IndiaLanding />} />
              <Route path="purchasing-power" element={<PurchasingPower />} />
              <Route path="price-lookup" element={<PriceLookup />} />
              <Route path="spike-timeline" element={<SpikeTimeline />} />
              <Route path="budget-stress" element={<BudgetStress />} />
              <Route path="sector-cards" element={<SectorCards />} />
              <Route path="share" element={<ShareStory />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
