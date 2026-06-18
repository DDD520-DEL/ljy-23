import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import RecordPage from "@/pages/RecordPage";
import StatsPage from "@/pages/StatsPage";
import MapPage from "@/pages/MapPage";
import ListPage from "@/pages/ListPage";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<RecordPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/list" element={<ListPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
