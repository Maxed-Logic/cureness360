import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../../context/UserContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import './CapitalPayout.css';

const CapAgreeModel = ({ onClose }) => {
  const { userData } = useUser();
  const formRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerId: '',
    address: '',
    contact: '',
    pan: '',
    effectiveDate: '2026-01-01',
    acknowledged: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userData) {
      console.log(' userData:', userData);
      setFormData(prev => ({
        ...prev,
        customerName: userData.Name || userData.name || '',
        customerId: userData.me || '',
        address: userData.Address,
        contact: userData.email || '',
        pan: userData.PAN || userData.pan || ''
      }));
    }
  }, [userData]);

  //  FIXED PDF GENERATION
  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      console.log('📄 Starting PDF Generation...');

      const element = formRef.current;
      if (!element) {
        throw new Error('Form element not found');
      }

      // Store original styles
      const originalStyles = {
        display: element.style.display,
        visibility: element.style.visibility,
        opacity: element.style.opacity,
        position: element.style.position,
        zIndex: element.style.zIndex,
        height: element.style.height,
        overflow: element.style.overflow
      };

      // Force visibility
      element.style.display = 'block';
      element.style.visibility = 'visible';
      element.style.opacity = '1';
      element.style.position = 'relative';
      element.style.zIndex = '999999';
      element.style.background = '#ffffff';
      element.style.padding = '40px';
      element.style.width = '100%';
      element.style.maxWidth = '900px';
      element.style.margin = '0 auto';
      element.style.minHeight = '800px';
      element.style.overflow = 'visible';
      element.style.height = 'auto';

      // Make all children visible
      const allElements = element.querySelectorAll('*');
      allElements.forEach(el => {
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        el.style.display = el.tagName === 'DIV' ? 'block' : el.style.display;
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      const canvas = await html2canvas(element, {
        scale: 2, //  Reduced scale to reduce file size
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth || 900,
        windowHeight: element.scrollHeight || 1200,
        width: element.scrollWidth || 900,
        height: element.scrollHeight || 1200,
        x: 0,
        y: 0,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('cam-form-wrapper');
          if (clonedElement) {
            clonedElement.style.display = 'block';
            clonedElement.style.visibility = 'visible';
            clonedElement.style.opacity = '1';
            clonedElement.style.background = '#ffffff';
            // clonedElement.style.padding = '40px';
            clonedElement.style.minHeight = '800px';
          }
        }
      });

      // Restore original styles
      element.style.display = originalStyles.display || '';
      element.style.visibility = originalStyles.visibility || '';
      element.style.opacity = originalStyles.opacity || '';
      element.style.position = originalStyles.position || '';
      element.style.zIndex = originalStyles.zIndex || '';
      element.style.height = originalStyles.height || '';
      element.style.overflow = originalStyles.overflow || '';

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas is empty');
      }

      console.log(' Canvas size:', canvas.width, 'x', canvas.height);

      const imgData = canvas.toDataURL('image/png');
      console.log('📄 Image Data Length:', imgData.length);

      if (imgData.length < 1000) {
        throw new Error('Image data is too small');
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      if (pdfHeight > pdf.internal.pageSize.getHeight()) {
        const pageHeight = pdf.internal.pageSize.getHeight();
        let heightLeft = pdfHeight - pageHeight;
        let position = pageHeight;
        
        while (heightLeft > 0) {
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position * -1, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
          position += pageHeight;
        }
      }

      //  FIXED: Get PDF as data URI string
      const pdfDataUri = pdf.output('datauristring');
      console.log('📄 PDF Data URI Length:', pdfDataUri.length);
      
      if (!pdfDataUri || pdfDataUri.length < 5000) {
        throw new Error('PDF is empty or too small');
      }

      console.log(' PDF Generated Successfully!');
      setIsGenerating(false);
      
      //  Return the data URI
      return pdfDataUri;

    } catch (error) {
      console.error('❌ PDF Generation Error:', error);
      setIsGenerating(false);
      throw error;
    }
  };

  //  FIXED SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('📤 Submit clicked');
    console.log('📤 formData:', formData);

    if (!formData.acknowledged) {
      toast.warning('Please acknowledge the notice');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contact)) {
      toast.error('Invalid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      //  Generate PDF - returns data URI
      const pdfDataUri = await generatePDF();
      
      console.log('📄 PDF Data URI received, length:', pdfDataUri?.length);
      
      if (!pdfDataUri || pdfDataUri.length < 5000) {
        throw new Error('PDF generation failed - empty PDF');
      }

      //  Extract base64 from data URI
      let base64Data = pdfDataUri;
      
      //  Remove data:application/pdf;base64, prefix if present
      if (pdfDataUri.includes('base64,')) {
        base64Data = pdfDataUri.split(',')[1];
        console.log('📄 Extracted base64 from data URI');
      } else if (pdfDataUri.includes(';base64,')) {
        base64Data = pdfDataUri.split(';base64,')[1];
        console.log('📄 Extracted base64 from data URI (alt format)');
      }
      
      console.log('📄 Base64 length after extraction:', base64Data?.length);
      
      //  Check if base64 is valid
      if (!base64Data || base64Data.length < 5000) {
        throw new Error('Invalid base64 data');
      }

      //  Debug - print first few chars
      console.log('📄 Base64 start:', base64Data.substring(0, 50));
      console.log('📄 Base64 end:', base64Data.substring(base64Data.length - 50));
      console.log('📄 Base64 size in MB:', (base64Data.length / 1024 / 1024).toFixed(2));


      //  Send to backend
      const response = await axios.post('http://localhost:5008/send-email', {
        pdfBase64: base64Data, //  Send pure base64
        customerEmail: formData.contact,
        customerName: formData.customerName,
        customerId: formData.customerId,
        effectiveDate: formData.effectiveDate.split('-').reverse().join('/')
      });

      console.log(' Response:', response.data);

      if (response.data && response.data.success) {
        toast.success('PDF sent to your email!');
        
        setTimeout(() => {
          if (onClose) onClose();
        }, 3000);
      } else {
        throw new Error(response.data.message || 'Submission failed');
      }

    } catch (error) {
      console.error('❌ Submit Error:', error);
      
      let errorMessage = error.message || 'Failed to submit. Please try again.';
      
      if (error.response) {
        console.error('Error Response:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error('❌ ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cam-container" style={{ zIndex: '999999', position: 'relative' }}>
      <ToastContainer position="top-right" autoClose={5000} />
      
      <div 
        id="cam-form-wrapper"
        ref={formRef} 
        className="cam-form-wrapper" 
        style={{ 
          background: '#ffffff',
          width: '100%',
          maxWidth: '900px',
          margin: '0 auto',
          position: 'relative',

          // display: 'block',
          visibility: 'visible',
          opacity: '1',
          minHeight: '800px',
          overflow: 'visible'
        }}
      >
        {/* PDF Content */}
        <div className="cam-document-title" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#124257' }}>
            Customer Continuation, Settlement & Exit
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#124257' }}>
            Acknowledgement Agreement
          </div>
        </div>

        <h6 className='mt-4' style={{ marginTop: '20px', marginBottom: '10px', fontWeight: 'bold' }}>Between</h6>
        <p style={{ marginBottom: '15px', fontSize: '14px', lineHeight: '1.6' }}>
          <strong style={{ color: '#1a6b8a' }}>Cureness</strong> a company duly incorporated and existing under the applicable laws of India, having its registered office at Ranchi, Jharkhand hereinafter referred to as the <strong>“Company”</strong>
        </p>

        <div className="cam-company-customer-grid">
          <div className="cam-customer-box" style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>AND</p>

            
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ width: '120px', fontWeight: 'bold' }}>Customer / Member:</span>
                <span style={{color: "green"}}>{formData.customerName || '______________________'}</span>
              </div>
              <div style={{ display: 'flex', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ width: '120px', fontWeight: 'bold' }}>Customer ID:</span>
                <span style={{color: "green"}}>{formData.customerId || '______________________'}</span>
              </div>
              <div style={{ display: 'flex', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ width: '120px', fontWeight: 'bold' }}>Address:</span>
                <span>{formData.address || '______________________'}</span>
              </div>
              <div style={{ display: 'flex', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ width: '120px', fontWeight: 'bold' }}>Email:</span>
                <span style={{color: "green"}}> {formData.contact || '______________________'}</span>
              </div>
              <div style={{ display: 'flex', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ width: '120px', fontWeight: 'bold' }}>PAN:</span>
                <span>{formData.pan || '______________________'}</span>
              </div>
            </div>

            <p style={{ marginTop: '10px', fontSize: '14px' }}>hereinafter referred to as the <strong>“Customer”</strong>.</p>
            
            <div className="cam-date-label" style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="cam-date-label-text" style={{ fontWeight: 'bold' }}>Effective Date:</span>
              <span className="cam-date-box0" style={{ fontWeight: '500', color: '#124257' }}>
                {formData.effectiveDate ? formData.effectiveDate.split('-').reverse().join('/') : '___ / ___ / 2026'}
              </span>
            </div>
          </div>
        </div>

        <hr className="cam-divider-light" style={{ margin: '20px 0', border: '1px solid #ddd' }} />

        <div className="cam-notice-card" style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 className="cam-notice-heading" style={{ color: '#124257', fontWeight: 'bold' }}>IMPORTANT CUSTOMER NOTICE</h3>
          <p className="cam-notice-dear"><strong>Dear Customer,</strong></p>
          <p className="cam-notice-text">We sincerely regret that you are considering discontinuing your association with us.</p>
          <p className="cam-notice-text">Over the past several months, the Company and its management have made substantial efforts to develop a transparent, structured and sustainable healthcare-focused business ecosystem and to provide operational and commercial support to customers and associated teams.</p>
          <p className="cam-notice-text">The Company has also faced substantial financial pressure arising from support arrangements, operational commitments, business expansion and settlement obligations. Based on the Company's internal records and management assessment, substantial financial resources have been deployed in support of certain teams and their business operations.</p>
          <p className="cam-notice-text">The Company understands that individual customers may have different financial circumstances and may independently decide whether to continue or discontinue their association with the Company.</p>
        </div>

        <div className="cam-form-section">
          <form onSubmit={handleSubmit}>
            <div className="cam-acknowledgement-check" style={{ marginBottom: '20px' }}>
              <input
                type="checkbox"
                id="camAckCheck"
                name="acknowledged"
                checked={formData.acknowledged}
                onChange={(e) => setFormData(prev => ({ ...prev, acknowledged: e.target.checked }))}
                className="cam-ack-checkbox"
                style={{ marginRight: '10px' }}
              />
              <label htmlFor="camAckCheck" className="cam-ack-label">
                I acknowledge that I have read and understood the Customer Notice and the terms of this agreement.
              </label>
            </div>
            <div className="cam-signature-area" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div className="cam-signature-item" style={{ width: '45%' }}>
                <label className="cam-sig-label" style={{ fontWeight: 'bold' }}>Customer Signature</label>
                <div className="cam-sig-line" style={{ borderBottom: '2px solid #000', padding: '10px 0', marginTop: '5px' }}>
                  {formData.customerName || '______________________'}
                </div>
              </div>
            </div>

            <div className="cam-submit-row">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting || isGenerating}
              >
                {isSubmitting ? 'Sending...' : isGenerating ? 'Generating PDF...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CapAgreeModel;