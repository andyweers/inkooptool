import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

interface Order {
  id: number;
  order_number: string;
  invoice_number: string;
  supplier: string;
  webshop: string;
  description: string;
  total_amount_excl_vat: string;
  total_vat: string;
  total_import_duties: string;
  total_clearance_costs: string;
  vat_clearance_costs: string;
  shipping_costs: string;
  total_price: string;
  is_return: boolean;
  date_invoice_received: string;
  date_quote_requested: string;
  date_quote_received: string;
  date_order_placed: string;
  date_payment_completed: string;
  date_shipped: string;
  date_received: string;
  date_quality_control: string;
  date_booked_accounting: string;
  date_is_returned: string;
  date_refunded: string;
  date_return_processed_admin: string;
  date_import_invoice_received: string;
  date_credit_invoice_received: string;
}

const EditOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<Order>>({
    order_number: '',
    invoice_number: '',
    supplier: '',
    webshop: '',
    description: '',
    total_amount_excl_vat: '',
    total_vat: '',
    total_import_duties: '',
    total_clearance_costs: '',
    vat_clearance_costs: '',
    shipping_costs: '',
    is_return: false,
    date_invoice_received: '',
    date_quote_requested: '',
    date_quote_received: '',
    date_order_placed: '',
    date_payment_completed: '',
    date_shipped: '',
    date_received: '',
    date_quality_control: '',
    date_booked_accounting: '',
    date_is_returned: '',
    date_refunded: '',
    date_return_processed_admin: '',
    date_import_invoice_received: '',
    date_credit_invoice_received: '',
  });

  const [initialFormData, setInitialFormData] = useState<Partial<Order> | null>(null);

  const [checkboxes, setCheckboxes] = useState({
    quote_requested: false,
    quote_received: false,
    order_placed: false,
    payment_completed: false,
    invoice_received: false,
    shipped: false,
    received: false,
    quality_control: false,
    booked_accounting: false,
    is_returned: false,
    refunded: false,
    geld_terug: false,
    return_processed_admin: false,
    import_invoice_received: false,
    credit_invoice_received: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const parseLocaleString = (str: string | number): number | null => {
    if (typeof str === 'number') return str;
    if (!str || typeof str !== 'string') return null;
    return parseFloat(str.replace(/\./g, '').replace(',', '.'));
  };

  const formatToLocaleString = (num: number | null): string => {
    if (num === null || num === undefined || num === 0) return '';
    return new Intl.NumberFormat('nl-NL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data: Order = response.data;
        
        const newFormData: Partial<Order> = Object.keys(formData).reduce((acc, key) => {
          const typedKey = key as keyof Order;
          if (data[typedKey] !== null && data[typedKey] !== undefined) {
            if (typeof data[typedKey] === 'number' && ['total_amount_excl_vat', 'total_vat', 'total_import_duties', 'total_clearance_costs', 'vat_clearance_costs', 'shipping_costs'].includes(typedKey)) {
              (acc as any)[typedKey] = formatToLocaleString(data[typedKey] as number);
            } else {
              (acc as any)[typedKey] = data[typedKey];
            }
          }
          return acc;
        }, {} as Partial<Order>);


        setFormData({ ...newFormData });
        setInitialFormData({ ...newFormData });

        const newCheckboxes = {
          quote_requested: !!data.date_quote_requested,
          quote_received: !!data.date_quote_received,
          order_placed: !!data.date_order_placed,
          payment_completed: !!data.date_payment_completed,
          invoice_received: !!data.date_invoice_received,
          shipped: !!data.date_shipped,
          received: !!data.date_received,
          quality_control: !!data.date_quality_control,
          booked_accounting: !!data.date_booked_accounting,
          is_returned: !!data.date_is_returned,
          refunded: !!data.date_refunded,
          geld_terug: !!data.date_refunded,
          return_processed_admin: !!data.date_return_processed_admin,
          import_invoice_received: !!data.date_import_invoice_received,
          credit_invoice_received: !!data.date_credit_invoice_received,
        };
        setCheckboxes(newCheckboxes);

      } catch (err: any) {
        setError(err.response?.data?.error || 'Order ophalen mislukt');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCheckboxChange = (checkboxName: keyof typeof checkboxes, dateFieldName: keyof Order) => {
    const isChecked = !checkboxes[checkboxName];
    setCheckboxes(prev => ({ ...prev, [checkboxName]: isChecked }));
    if (isChecked) {
      setFormData(prev => ({ ...prev, [dateFieldName]: new Date().toISOString().split('T')[0] }));
    } else {
      setFormData(prev => ({ ...prev, [dateFieldName]: '' }));
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const key = name as keyof Order;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [key]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as keyof Order;
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as keyof Order;
    const numericValue = parseLocaleString(value);
    setFormData(prev => ({ ...prev, [key]: formatToLocaleString(numericValue) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    const dataToSubmit: { [key: string]: any } = { ...formData };
    Object.keys(dataToSubmit).forEach(key => {
      const typedKey = key as keyof Order;
      if ((typedKey.startsWith('total_') || typedKey.startsWith('vat_') || typedKey === 'shipping_costs') && typeof dataToSubmit[typedKey] === 'string') {
        dataToSubmit[typedKey] = parseLocaleString(dataToSubmit[typedKey] as string) || null;
      }
    });

    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/orders/${id}`, dataToSubmit, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Order succesvol bijgewerkt! Je wordt teruggestuurd...');
      setTimeout(() => navigate('/orders'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Order bijwerken mislukt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Weet je zeker dat je deze bestelling wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
        if (window.confirm('Definitief verwijderen?')) {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                setMessage('Order succesvol verwijderd. Je wordt teruggestuurd...');
                setTimeout(() => navigate('/orders'), 2000);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Verwijderen van order mislukt.');
                setIsLoading(false);
            }
        }
    }
  };
  
  const formContainerStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' };
  const columnStyle = { display: 'flex', flexDirection: 'column' as const, gap: '20px' };
  const formSectionStyle = { marginBottom: '0px' };
  const formSectionHeaderStyle = { color: '#34495e', marginBottom: '15px', fontSize: '16px', borderBottom: '1px solid #e9ecef', paddingBottom: '8px' };
  const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '6px', boxSizing: 'border-box' as const, fontSize: '14px' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: '500', color: '#495057', fontSize: '13px' };
  const checkboxStyle = { marginRight: '8px', transform: 'scale(1.2)' };
  const checkboxContainerStyle = { display: 'flex', alignItems: 'center', gap: '8px' };
  const dateInputStyle = { padding: '8px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px', width: 'auto' };
  const checkboxWrapperStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  };

  const buttonStyles = {
    base: {
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s ease',
    },
    save: {
      backgroundColor: '#007bff',
      color: 'white',
    },
    cancel: {
      backgroundColor: '#6c757d',
      color: 'white',
    },
    delete: {
      backgroundColor: '#dc3545',
      color: 'white',
    }
  };
  
  const renderCurrencyInput = (name: keyof Order, label: string) => (
    <div style={{ marginBottom: '15px' }}>
      <label style={labelStyle}>{label}</label>
      <input
        type="text"
        inputMode="decimal"
        name={name}
        value={String(formData[name] ?? '')}
        onChange={handleCurrencyChange}
        onBlur={handleBlur}
        style={inputStyle}
        placeholder="0,00"
      />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', margin: '0 auto', maxWidth: '1200px', padding: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#2c3e50', fontSize: '22px' }}>Bestelling bewerken</h2>
          <button onClick={() => navigate('/orders')} style={{ padding: '8px 15px', background: 'none', border: 'none', color: '#6c757d', cursor: 'pointer', fontSize: '18px' }}>&times;</button>
        </div>

        {isLoading ? <p>Laden...</p> : (
          <form onSubmit={handleSubmit}>
            <div style={formContainerStyle}>
              {/* --- Left Column --- */}
              <div style={columnStyle}>
                <div style={formSectionStyle}>
                  <h3 style={formSectionHeaderStyle}>📄 Algemene informatie</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={labelStyle}>Leverancier <span style={{ color: 'red' }}>*</span></label>
                      <input 
                        type="text" 
                        name="supplier" 
                        value={formData.supplier || ''} 
                        onChange={handleChange} 
                        style={inputStyle} 
                        placeholder="Bijv. Feng Shui Ltd of The Chinese Ring Company"
                      />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={labelStyle}>Webshop</label>
                      <input 
                        type="text" 
                        name="webshop" 
                        value={formData.webshop || ''} 
                        onChange={handleChange} 
                        style={inputStyle} 
                        placeholder="Bijv. Alibaba.com of PriceFactory.com"
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={labelStyle}>Ordernummer</label>
                      <input 
                        type="text" 
                        name="order_number" 
                        value={formData.order_number || ''} 
                        onChange={handleChange} 
                        style={{...inputStyle, opacity: checkboxes.order_placed ? 1 : 0.5, backgroundColor: checkboxes.order_placed ? 'white' : '#f8f9fa'}} 
                        disabled={!checkboxes.order_placed}
                        placeholder={checkboxes.order_placed ? "Bijv. ORD-2024-001" : "Eerst 'Bestelling geplaatst' aanvinken"}
                      />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={labelStyle}>Factuurnummer</label>
                      <input 
                        type="text" 
                        name="invoice_number" 
                        value={formData.invoice_number || ''} 
                        onChange={handleChange} 
                        style={{...inputStyle, opacity: checkboxes.invoice_received ? 1 : 0.5, backgroundColor: checkboxes.invoice_received ? 'white' : '#f8f9fa'}} 
                        disabled={!checkboxes.invoice_received}
                        placeholder={checkboxes.invoice_received ? "Bijv. INV-2024-001" : "Eerst 'Factuur ontvangen' aanvinken"}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={labelStyle}>Omschrijving</label>
                    <textarea 
                      name="description" 
                      value={formData.description || ''} 
                      onChange={handleChange} 
                      style={{ ...inputStyle, minHeight: '80px' }} 
                      placeholder="Beschrijf hier wat er besteld is..."
                    />
                  </div>
                </div>

                <div style={formSectionStyle}>
                  <h3 style={formSectionHeaderStyle}>💰 Bedragen</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {renderCurrencyInput('total_amount_excl_vat', 'Totaalbedrag (excl. BTW)')}
                    {renderCurrencyInput('total_vat', 'Totaal BTW')}
                    {renderCurrencyInput('total_import_duties', 'Totaal Invoerrechten')}
                    {renderCurrencyInput('total_clearance_costs', 'Totaal Inklaring')}
                    {renderCurrencyInput('vat_clearance_costs', 'BTW Inklaring')}
                    {renderCurrencyInput('shipping_costs', 'Verzendkosten')}
                  </div>
                </div>
              </div>

              {/* --- Right Column --- */}
              <div style={columnStyle}>
                <div style={formSectionStyle}>
                  <h3 style={formSectionHeaderStyle}>📅 Proces en datums</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    
                    {/* Offerte */}
                    <div style={checkboxWrapperStyle}>
                      <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.quote_requested} onChange={() => handleCheckboxChange('quote_requested', 'date_quote_requested')} style={checkboxStyle} />📋 Offerte aangevraagd</label>
                      {checkboxes.quote_requested && <input type="date" name="date_quote_requested" value={formData.date_quote_requested || ''} onChange={handleChange} style={dateInputStyle} />}
                    </div>
                    <div style={checkboxWrapperStyle}>
                      <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.quote_received} onChange={() => handleCheckboxChange('quote_received', 'date_quote_received')} style={checkboxStyle} />📄 Offerte ontvangen</label>
                      {checkboxes.quote_received && <input type="date" name="date_quote_received" value={formData.date_quote_received || ''} onChange={handleChange} style={dateInputStyle} />}
                    </div>

                    {/* Bestelling & Betaling */}
                    <div style={checkboxWrapperStyle}>
                      <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.order_placed} onChange={() => handleCheckboxChange('order_placed', 'date_order_placed')} style={checkboxStyle} />🛒 Bestelling geplaatst</label>
                      {checkboxes.order_placed && <input type="date" name="date_order_placed" value={formData.date_order_placed || ''} onChange={handleChange} style={dateInputStyle} />}
                    </div>
                    {checkboxes.order_placed &&
                      <div style={checkboxWrapperStyle}>
                        <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.payment_completed} onChange={() => handleCheckboxChange('payment_completed', 'date_payment_completed')} style={checkboxStyle} />💳 Betaling gedaan</label>
                        {checkboxes.payment_completed && <input type="date" name="date_payment_completed" value={formData.date_payment_completed || ''} onChange={handleChange} style={dateInputStyle} />}
                      </div>
                    }

                    {/* Factuur & Verzending */}
                    {checkboxes.payment_completed && (
                      <>
                        <div style={checkboxWrapperStyle}>
                          <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.invoice_received} onChange={() => handleCheckboxChange('invoice_received', 'date_invoice_received')} style={checkboxStyle} />📋 Factuur ontvangen</label>
                          {checkboxes.invoice_received && <input type="date" name="date_invoice_received" value={formData.date_invoice_received || ''} onChange={handleChange} style={dateInputStyle} />}
                        </div>
                        <div style={checkboxWrapperStyle}>
                          <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.shipped} onChange={() => handleCheckboxChange('shipped', 'date_shipped')} style={checkboxStyle} />🚚 Verzonden</label>
                          {checkboxes.shipped && <input type="date" name="date_shipped" value={formData.date_shipped || ''} onChange={handleChange} style={dateInputStyle} />}
                        </div>
                      </>
                    )}
                    
                    {/* Ontvangst & Controle */}
                    {checkboxes.shipped && (
                      <>
                        <div style={checkboxWrapperStyle}>
                          <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.received} onChange={() => handleCheckboxChange('received', 'date_received')} style={checkboxStyle} />📦 Ontvangen</label>
                          {checkboxes.received && <input type="date" name="date_received" value={formData.date_received || ''} onChange={handleChange} style={dateInputStyle} />}
                        </div>
                        <div style={checkboxWrapperStyle}>
                          <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.import_invoice_received} onChange={() => handleCheckboxChange('import_invoice_received', 'date_import_invoice_received')} style={checkboxStyle} />📋 Invoerfactuur ontvangen</label>
                          {checkboxes.import_invoice_received && <input type="date" name="date_import_invoice_received" value={formData.date_import_invoice_received || ''} onChange={handleChange} style={dateInputStyle} />}
                        </div>
                      </>
                    )}

                    {checkboxes.received && (
                      <div style={checkboxWrapperStyle}>
                        <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.quality_control} onChange={() => handleCheckboxChange('quality_control', 'date_quality_control')} style={checkboxStyle} />🔍 Kwaliteitscontrole</label>
                        {checkboxes.quality_control && <input type="date" name="date_quality_control" value={formData.date_quality_control || ''} onChange={handleChange} style={dateInputStyle} />}
                      </div>
                    )}

                    {/* Boekhouding */}
                    {checkboxes.invoice_received && (
                      <div style={checkboxWrapperStyle}>
                        <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.booked_accounting} onChange={() => handleCheckboxChange('booked_accounting', 'date_booked_accounting')} style={checkboxStyle} />📊 Boekhouding geboekt</label>
                        {checkboxes.booked_accounting && <input type="date" name="date_booked_accounting" value={formData.date_booked_accounting || ''} onChange={handleChange} style={dateInputStyle} />}
                      </div>
                    )}

                    {/* Retour vinkje */}
                    {checkboxes.order_placed && (
                      <div style={{ ...checkboxWrapperStyle, marginTop: '10px', gridColumn: '1 / -1' }}>
                        <label style={checkboxContainerStyle}>
                          <input type="checkbox" name="is_return" checked={!!formData.is_return} onChange={handleChange} style={checkboxStyle} />
                          ↩️ Dit is een retourzending
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Retour sectie - alleen zichtbaar als 'is_return' is aangevinkt */}
                {!!formData.is_return && (
                  <div style={{...formSectionStyle, marginTop: '20px', borderTop: '1px solid #e9ecef', paddingTop: '20px'}}>
                    <h3 style={formSectionHeaderStyle}>🔄 Retourproces</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                      <div style={checkboxWrapperStyle}>
                        <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.is_returned} onChange={() => handleCheckboxChange('is_returned', 'date_is_returned')} style={checkboxStyle} />🚢 Geretourneerd</label>
                        {checkboxes.is_returned && <input type="date" name="date_is_returned" value={formData.date_is_returned || ''} onChange={handleChange} style={dateInputStyle} />}
                      </div>
                      <div style={checkboxWrapperStyle}>
                        <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.credit_invoice_received} onChange={() => handleCheckboxChange('credit_invoice_received', 'date_credit_invoice_received')} style={checkboxStyle} />🧾 Creditfactuur ontvangen</label>
                        {checkboxes.credit_invoice_received && <input type="date" name="date_credit_invoice_received" value={formData.date_credit_invoice_received || ''} onChange={handleChange} style={dateInputStyle} />}
                      </div>
                      <div style={checkboxWrapperStyle}>
                        <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.refunded} onChange={() => handleCheckboxChange('refunded', 'date_refunded')} style={checkboxStyle} />💰 Geld retour</label>
                        {checkboxes.refunded && <input type="date" name="date_refunded" value={formData.date_refunded || ''} onChange={handleChange} style={dateInputStyle} />}
                      </div>
                      {(checkboxes.refunded || checkboxes.geld_terug) && (
                        <div style={checkboxWrapperStyle}>
                          <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.return_processed_admin} onChange={() => handleCheckboxChange('return_processed_admin', 'date_return_processed_admin')} style={checkboxStyle} />✅ Retour verwerkt in admin</label>
                          {checkboxes.return_processed_admin && <input type="date" name="date_return_processed_admin" value={formData.date_return_processed_admin || ''} onChange={handleChange} style={dateInputStyle} />}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '20px', marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleDelete}
                style={{ ...buttonStyles.base, ...buttonStyles.delete }}
                disabled={isLoading}
              >
                {isLoading ? 'Verwijderen...' : 'Verwijderen'}
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => navigate('/orders')} style={{ ...buttonStyles.base, ...buttonStyles.cancel }} disabled={isLoading}>
                  Annuleren
                </button>
                <button type="submit" style={{ ...buttonStyles.base, ...buttonStyles.save }} disabled={isLoading}>
                  {isLoading ? 'Opslaan...' : '💾 Opslaan'}
                </button>
              </div>
            </div>
          </form>
        )}
        {error && <p style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{error}</p>}
        {message && <p style={{ color: 'green', marginTop: '10px', textAlign: 'center' }}>{message}</p>}
      </div>
    </div>
  );
};

export default EditOrder; 