import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const LoginForm: React.FC = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signIn(email, password);
    if (error) setError(error.message);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      <button type="submit">Login</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
};

export const SignupForm: React.FC = () => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signUp(email, password);
    if (error) setError(error.message);
    else setSuccess(true);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      <button type="submit">Sign Up</button>
      {error && <div style={{color:'red'}}>{error}</div>}
      {success && <div style={{color:'green'}}>Check your email to confirm registration.</div>}
    </form>
  );
};

export const LogoutButton: React.FC = () => {
  const { signOut } = useAuth();
  return <button onClick={() => signOut()}>Logout</button>;
};
