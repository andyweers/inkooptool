import React, { useState } from 'react';
import axios from 'axios';

const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Nieuwe wachtwoorden komen niet overeen');
      return;
    }

    if (newPassword.length < 8) {
      setError('Nieuw wachtwoord moet minimaal 8 karakters zijn');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage('Wachtwoord succesvol gewijzigd!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Wachtwoord wijzigen mislukt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '10px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '15px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '18px' }}>🔐 Wachtwoord Wijzigen</h1>
            <p style={{ margin: '2px 0 0 0', color: '#6c757d', fontSize: '12px' }}>Beheer je account beveiliging</p>
          </div>
          <button
            onClick={() => window.location.href = '/orders'}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
          >
            ← Terug
          </button>
        </div>
      </div>

      {/* Form */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '25px',
        maxWidth: '450px',
        margin: '0 auto'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px'}}>
          <img src="/logo.png" alt="Lion Gris Logo" style={{ width: '50px', height: 'auto' }} />
          <div>
            <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '18px' }}>🔐 Wachtwoord Wijzigen</h1>
            <p style={{ margin: '2px 0 0 0', color: '#6c757d', fontSize: '12px' }}>Stel een nieuw en veilig wachtwoord in</p>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: '500',
              color: '#495057',
              fontSize: '13px'
            }}>
              🔒 Huidig wachtwoord
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Voer je huidige wachtwoord in"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: '500',
              color: '#495057',
              fontSize: '13px'
            }}>
              🆕 Nieuw wachtwoord
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Minimaal 8 karakters"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: '500',
              color: '#495057',
              fontSize: '13px'
            }}>
              ✅ Bevestig nieuw wachtwoord
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Herhaal het nieuwe wachtwoord"
            />
          </div>

          {message && (
            <div style={{
              backgroundColor: '#d4edda',
              color: '#155724',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '15px',
              border: '1px solid #c3e6cb',
              fontSize: '13px'
            }}>
              ✅ {message}
            </div>
          )}

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
            {isLoading ? '🔄 Wijzigen...' : '💾 Wachtwoord Wijzigen'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;