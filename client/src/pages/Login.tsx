import React, { useState } from 'react';
import axios from 'axios';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        window.location.href = '/orders';
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Inloggen mislukt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '10px'
    }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '25px', maxWidth: '450px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <img src="/logo.png" alt="Lion Gris Logo" style={{ width: '80px', height: 'auto', margin: '0 auto 15px', display: 'block' }} />
          <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '22px', fontWeight: '600' }}>Lion Gris Gems & Jewellery</h1>
          <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '16px' }}>Inkoopadministratie</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              textAlign: 'left',
              marginBottom: '6px',
              fontWeight: '500',
              color: '#495057',
              fontSize: '13px'
            }}>
              👤 Gebruikersnaam
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Voer je gebruikersnaam in"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              textAlign: 'left',
              marginBottom: '6px',
              fontWeight: '500',
              color: '#495057',
              fontSize: '13px'
            }}>
              🔒 Wachtwoord
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Voer je wachtwoord in"
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '15px',
              border: '1px solid #f5c6cb',
              fontSize: '13px'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isLoading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {isLoading ? '🔄 Inloggen...' : '🚀 Inloggen'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;