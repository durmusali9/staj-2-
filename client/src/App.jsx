import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReportWrite from './pages/ReportWrite';
import ReportView from './pages/ReportView';
import AdvisorPanel from './pages/AdvisorPanel';
import Statistics from './pages/Statistics';
import PDFExport from './pages/PDFExport';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/rapor-yaz" element={<ProtectedRoute role="ogrenci"><ReportWrite /></ProtectedRoute>} />
              <Route path="/rapor-yaz/:id" element={<ProtectedRoute role="ogrenci"><ReportWrite /></ProtectedRoute>} />
              <Route path="/rapor/:id" element={<ProtectedRoute><ReportView /></ProtectedRoute>} />
              <Route path="/danisman" element={<ProtectedRoute role="danisman"><AdvisorPanel /></ProtectedRoute>} />
              <Route path="/istatistikler" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
              <Route path="/pdf-export" element={<ProtectedRoute><PDFExport /></ProtectedRoute>} />
            </Route>
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
