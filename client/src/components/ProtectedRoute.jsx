import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  // Eğer veriler yükleniyorsa veya kimlik doğrulanmış ama kullanıcı nesnesi henüz gelmemişse bekle.
  // Bu, erken yönlendirmeleri engeller.
  if (loading || (isAuthenticated && !user)) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Yükleniyor...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Bu noktadan sonra 'user' nesnesinin dolu olduğunu varsayabiliriz.
  // Admin her sayfaya erişebilir.
  if (user.rol === 'admin') {
    return children;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
