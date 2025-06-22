import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Order {
  id: number;
  order_number: string;
  supplier: string;
  total_amount_excl_vat: number;
  shipping_costs: number;
  status: string;
  date_order_placed: string;
  last_status_date: string;
  
  // Checkbox fields for status determination
  date_quote_requested?: string;
  date_quote_received?: string;
  date_payment_completed?: string;
  date_invoice_received?: string;
  date_shipped?: string;
  date_received?: string;
  date_quality_control?: string;
  date_booked_accounting?: string;
  date_import_invoice_received?: string;
  date_is_returned?: string;
  date_refunded?: string;
  date_credit_invoice_received?: string;
  date_return_processed_admin?: string;
  
  // Return checkbox
  is_return?: boolean;
}

const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) {
    return '€ 0,00';
  }
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/orders/export', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // Belangrijk voor het downloaden van bestanden
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'orders-export.csv';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (fileNameMatch.length === 2)
          fileName = fileNameMatch[1];
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (err) {
      console.error('Export mislukt', err);
      setError('Exporteren van de data is mislukt.');
    }
  };

  const handleImportClick = () => {
    if (window.confirm('WAARSCHUWING 1: Weet je zeker dat je wilt importeren? Dit overschrijft ALLE huidige bestellingen.')) {
      if (window.confirm('WAARSCHUWING 2: Deze actie kan NIET ongedaan worden gemaakt. Alle data wordt permanent vervangen.')) {
        if (window.confirm('DEFINITIEVE WAARSCHUWING 3: Weet je absoluut zeker dat je door wilt gaan?')) {
          fileInputRef.current?.click();
        }
      }
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/orders/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      alert(response.data.message);
      window.location.reload(); // Herlaad de pagina om de nieuwe data te zien
    } catch (err: any) {
      const errorData = err.response?.data;
      let errorMessage = 'Importeren mislukt. ';
      if (errorData?.message) {
        errorMessage += errorData.message;
      }
      if (errorData?.errors) {
        errorMessage += '\\nFouten:\\n' + errorData.errors.map((e: any) => `Rij ${e.row}: ${e.error}`).join('\\n');
      }
      alert(errorMessage);
    } finally {
        // Reset de file input zodat dezelfde file opnieuw gekozen kan worden
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Geen toegangstoken gevonden. Log opnieuw in.');
          setIsLoading(false);
          return;
        }

        const response = await axios.get('/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setOrders(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Kon orders niet ophalen');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const calculateOrderStatus = (order: Order) => {
    const hasDate = (date?: string) => date && date !== '';

    const normalStatusDefinitions = [
      { condition: () => hasDate(order.date_booked_accounting), text: 'Volledig afgehandeld!', color: hasDate(order.date_received) ? 'green' : 'orange' },
      { condition: () => hasDate(order.date_shipped), text: hasDate(order.date_invoice_received) ? 'Verzonden naar ons en factuur ontvangen' : 'Verzonden naar ons', color: 'orange' },
      { condition: () => hasDate(order.date_received), text: 'Bestelling ontvangen', color: 'orange' },
      { condition: () => hasDate(order.date_invoice_received), text: 'Besteld, betaald en factuur ontvangen', color: 'orange' },
      { condition: () => hasDate(order.date_payment_completed), text: 'Besteld én betaald', color: 'orange' },
      { condition: () => hasDate(order.date_order_placed), text: 'Besteld maar niet betaald', color: 'red' },
      { condition: () => hasDate(order.date_quote_received), text: 'Offerte ontvangen', color: 'green' },
      { condition: () => hasDate(order.date_quote_requested), text: 'Offerte aangevraagd', color: 'orange' },
    ];

    const returnStatusDefinitions = [
      { condition: () => hasDate(order.date_return_processed_admin), text: 'Retour volledig afgehandeld!', color: 'green' },
      { condition: () => hasDate(order.date_refunded), text: 'Geld retour ontvangen', color: 'orange' },
      { condition: () => hasDate(order.date_credit_invoice_received), text: 'Creditfactuur ontvangen', color: 'orange' },
      { condition: () => hasDate(order.date_is_returned), text: 'Geretourneerd naar leverancier', color: 'orange' },
    ];

    // Find the latest date among all status-related dates
    const allDates = [
      order.date_quote_requested, order.date_quote_received, order.date_order_placed, 
      order.date_payment_completed, order.date_invoice_received, order.date_shipped, 
      order.date_received, order.date_booked_accounting, order.date_return_processed_admin,
      order.date_refunded, order.date_credit_invoice_received, order.date_is_returned
    ].map(d => hasDate(d) ? new Date(d as string).getTime() : 0);

    const latestDate = new Date(Math.max(...allDates));

    let status = { text: 'Nieuwe bestelling', color: 'gray' };

    // Determine the base status by finding the latest action
    const statusTimeline = [
      { date: order.date_booked_accounting, status: { text: 'Volledig afgehandeld!', color: hasDate(order.date_received) ? 'green' : 'orange' } },
      { date: order.date_shipped, status: { text: hasDate(order.date_invoice_received) ? 'Verzonden naar ons en factuur ontvangen' : 'Verzonden naar ons', color: 'orange' } },
      { date: order.date_received, status: { text: 'Bestelling ontvangen', color: 'orange' } },
      { date: order.date_invoice_received, status: { text: 'Besteld, betaald en factuur ontvangen', color: 'orange' } },
      { date: order.date_payment_completed, status: { text: 'Besteld én betaald', color: 'orange' } },
      { date: order.date_order_placed, status: { text: 'Besteld maar niet betaald', color: 'red' } },
      { date: order.date_quote_received, status: { text: 'Offerte ontvangen', color: 'green' } },
      { date: order.date_quote_requested, status: { text: 'Offerte aangevraagd', color: 'orange' } },
    ].filter(item => hasDate(item.date));

    if (statusTimeline.length > 0) {
      statusTimeline.sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
      status = statusTimeline[0].status;
    }

    // Handle return logic
    if (order.is_return) {
      const returnTimeline = [
        { date: order.date_return_processed_admin, status: { text: 'Retour volledig afgehandeld!', color: 'green' } },
        { date: order.date_refunded, status: { text: 'Geld retour ontvangen', color: 'orange' } },
        { date: order.date_credit_invoice_received, status: { text: 'Creditfactuur ontvangen', color: 'orange' } },
        { date: order.date_is_returned, status: { text: 'Geretourneerd naar leverancier', color: 'orange' } },
      ].filter(item => hasDate(item.date));

      if (returnTimeline.length > 0) {
        returnTimeline.sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
        status = returnTimeline[0].status;
      } else {
        // No return action taken yet, just append text
        status.text += ' - Gaat retour';
      }
    }

    return status;
  };

  const getStatusStyle = (order: Order): React.CSSProperties => {
    const status = calculateOrderStatus(order);
    const baseStyle = {
      padding: '3px 8px',
      borderRadius: '8px',
      fontSize: '11px',
      fontWeight: '500',
      textAlign: 'center' as const,
      color: 'white',
      whiteSpace: 'nowrap' as const,
    };

    return {
      ...baseStyle,
      backgroundColor: status.color,
      color: 'white'
    };
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '10px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', color: '#6c757d' }}>🔄 Orders laden...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '10px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', margin: '0 auto', maxWidth: '100%', padding: '20px' }}>
        
        {/* --- Header Row --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
          {/* Left: Title */}
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <img src="/logo.png" alt="Lion Gris Logo" style={{ width: '50px', height: 'auto' }} />
            <div>
              <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '24px' }}>Bestellingen</h1>
              <p style={{ margin: '2px 0 0 0', color: '#6c757d', fontSize: '14px' }}>Overzicht van al je bestellingen</p>
            </div>
          </div>
          {/* Right: Auth Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/change-password')} style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap' }}>
              Wachtwoord
            </button>
            <button onClick={handleLogout} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap' }}>
              Uitloggen
            </button>
          </div>
        </div>

        {/* --- Action Buttons Row --- */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={() => navigate('/add-order')} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
              ➕ Nieuwe bestelling
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileImport} style={{ display: 'none' }} accept=".csv" />
            <button onClick={handleImportClick} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
              Importeer
            </button>
            <button onClick={handleExport} style={{ backgroundColor: '#17a2b8', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
              Exporteer
            </button>
        </div>

        {error && <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #f5c6cb', fontSize: '13px' }}>⚠️ {error}</div>}

        {orders.length === 0 && !error ? (
          <div style={{ textAlign: 'center', padding: '30px 20px', color: '#6c757d' }}>
            <div style={{ fontSize: '36px', marginBottom: '15px' }}>📭</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Geen bestellingen gevonden</h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '13px' }}>Er zijn nog geen bestellingen toegevoegd.</p>
            <button onClick={() => navigate('/add-order')} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
              ➕ Eerste Bestelling
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '8px 6px', textAlign: 'left', color: '#495057', fontSize: '12px', fontWeight: '600' }}>Order</th>
                  <th style={{ padding: '8px 6px', textAlign: 'left', color: '#495057', fontSize: '12px', fontWeight: '600' }}>Leverancier</th>
                  <th style={{ padding: '8px 6px', textAlign: 'left', color: '#495057', fontSize: '12px', fontWeight: '600' }}>Inkooporder waarde</th>
                  <th style={{ padding: '8px 6px', textAlign: 'left', color: '#495057', fontSize: '12px', fontWeight: '600' }}>Verzendkosten</th>
                  <th style={{ padding: '8px 6px', textAlign: 'left', color: '#495057', fontSize: '12px', fontWeight: '600' }}>Besteldatum</th>
                  <th style={{ padding: '8px 6px', textAlign: 'left', color: '#495057', fontSize: '12px', fontWeight: '600' }}>Laatste update</th>
                  <th style={{ padding: '8px 6px', textAlign: 'center', color: '#495057', fontSize: '12px', fontWeight: '600' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr 
                    key={order.id} 
                    style={{ 
                      borderBottom: '1px solid #e9ecef', 
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      userSelect: 'none'
                    }} 
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <td style={{ padding: '8px 6px', fontWeight: '500', color: '#495057', fontSize: '13px', userSelect: 'none' }}>{order.order_number}</td>
                    <td style={{ padding: '8px 6px', fontSize: '13px', userSelect: 'none' }}>{order.supplier}</td>
                    <td style={{ padding: '8px 6px', fontSize: '13px', userSelect: 'none' }}>{formatCurrency(order.total_amount_excl_vat)}</td>
                    <td style={{ padding: '8px 6px', fontSize: '13px', userSelect: 'none' }}>{formatCurrency(order.shipping_costs)}</td>
                    <td style={{ padding: '8px 6px', fontSize: '13px', userSelect: 'none' }}>{order.date_order_placed ? new Date(order.date_order_placed).toLocaleDateString('nl-NL') : 'N/A'}</td>
                    <td style={{ padding: '8px 6px', fontSize: '13px', userSelect: 'none' }}>{order.last_status_date ? new Date(order.last_status_date).toLocaleDateString('nl-NL') : 'N/A'}</td>
                    <td style={{ padding: '8px 6px', userSelect: 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <span style={getStatusStyle(order)}>{calculateOrderStatus(order).text}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;