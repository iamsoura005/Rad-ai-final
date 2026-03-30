import { motion } from "framer-motion";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import HealthChat from "./pages/HealthChat";
import HealthTimeline from "./pages/HealthTimeline";
import Landing from "./pages/Landing";
import MedicineInfo from "./pages/MedicineInfo";
import ScanAnalysis from "./pages/ScanAnalysis";
import SymptomChecker from "./pages/SymptomChecker";

function LandingLayout() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Sidebar />
        <motion.main
          className="w-full"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Outlet />
        </motion.main>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<LandingLayout />}>
        <Route path="/" element={<Landing />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="/scan" element={<ScanAnalysis />} />
        <Route path="/symptoms" element={<SymptomChecker />} />
        <Route path="/medicine" element={<MedicineInfo />} />
        <Route path="/chat" element={<HealthChat />} />
        <Route path="/history" element={<HealthTimeline />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
