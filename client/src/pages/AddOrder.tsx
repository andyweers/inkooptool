import React, { useState } from 'react';
import axios from 'axios';

const AddOrder: React.FC = () => {
  const [formData, setFormData] = useState({
    order_number: '',
    invoice_number: '',
    date_quote_requested: '',
    date_quote_received: '',
    date_order_placed: '',
    date_payment_completed: '',
    date_invoice_received: '',
    date_shipped: '',
    date_received: '',
    date_quality_control: '',
    date_booked_accounting: '',
    date_import_invoice_received: '',
    date_is_returned: '',
    date_refunded: '',
    date_return_processed_admin: '',
    date_credit_invoice_received: '',
    total_amount_excl_vat: '',
    total_vat: '',
    total_import_duties: '',
    total_clearance_costs: '',
    vat_clearance_costs: '',
    shipping_costs: '',
    supplier: '',
    webshop: '',
    description: '',
    is_return: false
  });

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
    import_invoice_received: false,
    is_returned: false,
    refunded: false,
    geld_terug: false,
    return_processed_admin: false,
    credit_invoice_received: false,
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formContainerStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' };
  const columnStyle = { display: 'flex', flexDirection: 'column' as const, gap: '20px' };
  const formSectionStyle = { marginBottom: '20px' };
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
  };

  // Helper om een NL-string ("1.234,56") om te zetten naar een JS-nummer (1234.56)
  const parseLocaleString = (str: string): number | null => {
    if (typeof str !== 'string' || str.trim() === '') return null;
    const number = parseFloat(str.replace(/\./g, '').replace(',', '.'));
    return isNaN(number) ? null : number;
  };

  // Helper om een JS-nummer (1234.56) te formatteren naar een NL-string ("1.234,56")
  const formatToLocaleString = (num: number | null): string => {
    if (num === null || num === undefined || num === 0) return '';
    return new Intl.NumberFormat('nl-NL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const handleCheckboxChange = (field: keyof typeof checkboxes, dateField: keyof typeof formData) => {
    const isChecked = !checkboxes[field];
    setCheckboxes(prev => ({ ...prev, [field]: isChecked }));
    setFormData(prev => ({ ...prev, [dateField]: isChecked ? new Date().toISOString().split('T')[0] : '' }));
  };

  // Update de state direct met de (ongeformatteerde) input van de gebruiker
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Bij het verlaten van het veld, parse en formatteer de waarde
  const handleCurrencyBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = parseLocaleString(value);
    setFormData(prev => ({ ...prev, [name]: formatToLocaleString(numericValue) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    const dataToSubmit = {
      ...formData,
      total_amount_excl_vat: parseLocaleString(formData.total_amount_excl_vat) || 0,
      total_vat: parseLocaleString(formData.total_vat) || 0,
      total_import_duties: parseLocaleString(formData.total_import_duties) || 0,
      total_clearance_costs: parseLocaleString(formData.total_clearance_costs) || 0,
      vat_clearance_costs: parseLocaleString(formData.vat_clearance_costs) || 0,
      shipping_costs: parseLocaleString(formData.shipping_costs) || 0
    };

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/orders', dataToSubmit, { headers: { Authorization: `Bearer ${token}` } });
      
      setMessage('Bestelling succesvol toegevoegd! Je wordt teruggestuurd...');
      setTimeout(() => { window.location.href = '/orders'; }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.error || 'Toevoegen van bestelling mislukt');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrencyInput = (name: keyof typeof formData, label: string) => (
    <div style={{ marginBottom: '15px' }}>
      <label style={labelStyle}>{label}</label>
      <input
        type="text"
        inputMode="decimal"
        name={name}
        value={formData[name] !== undefined && formData[name] !== null && formData[name] !== '' && formData[name] !== '0' && formData[name] !== '0,00' ? String(formData[name]) : ''}
        onChange={handleCurrencyChange}
        onBlur={handleCurrencyBlur}
        style={inputStyle}
        placeholder="0,00"
      />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', margin: '0 auto', maxWidth: '1200px', padding: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#2c3e50', fontSize: '22px' }}>Nieuwe bestelling</h2>
          <button onClick={() => window.location.href='/orders'} style={{ padding: '8px 15px', background: 'none', border: 'none', color: '#6c757d', cursor: 'pointer', fontSize: '18px' }}>&times;</button>
        </div>

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
                      value={formData.supplier} 
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})} 
                      style={inputStyle} 
                      placeholder="Bijv. Feng Shui Ltd of The Chinese Ring Company"
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={labelStyle}>Webshop</label>
                    <input 
                      type="text" 
                      name="webshop" 
                      value={formData.webshop} 
                      onChange={(e) => setFormData({...formData, webshop: e.target.value})} 
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
                      value={formData.order_number} 
                      onChange={(e) => setFormData({...formData, order_number: e.target.value})} 
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
                      value={formData.invoice_number} 
                      onChange={(e) => setFormData({...formData, invoice_number: e.target.value})} 
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
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    style={{ ...inputStyle, minHeight: '80px' }} 
                    placeholder="Beschrijf hier wat er besteld is..."
                  />
                </div>
              </div>

              <div style={formSectionStyle}>
                <h3 style={formSectionHeaderStyle}>💰 Bedragen</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  {renderCurrencyInput('total_amount_excl_vat', 'Totaalbedrag excl. BTW')}
                  {renderCurrencyInput('total_vat', 'BTW')}
                  {renderCurrencyInput('total_import_duties', 'Invoerrechten')}
                  {renderCurrencyInput('total_clearance_costs', 'Inklaring')}
                  {renderCurrencyInput('vat_clearance_costs', 'BTW douanekosten')}
                  {renderCurrencyInput('shipping_costs', 'Verzendkosten')}
                </div>
              </div>
            </div>

            {/* --- Right Column --- */}
            <div style={columnStyle}>
              <div style={formSectionStyle}>
                <h3 style={formSectionHeaderStyle}>📅 Proces en datums</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  
                  {/* Altijd zichtbaar */}
                  <div style={checkboxWrapperStyle}>
                    <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.quote_requested} onChange={() => handleCheckboxChange('quote_requested', 'date_quote_requested')} style={checkboxStyle} />📋 Offerte aangevraagd</label>
                    {checkboxes.quote_requested && <input type="date" value={formData.date_quote_requested} onChange={(e) => setFormData({...formData, date_quote_requested: e.target.value})} style={dateInputStyle} />}
                  </div>

                  <div style={checkboxWrapperStyle}>
                    <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.quote_received} onChange={() => handleCheckboxChange('quote_received', 'date_quote_received')} style={checkboxStyle} />📄 Offerte ontvangen</label>
                    {checkboxes.quote_received && <input type="date" value={formData.date_quote_received} onChange={(e) => setFormData({...formData, date_quote_received: e.target.value})} style={dateInputStyle} />}
                  </div>

                  <div style={checkboxWrapperStyle}>
                    <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.order_placed} onChange={() => handleCheckboxChange('order_placed', 'date_order_placed')} style={checkboxStyle} />🛒 Bestelling geplaatst</label>
                    {checkboxes.order_placed && <input type="date" value={formData.date_order_placed} onChange={(e) => setFormData({...formData, date_order_placed: e.target.value})} style={dateInputStyle} />}
                  </div>

                  {/* Alleen zichtbaar na bestelling geplaatst */}
                  {checkboxes.order_placed && (
                    <div style={checkboxWrapperStyle}>
                      <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.payment_completed} onChange={() => handleCheckboxChange('payment_completed', 'date_payment_completed')} style={checkboxStyle} />💳 Betaling gedaan</label>
                      {checkboxes.payment_completed && <input type="date" value={formData.date_payment_completed} onChange={(e) => setFormData({...formData, date_payment_completed: e.target.value})} style={dateInputStyle} />}
                    </div>
                  )}

                  {/* Alleen zichtbaar na betaling gedaan */}
                  {checkboxes.payment_completed && (
                    <>
                      <div style={checkboxWrapperStyle}>
                        <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.invoice_received} onChange={() => handleCheckboxChange('invoice_received', 'date_invoice_received')} style={checkboxStyle} />📋 Factuur ontvangen</label>
                        {checkboxes.invoice_received && <input type="date" value={formData.date_invoice_received} onChange={(e) => setFormData({...formData, date_invoice_received: e.target.value})} style={dateInputStyle} />}
                      </div>

                      <div style={checkboxWrapperStyle}>
                        <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.shipped} onChange={() => handleCheckboxChange('shipped', 'date_shipped')} style={checkboxStyle} />🚚 Verzonden</label>
                        {checkboxes.shipped && <input type="date" value={formData.date_shipped} onChange={(e) => setFormData({...formData, date_shipped: e.target.value})} style={dateInputStyle} />}
                      </div>
                    </>
                  )}

                  {/* Alleen zichtbaar na factuur ontvangen */}
                  {checkboxes.invoice_received && (
                    <div style={checkboxWrapperStyle}>
                      <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.booked_accounting} onChange={() => handleCheckboxChange('booked_accounting', 'date_booked_accounting')} style={checkboxStyle} />📊 Boekhouding geboekt</label>
                      {checkboxes.booked_accounting && <input type="date" value={formData.date_booked_accounting} onChange={(e) => setFormData({...formData, date_booked_accounting: e.target.value})} style={dateInputStyle} />}
                    </div>
                  )}

                  {/* Alleen zichtbaar na verzonden */}
                  {checkboxes.shipped && (
                    <>
                      <div style={checkboxWrapperStyle}>
                        <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.received} onChange={() => handleCheckboxChange('received', 'date_received')} style={checkboxStyle} />📦 Ontvangen</label>
                        {checkboxes.received && <input type="date" value={formData.date_received} onChange={(e) => setFormData({...formData, date_received: e.target.value})} style={dateInputStyle} />}
                      </div>

                      <div style={checkboxWrapperStyle}>
                        <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.import_invoice_received} onChange={() => handleCheckboxChange('import_invoice_received', 'date_import_invoice_received')} style={checkboxStyle} />📋 Invoerfactuur ontvangen</label>
                        {checkboxes.import_invoice_received && <input type="date" value={formData.date_import_invoice_received} onChange={(e) => setFormData({...formData, date_import_invoice_received: e.target.value})} style={dateInputStyle} />}
                      </div>
                    </>
                  )}

                  {/* Alleen zichtbaar na ontvangen */}
                  {checkboxes.received && (
                    <div style={checkboxWrapperStyle}>
                      <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.quality_control} onChange={() => handleCheckboxChange('quality_control', 'date_quality_control')} style={checkboxStyle} />🔍 Kwaliteitscontrole</label>
                      {checkboxes.quality_control && <input type="date" value={formData.date_quality_control} onChange={(e) => setFormData({...formData, date_quality_control: e.target.value})} style={dateInputStyle} />}
                    </div>
                  )}

                  {/* Return-specific fields - alleen zichtbaar na bestelling geplaatst */}
                  {checkboxes.order_placed && (
                    <label style={checkboxContainerStyle}>
                      <input type="checkbox" name="is_return" checked={formData.is_return} onChange={(e) => setFormData({...formData, is_return: e.target.checked})} style={checkboxStyle} />
                      ↩️ Gaat retour?
                    </label>
                  )}
                </div>
              </div>

              {/* Retour sectie - onderaan de rechterkolom met lijn */}
              {formData.is_return && (
                <div style={{...formSectionStyle, marginTop: '20px', borderTop: '1px solid #e9ecef', paddingTop: '20px'}}>
                  <h3 style={formSectionHeaderStyle}>🔄 Retourproces</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div style={checkboxWrapperStyle}>
                      <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.is_returned} onChange={() => handleCheckboxChange('is_returned', 'date_is_returned')} style={checkboxStyle} />🚢 Geretourneerd</label>
                      {checkboxes.is_returned && <input type="date" value={formData.date_is_returned} onChange={(e) => setFormData({...formData, date_is_returned: e.target.value})} style={dateInputStyle} />}
                    </div>
                    <div style={checkboxWrapperStyle}>
                      <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.credit_invoice_received} onChange={() => handleCheckboxChange('credit_invoice_received', 'date_credit_invoice_received')} style={checkboxStyle} />🧾 Creditfactuur ontvangen</label>
                      {checkboxes.credit_invoice_received && <input type="date" value={formData.date_credit_invoice_received} onChange={(e) => setFormData({...formData, date_credit_invoice_received: e.target.value})} style={dateInputStyle} />}
                    </div>
                    <div style={checkboxWrapperStyle}>
                      <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.refunded} onChange={() => handleCheckboxChange('refunded', 'date_refunded')} style={checkboxStyle} />💰 Geld retour</label>
                      {checkboxes.refunded && <input type="date" value={formData.date_refunded} onChange={(e) => setFormData({...formData, date_refunded: e.target.value})} style={dateInputStyle} />}
                    </div>
                    {(checkboxes.refunded || checkboxes.geld_terug) && (
                      <div style={checkboxWrapperStyle}>
                        <label style={checkboxContainerStyle}><input type="checkbox" checked={checkboxes.return_processed_admin} onChange={() => handleCheckboxChange('return_processed_admin', 'date_return_processed_admin')} style={checkboxStyle} />✅ Retour verwerkt in admin</label>
                        {checkboxes.return_processed_admin && <input type="date" value={formData.date_return_processed_admin} onChange={(e) => setFormData({...formData, date_return_processed_admin: e.target.value})} style={dateInputStyle} />}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '20px', marginTop: '30px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => window.location.href='/orders'} style={{ ...buttonStyles.base, ...buttonStyles.cancel }} disabled={isLoading}>
                Annuleren
              </button>
              <button type="submit" style={{ ...buttonStyles.base, ...buttonStyles.save }} disabled={isLoading}>
                {isLoading ? 'Opslaan...' : '💾 Toevoegen'}
              </button>
            </div>
          </div>
        </form>

        {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
        {message && <p style={{ color: 'green', marginTop: '15px' }}>{message}</p>}
      </div>
    </div>
  );
};

export default AddOrder;