import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
