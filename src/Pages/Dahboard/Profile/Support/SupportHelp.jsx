import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { FaUpload } from "react-icons/fa";
import apiClient from '../../../../api/apiClient';
import toast from 'react-hot-toast';
import './Support.css';

const SupportHelp = () => {
  const location = useLocation();
  const { id } = useParams();
  const ticket = location.state?.ticket;
  const navigate = useNavigate();

  const getRegNo = () => sessionStorage.getItem('regno');

  const nextIdRef = useRef(1);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    return () => window.removeEventListener('resize', setViewportHeight);
  }, []);

  // ✅ API call – sirf toast dikhayega, bot message return nahi karega
  const sendToSupportApi = async (messageText, imageFile = null, messageType = "general") => {
    const regno = getRegNo();
    if (!regno) {
      toast.error("User registration not found. Please login again.");
      return;
    }
    if (!ticket?.id) {
      toast.error("Ticket ID not found. Please go back and select a ticket.");
      return;
    }
    const formData = new FormData();
    formData.append('From', parseInt(regno));
    formData.append('Subject', ticket?.subject);
    formData.append('MessageType', messageType);
    formData.append('Message', messageText);
    formData.append('MessageId', ticket.id.toString());
    if (imageFile) formData.append('Image', imageFile);

    try {
      const response = await apiClient.post('/Dashboard/support-chat', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data?.success) {
        toast.success("Message sent");   // ✅ sirf toast, bot message nahi
      } else {
        toast.error(response.data?.message || "Failed to send message");
      }
    } catch (err) {
      console.error("API Error:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.title || "Server error. Please try again.";
      toast.error(errorMsg);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || sending) return;

    const userMessageText = inputValue.trim();
    const userMessage = {
      id: nextIdRef.current++,
      text: userMessageText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setSending(true);

    await sendToSupportApi(userMessageText, null, "general");  // ✅ wait but no return
    setSending(false);
    // ❌ Bot message add nahi karenge
  };

  const handleUploadClick = () => fileInputRef.current.click();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload only image files (JPG, PNG, etc.)");
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      event.target.value = '';
      return;
    }

    // Image preview in chat
    const reader = new FileReader();
    reader.onload = () => {
      const imagePreview = reader.result;
      const imageMessage = {
        id: nextIdRef.current++,
        text: "📷 Screenshot attached",
        sender: "user",
        timestamp: new Date(),
        image: imagePreview
      };
      setMessages(prev => [...prev, imageMessage]);
    };
    reader.readAsDataURL(file);

    setSending(true);
    await sendToSupportApi("Screenshot attached", file, "image");
    setSending(false);
    // ❌ Bot message add nahi karenge
    event.target.value = '';
  };

  const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const goBackToTicketList = () => navigate('/dashboard/Support');

  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        <div className="chat-header">
          <div className="d-flex justify-content-between align-items-start">
            <div className="header-title">
              <h2>Message Center</h2>
            </div>
            <div className="official-badge" onClick={goBackToTicketList} style={{ cursor: 'pointer' }}>
              Back To Ticket List
            </div>
          </div>
        </div>

        {!ticket && (
          <div className="ticket-details-panel error" style={{ margin: '16px 20px 0 20px' }}>
            No ticket information available. ID: {id}
          </div>
        )}

        <div className="messages-area">
          {ticket && (
            <div className="message-bubble01">
              <div className="detail-row">
                <span className="detail-label">Subject :</span>
                <span className="detail-value"><strong>{ticket.subject}</strong></span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Message :</span>
                <span className="detail-value"><strong>{ticket.message || ticket.msg || ticket.text || 'No message provided'}</strong></span>
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <div className="message-bubble">
                {msg.image && (
                  <img src={msg.image} alt="screenshot" style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px', marginBottom: '8px' }} />
                )}
                <div className="message-text">{msg.text}</div>
                <div className="message-time">{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="whatsapp-input-container">
            <div className="attachment-icon" onClick={handleUploadClick}>
              <FaUpload />
            </div>
            <input
              type="text"
              placeholder="Type a message..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && !sending && handleSendMessage()}
              className="whatsapp-message-input"
              disabled={sending}
            />
            <button 
              className="whatsapp-send-btn" 
              onClick={handleSendMessage} 
              disabled={sending || !inputValue.trim()}
            >
              {sending ? "..." : "➤"}
            </button>
          </div>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
        </div>
      </div>
    </div>
  );  
};

export default SupportHelp;