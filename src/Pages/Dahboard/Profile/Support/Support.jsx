import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../../context/UserContext';
import apiClient from '../../../../api/apiClient';
import CustomTable from '../../CustomTable/CustomTable';
import './Support.css';

const Support = () => {
  const navigate = useNavigate();
  const { user, userData, refreshData } = useUser();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ subject: '', ticketType: '', messege: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeFilter] = useState('widthdraw');
  const pageSize = 10;
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const getRegNo = () => userData?.regno || user?.Regno || user?.regno || sessionStorage.getItem('regno') || '1';
  const getLoginId = () => {
    if (userData?.me) return userData.me;
    if (user?.loginid) return user.loginid;
    const stored = sessionStorage.getItem('userData');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.me) return parsed.me;
        if (parsed.loginid) return parsed.loginid;
      } catch {}
    }
    return 'india';
  };

  const showToastMsg = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'numeric', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
      });
    } catch { return dateString; }
  };

  const fetchTickets = async (page = 1) => {
    const regNo = getRegNo();
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/Dashboard/ticket-list', {
        params: { PageIndex: page, PageSize: pageSize, RegNo: regNo, PaymentMode: activeFilter }
      });
      const data = response.data;
      if (data?.success && data?.data?.data) {
        const formatted = data.data.data.map(item => {
          const messageText = item.Message || item.Msg || item.MsgText || item.Description || item.messege || item.text || 'No message provided';
          // ✅ Mapping for all ticket types
          const typeMap = {
            'withdraw': 'Withdrawal',
            'income': 'Income',
            'deposit': 'Deposit',
            'purchase_bot': 'Purchase BOT',
            'profile': 'Profile',
            'other': 'Other'
          };
          return {
            id: item.MsgId,
            ticketId: `FX${item.MsgId}`,
            date: formatDate(item.MsgDate),
            type: typeMap[item.MsgType] || item.MsgType || 'N/A',
            subject: item.MsgSubject || 'VIEW',
            message: messageText
          };
        });
        setTickets(formatted);
        setTotalRecords(data.data.recordCount || 0);
      } else {
        setTickets([]);
        setTotalRecords(0);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      showToastMsg(msg, 'error');
      setTickets([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(pageIndex); }, [pageIndex]);

  const createTicket = async (ticketData) => {
    const loginId = getLoginId();
    const regNo = getRegNo();
    setSubmitting(true);
    try {
      const formDataPayload = new FormData();
      formDataPayload.append('From', regNo);
      formDataPayload.append('Subject', ticketData.subject);
      // ✅ Send the exact selected type (backend expects: withdraw, income, deposit, purchase_bot, profile, other)
      let messageType = ticketData.ticketType;
      if (messageType === 'withdrawal') messageType = 'withdraw'; // as per backend
      formDataPayload.append('MessageType', messageType);
      formDataPayload.append('LoginId', loginId);
      formDataPayload.append('Message', ticketData.messege || '');
      if (selectedImage) formDataPayload.append('TicketImgage', selectedImage);

      const response = await apiClient.post('/Dashboard/create-ticket', formDataPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data?.success || response.data?.data?.success) {
        await fetchTickets(pageIndex);
        if (refreshData) refreshData();
        setShowModal(false);
        setFormData({ subject: '', ticketType: '', messege: '' });
        setSelectedImage(null);
        showToastMsg('✅ Ticket created successfully!', 'success');
      } else {
        throw new Error(response.data?.message || 'Failed to create ticket');
      }
    } catch (err) {
      showToastMsg(`❌ ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.ticketType) return showToastMsg('Please select ticket type', 'error');
    if (!formData.subject.trim()) return showToastMsg('Please enter subject', 'error');
    createTicket(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files?.[0]) {
      setSelectedImage(e.target.files[0]);
      showToastMsg(`Image selected: ${e.target.files[0].name}`, 'success');
    }
  };

  const handleViewTicket = (ticket) => {
    navigate(`/dashboard/supporthelp/${ticket.id}`, { state: { ticket } });
  };

  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  const getPagination = () => {
    if (totalRecords === 0 || totalPages === 1) return [1];
    const pages = [1];
    let start = Math.max(2, pageIndex - 1);
    let end = Math.min(totalPages - 1, pageIndex + 1);
    for (let i = start; i <= end; i++) if (!pages.includes(i)) pages.push(i);
    if (end < totalPages - 1) pages.push('...');
    if (!pages.includes(totalPages)) pages.push(totalPages);
    return pages;
  };

  const goToPreviousPage = () => { if (pageIndex > 1 && totalRecords > 0) setPageIndex(pageIndex - 1); };
  const goToNextPage = () => { if (pageIndex < totalPages && totalRecords > 0) setPageIndex(pageIndex + 1); };

  useEffect(() => { fetchTickets(1); }, []);

  return (
    <div className="downline-main-wrapper support-container mb-5">
      {toast.show && <div className={`toast-notification ${toast.type}`}><span className="toast-message">{toast.message}</span></div>}
      {error && <div className="error-message" style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}
      <div className="support-header">
        <div><h1 className="support-title">Ticket List</h1>{totalRecords > 0 && <p className="Total-Tickets">Total Tickets: {totalRecords}</p>}</div>
        <button className="create-ticket-btn" onClick={() => setShowModal(true)}>Create New Ticket</button>
      </div>

      <CustomTable columns={["S.NO.", "DATE", "TICKET ID", "TICKET TYPE", "SUBJECT"]} loading={loading} emptyMessage="No tickets found. Create your first ticket!">
        {tickets.map((ticket, index) => {
          const serialNo = (pageIndex - 1) * pageSize + index + 1;
          const formattedNo = serialNo.toString().padStart(2, '0');
          return (
            <tr key={ticket.id}>
              <td className="text-center"><div className="sr-no-circle mx-auto">{formattedNo}</div></td>
              <td>{ticket.date}</td>
              <td className="ticket-id">{ticket.ticketId}</td>
              <td><span className={`ticket-type ${ticket.type?.toLowerCase()}`}>{ticket.type}</span></td>
              <td><button className="capital-payout-btn" onClick={() => handleViewTicket(ticket)}>VIEW All</button></td>
            </tr>
          );
        })}
      </CustomTable>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-3 mb-3 flex-wrap gap-2 gap-md-3">
          <button onClick={goToPreviousPage} disabled={pageIndex === 1} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "clamp(28px, 6vw, 38px)", height: "clamp(28px, 6vw, 38px)", borderRadius: "50%", fontSize: "clamp(13px, 4vw, 16px)", fontWeight: "600", cursor: pageIndex === 1 ? "not-allowed" : "pointer", transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)", background: "white", color: pageIndex === 1 ? "#ccc" : "#667eea", boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)", border: "1px solid rgba(102, 126, 234, 0.2)", opacity: pageIndex === 1 ? 0.5 : 1 }}>←</button>
          {getPagination().map((page, i) => (
            <button key={i} disabled={page === '...'} onClick={() => page !== '...' && setPageIndex(page)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "clamp(28px, 6vw, 38px)", height: "clamp(28px, 6vw, 38px)", borderRadius: "50%", fontSize: "12px", fontWeight: pageIndex === page ? "700" : "500", cursor: page === '...' ? "default" : "pointer", transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)", background: pageIndex === page ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "white", color: pageIndex === page ? "#fff" : "#667eea", boxShadow: pageIndex === page ? "0 8px 20px rgba(102, 126, 234, 0.3), 0 2px 4px rgba(0,0,0,0.1)" : "0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)", border: page === '...' ? "none" : (pageIndex === page ? "none" : "1px solid rgba(102, 126, 234, 0.2)"), opacity: page === '...' ? 0.7 : 1 }}>{page}</button>
          ))}
          <button onClick={goToNextPage} disabled={pageIndex === totalPages} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "clamp(28px, 6vw, 38px)", height: "clamp(28px, 6vw, 38px)", borderRadius: "50%", fontSize: "clamp(13px, 4vw, 16px)", fontWeight: "600", cursor: pageIndex === totalPages ? "not-allowed" : "pointer", transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)", background: "white", color: pageIndex === totalPages ? "#ccc" : "#667eea", boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)", border: "1px solid rgba(102, 126, 234, 0.2)", opacity: pageIndex === totalPages ? 0.5 : 1 }}>→</button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay01">
          <div className="modal-content01">
            <div className="modal-header01"><h2>Create New Ticket</h2><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <form className="modal-middle" onSubmit={handleSubmit} style={{padding: "10px"}}>
              <div className="form-group01"><label className='label01'>Ticket Type *</label>
                <select name="ticketType" value={formData.ticketType} onChange={handleInputChange} required>
                  <option value="">-- Select Message Type --</option>
                  <option value="income">Income</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="deposit">Deposit</option>
                  <option value="purchase_bot">Purchase BOT</option>
                  <option value="profile">Profile</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group"><label>Subject *</label><input type="text" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="Enter ticket subject" required /></div>
              <div className="form-group"><label>Message *</label><textarea name="messege" value={formData.messege} onChange={handleInputChange} placeholder="Enter detailed message" rows="4" /></div>
              <div className="form-group"><label>Attachment (Optional)</label><input type="file" onChange={handleImageChange} accept="image/*" />{selectedImage && <p style={{ fontSize: '12px', marginTop: '5px' }}>Selected: {selectedImage.name}</p>}</div>
              <div className="modal-buttons"><button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="submit-btn01" disabled={submitting}>{submitting ? 'Creating...' : 'Create Ticket'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;