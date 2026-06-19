import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useRef } from "react";
import Layout from "@/components/Layout/Layout";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import RecordPage from "@/pages/RecordPage";
import StatsPage from "@/pages/StatsPage";
import MapPage from "@/pages/MapPage";
import ListPage from "@/pages/ListPage";
import AuthPage from "@/pages/AuthPage";
import PublicDashboard from "@/pages/PublicDashboard";
import ProductDetailPage from "@/pages/ProductDetailPage";
import { useStore } from "@/store/useStore";

const HomePage = () => {
  const currentUser = useStore((state) => state.currentUser);
  return currentUser ? <RecordPage /> : <PublicDashboard />;
};

export default function App() {
  const currentUser = useStore((state) => state.currentUser);
  const syncAll = useStore((state) => state.syncAll);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (currentUser && !hasSynced.current) {
      hasSynced.current = true;
      setTimeout(() => {
        syncAll();
      }, 500);
    }
    if (!currentUser) {
      hasSynced.current = false;
    }
  }, [currentUser, syncAll]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <StatsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/list"
            element={
              <ProtectedRoute>
                <ListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/:productName"
            element={
              <ProtectedRoute>
                <ProductDetailPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}
