import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const NavBar: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };
  return (
    <nav style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid #333', marginBottom: 24 }}>
      {loading ? null : user ? (
        <>
          <span style={{ marginRight: 16, color: '#38bdf8', fontWeight: 500 }}>{user.email}</span>
          {location.pathname !== '/auth' && (
            <Link to="/auth" style={{ marginRight: 16, textDecoration: 'none', color: '#38bdf8', fontWeight: 600 }}>Account</Link>
          )}
          <button onClick={handleLogout} style={{ background: '#333', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', cursor: 'pointer' }}>Logout</button>
        </>
      ) : (
        <Link to="/auth" style={{ textDecoration: 'none', color: '#38bdf8', fontWeight: 600 }}>Login / Sign Up</Link>
      )}
    </nav>
  );
};

export default NavBar;
