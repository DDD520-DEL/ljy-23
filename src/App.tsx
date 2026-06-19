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
import ShoppingListPage from "@/pages/ShoppingListPage";
import SettingsPage from "@/pages/SettingsPage";
import CalendarPage from "@/pages/CalendarPage";
import TipsGuidePage from "@/pages/TipsGuidePage";
import NearbyDealsPage from "@/pages/NearbyDealsPage";
import FeedbackPage from "@/pages/FeedbackPage";
import BadgesPage from "@/pages/BadgesPage";
import NotificationsPage from "@/pages/NotificationsPage";
import RecycleBinPage from "@/pages/RecycleBinPage";
import { useStore } from "@/store/useStore";
import { useTheme } from "@/hooks/useTheme";

const HomePage = () => {
  const currentUser = useStore((state) => state.currentUser);
  return currentUser ? <RecordPage /> : <PublicDashboard />;
};

export default function App() {
  useTheme();
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
            path="/nearby-deals"
            element={
              <ProtectedRoute>
                <NearbyDealsPage />
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
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shopping-list"
            element={
              <ProtectedRoute>
                <ShoppingListPage />
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
          <Route
            path="/tips-guide"
            element={
              <ProtectedRoute>
                <TipsGuidePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/badges"
            element={
              <ProtectedRoute>
                <BadgesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recycle-bin"
            element={
              <ProtectedRoute>
                <RecycleBinPage />
              </ProtectedRoute>
            }
          />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
