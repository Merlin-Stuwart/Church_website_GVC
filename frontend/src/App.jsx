import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrayerModal from './components/PrayerModal';
import TestimonyModal from './components/TestimonyModal';
import AdminAuthModal from './components/AdminAuthModal';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Ministries from './pages/Ministries';
import Sermons from './pages/Sermons';
import Events from './pages/Events';
import PrayerWall from './pages/PrayerWall';
import Giving from './pages/Giving';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';

// Auto scroll to top on page navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);
  const [isTestimonyModalOpen, setIsTestimonyModalOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  // Global Keyboard Shortcut: Ctrl + Shift + A (Opens Admin Access Modal anywhere)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.code === 'KeyA')) {
        e.preventDefault();
        setIsAdminAuthOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-slate-800">
      <ScrollToTop />

      {/* Show Church Navbar unless on pure admin page */}
      {!isAdminRoute && (
        <Navbar 
          onOpenPlanVisit={() => setIsPlanVisitOpen(true)} 
          onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
        />
      )}

      {/* Main Pages Content */}
      <main className="flex-1">
        <Routes>
          <Route 
            path="/" 
            element={
              <Home 
                onOpenPlanVisit={() => setIsPlanVisitOpen(true)}
                onOpenPrayerModal={() => setIsPrayerModalOpen(true)}
                onOpenTestimonyModal={() => setIsTestimonyModalOpen(true)}
              />
            } 
          />
          <Route 
            path="/about" 
            element={<About onOpenPlanVisit={() => setIsPlanVisitOpen(true)} />} 
          />
          <Route 
            path="/ministries" 
            element={<Ministries onOpenPlanVisit={() => setIsPlanVisitOpen(true)} />} 
          />
          <Route path="/sermons" element={<Sermons />} />
          <Route path="/events" element={<Events />} />
          <Route 
            path="/prayer-wall" 
            element={
              <PrayerWall 
                onOpenPrayerModal={() => setIsPrayerModalOpen(true)} 
                onOpenTestimonyModal={() => setIsTestimonyModalOpen(true)}
              />
            } 
          />
          <Route path="/giving" element={<Giving />} />
          <Route 
            path="/contact" 
            element={<Contact onOpenPlanVisit={() => setIsPlanVisitOpen(true)} />} 
          />
          <Route path="/admin" element={<AdminDashboard onOpenAdminAuth={() => setIsAdminAuthOpen(true)} />} />
        </Routes>
      </main>

      {/* Church Footer */}
      {!isAdminRoute && (
        <Footer onOpenAdminAuth={() => setIsAdminAuthOpen(true)} />
      )}

      {/* Global Interactive Modals */}
      <PrayerModal 
        isOpen={isPrayerModalOpen} 
        onClose={() => setIsPrayerModalOpen(false)} 
      />

      <TestimonyModal 
        isOpen={isTestimonyModalOpen} 
        onClose={() => setIsTestimonyModalOpen(false)} 
      />

      {/* Admin Authentication Shortcut Modal (Ctrl + Shift + A) */}
      <AdminAuthModal 
        isOpen={isAdminAuthOpen} 
        onClose={() => setIsAdminAuthOpen(false)} 
      />
    </div>
  );
}
