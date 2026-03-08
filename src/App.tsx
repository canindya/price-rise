import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import CountryDetail from './pages/CountryDetail';
import Compare from './pages/Compare';
import About from './pages/About';

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
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
