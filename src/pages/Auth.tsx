import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm, SignupForm, LogoutButton } from '@/components/AuthForms';
import { useAuth } from '@/contexts/AuthContext';

const AuthPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to / if authenticated
  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return <div>Loading...</div>;
  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #333', borderRadius: 8 }}>
      <h1 style={{ textAlign: 'center', marginBottom: 24 }}>Account</h1>
      {user ? (
        <>
          <div style={{ marginBottom: 16, textAlign: 'center' }}>
            <b>Logged in as:</b> <span>{user.email}</span>
          </div>
          <LogoutButton />
        </>
      ) : (
        <>
          <LoginForm />
          <hr style={{ margin: '24px 0' }} />
          <SignupForm />
        </>
      )}
    </div>
  );
};

export default AuthPage;
