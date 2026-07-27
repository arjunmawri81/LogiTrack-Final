// components/LabelSettingsModal.jsx
import { useState, useEffect } from "react";
import {
  FaTimes,
  FaDownload,
  FaUpload,
  FaTrash,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import api from "../services/api";

// Default settings object
const defaultSettings = {
  format: "A6",
  useMerchantLogo: true,
  uploadedLogo: null,
  logoFile: null,
  barcodeType: "AWB",
  logo: true,
  customerPhone: true,
  dimensions: true,
  weight: true,
  paymentType: true,
  invoiceNumber: true,
  invoiceDate: true,
  companyName: true,
  returnAddress: true,
  qrCode: true,
};

const LabelSettingsModal = ({
  open,
  onClose,
  onDownload,
  isBulk = false,
  selectedCount = 0,
}) => {
  const [settings, setSettings] = useState({
    ...defaultSettings,
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploadingPermanentLogo, setIsUploadingPermanentLogo] = useState(false);
  const [permanentLogo, setPermanentLogo] = useState(null);

  // Load merchant user profile logo on mount / open
  useEffect(() => {
    if (open) {
      setSettings({
        ...defaultSettings,
      });
      setIsDownloading(false);
      setIsUploadingPermanentLogo(false);

      // Load user profile logo from localStorage or API
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.logo) {
            setPermanentLogo(parsedUser.logo);
          }
        }
      } catch (e) {
        console.error("Error reading stored user logo", e);
      }
    }
  }, [open]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // 1. Temporary (One-Time) Logo Upload Handler
  const handleTemporaryLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("❌ Only image files are allowed (PNG, JPG, JPEG, SVG, etc.)");
      e.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("❌ Logo must be under 2MB. Please compress your image.");
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSettings(prev => ({
        ...prev,
        uploadedLogo: event.target.result,
        logoFile: file,
        useMerchantLogo: false,
      }));
    };
    reader.onerror = () => {
      alert("❌ Failed to read image file. Please try again.");
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // 2. Permanent Logo Upload Handler (Saves to Merchant Profile)
  const handlePermanentLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("❌ Only image files are allowed (PNG, JPG, JPEG, SVG, etc.)");
      e.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("❌ Logo must be under 2MB. Please compress your image.");
      e.target.value = '';
      return;
    }

    try {
      setIsUploadingPermanentLogo(true);
      const formData = new FormData();
      formData.append("logo", file);

      const response = await api.post("/merchant/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        const updatedLogo = response.data.logo;
        setPermanentLogo(updatedLogo);

        // Update localStorage user object
        const storedUser = localStorage.getItem("user");
        let parsedUser = storedUser ? JSON.parse(storedUser) : {};
        parsedUser.logo = updatedLogo;
        localStorage.setItem("user", JSON.stringify(parsedUser));
        window.dispatchEvent(new Event("userUpdated"));

        // Set modal setting to use merchant logo
        setSettings(prev => ({
          ...prev,
          useMerchantLogo: true,
          uploadedLogo: null,
          logoFile: null,
        }));

        alert("✅ Permanent merchant logo updated successfully!");
      }
    } catch (error) {
      console.error("Permanent logo upload error:", error);
      alert(error.response?.data?.message || "❌ Failed to upload permanent logo.");
    } finally {
      setIsUploadingPermanentLogo(false);
      e.target.value = '';
    }
  };

  const handleRemoveTemporaryLogo = () => {
    setSettings(prev => ({
      ...prev,
      uploadedLogo: null,
      logoFile: null,
      useMerchantLogo: true,
    }));
  };

  // Download handler with safety check
  const handleDownloadClick = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      if (onDownload) {
        await onDownload(settings);
      } else {
        console.error("onDownload callback is not provided");
        alert("❌ Download function not available. Please try again.");
        setIsDownloading(false);
        return;
      }

      if (typeof onClose === "function") {
        onClose();
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("❌ Failed to download. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const Toggle = ({ label, checked, onChange }) => (
    <label style={toggleStyles.container}>
      <span style={toggleStyles.label}>{label}</span>
      <div 
        style={{
          ...toggleStyles.track,
          background: checked ? '#f97316' : '#e2e8f0',
        }}
        onClick={() => onChange(!checked)}
      >
        <div 
          style={{
            ...toggleStyles.thumb,
            transform: checked ? 'translateX(20px)' : 'translateX(0)',
          }}
        />
      </div>
    </label>
  );

  const Checkbox = ({ label, checked, onChange }) => (
    <label style={checkboxStyles.container}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={checkboxStyles.input}
      />
      <span style={checkboxStyles.label}>{label}</span>
    </label>
  );

  if (!open) return null;

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyles.container}>
          <h3 style={headerStyles.title}>
            {isBulk ? `Download Labels (${selectedCount} Orders)` : 'Download Label'}
          </h3>
          <button 
            onClick={onClose}
            style={headerStyles.closeButton}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            disabled={isDownloading}
          >
            <FaTimes size={18} />
          </button>
        </div>

        <div style={bodyStyles.container}>
          {/* Label Format */}
          <div style={sectionStyles.container}>
            <h4 style={sectionStyles.title}>Label Format</h4>
            <div style={sectionStyles.options}>
              {[
                { value: 'A6', label: 'Standard (A6)' },
                { value: 'A4_2', label: '2 In One' },
                { value: 'A4_4', label: '4 In One' },
                { value: 'THERMAL', label: 'Thermal' },
              ].map((option) => (
                <label key={option.value} style={radioStyles.container}>
                  <input
                    type="radio"
                    name="format"
                    value={option.value}
                    checked={settings.format === option.value}
                    onChange={(e) => handleSettingChange('format', e.target.value)}
                    style={radioStyles.input}
                  />
                  <span style={radioStyles.label}>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Logo Options Section */}
          <div style={sectionStyles.container}>
            <h4 style={sectionStyles.title}>Logo Options</h4>
            <div style={logoStyles.container}>
              {/* Toggle Use Merchant Logo */}
              <div style={{ marginBottom: '8px' }}>
                <Toggle
                  label="Use Merchant Saved Logo"
                  checked={settings.useMerchantLogo}
                  onChange={(val) => handleSettingChange('useMerchantLogo', val)}
                />
              </div>

              {/* Upload Buttons Box */}
              <div style={logoStyles.dualUploadContainer}>
                {/* Temporary Logo */}
                <div style={logoStyles.uploadBox}>
                  <span style={logoStyles.boxTitle}>One-Time Custom Logo</span>
                  <p style={logoStyles.boxDesc}>Used only for this label download session</p>
                  <label style={logoStyles.uploadButton}>
                    <FaUpload size={13} style={{ marginRight: '6px' }} />
                    Upload Custom Logo
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      hidden
                      onChange={handleTemporaryLogoUpload}
                      disabled={isDownloading || isUploadingPermanentLogo}
                    />
                  </label>

                  {settings.uploadedLogo && (
                    <div style={logoStyles.previewContainer}>
                      <div style={logoStyles.badge}>One-Time</div>
                      <img 
                        src={settings.uploadedLogo} 
                        alt="Temporary custom logo"
                        style={logoStyles.preview}
                      />
                      <button
                        onClick={handleRemoveTemporaryLogo}
                        style={logoStyles.removeButton}
                        disabled={isDownloading}
                        title="Remove custom logo"
                      >
                        <FaTrash size={10} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Permanent Logo */}
                <div style={logoStyles.uploadBox}>
                  <span style={logoStyles.boxTitle}>Permanent Merchant Logo</span>
                  <p style={logoStyles.boxDesc}>Saves to your account for all future labels</p>
                  <label style={{
                    ...logoStyles.uploadButton,
                    background: '#fff7ed',
                    color: '#c2410c',
                    borderColor: '#ffedd5',
                  }}>
                    {isUploadingPermanentLogo ? (
                      <FaSpinner size={13} style={{ marginRight: '6px', animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <FaUpload size={13} style={{ marginRight: '6px' }} />
                    )}
                    {isUploadingPermanentLogo ? 'Saving Logo...' : 'Upload Permanent Logo'}
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      hidden
                      onChange={handlePermanentLogoUpload}
                      disabled={isDownloading || isUploadingPermanentLogo}
                    />
                  </label>

                  {permanentLogo && (
                    <div style={logoStyles.previewContainer}>
                      <div style={{ ...logoStyles.badge, background: '#10b981', color: '#fff' }}>
                        <FaCheckCircle size={9} style={{ marginRight: '3px' }} /> Saved Profile Logo
                      </div>
                      <img 
                        src={permanentLogo} 
                        alt="Permanent merchant logo"
                        style={{ ...logoStyles.preview, borderColor: '#10b981' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Barcode Type */}
          <div style={sectionStyles.container}>
            <h4 style={sectionStyles.title}>Barcode Type</h4>
            <div style={sectionStyles.options}>
              {[
                { value: 'AWB', label: 'AWB' },
                { value: 'ORDER_ID', label: 'Order ID' },
                { value: 'REFERENCE_ID', label: 'Reference ID' },
              ].map((option) => (
                <label key={option.value} style={radioStyles.container}>
                  <input
                    type="radio"
                    name="barcodeType"
                    value={option.value}
                    checked={settings.barcodeType === option.value}
                    onChange={(e) => handleSettingChange('barcodeType', e.target.value)}
                    style={radioStyles.input}
                  />
                  <span style={radioStyles.label}>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Show/Hide Components */}
          <div style={sectionStyles.container}>
            <h4 style={sectionStyles.title}>Show / Hide Components</h4>
            <div style={gridStyles.container}>
              <Checkbox
                label="Logo"
                checked={settings.logo}
                onChange={(val) => handleSettingChange('logo', val)}
              />
              <Checkbox
                label="Customer Phone"
                checked={settings.customerPhone}
                onChange={(val) => handleSettingChange('customerPhone', val)}
              />
              <Checkbox
                label="Dimensions"
                checked={settings.dimensions}
                onChange={(val) => handleSettingChange('dimensions', val)}
              />
              <Checkbox
                label="Weight"
                checked={settings.weight}
                onChange={(val) => handleSettingChange('weight', val)}
              />
              <Checkbox
                label="Payment Type"
                checked={settings.paymentType}
                onChange={(val) => handleSettingChange('paymentType', val)}
              />
              <Checkbox
                label="Invoice Number"
                checked={settings.invoiceNumber}
                onChange={(val) => handleSettingChange('invoiceNumber', val)}
              />
              <Checkbox
                label="Invoice Date"
                checked={settings.invoiceDate}
                onChange={(val) => handleSettingChange('invoiceDate', val)}
              />
              <Checkbox
                label="Company Name"
                checked={settings.companyName}
                onChange={(val) => handleSettingChange('companyName', val)}
              />
              <Checkbox
                label="Return Address"
                checked={settings.returnAddress}
                onChange={(val) => handleSettingChange('returnAddress', val)}
              />
              <Checkbox
                label="QR Code"
                checked={settings.qrCode}
                onChange={(val) => handleSettingChange('qrCode', val)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={footerStyles.container}>
          <button
            onClick={onClose}
            style={footerStyles.cancelButton}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
            disabled={isDownloading}
          >
            Cancel
          </button>
          <button
            onClick={handleDownloadClick}
            style={{
              ...footerStyles.downloadButton,
              opacity: isDownloading ? 0.6 : 1,
              cursor: isDownloading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isDownloading) {
                e.currentTarget.style.background = '#ea580c';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDownloading) {
                e.currentTarget.style.background = '#f97316';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
            disabled={isDownloading}
          >
            <FaDownload size={14} style={{ marginRight: '6px' }} />
            {isDownloading ? 'Downloading...' : (isBulk ? 'Download Labels' : 'Download Label')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// STYLES
// ============================================

const modalOverlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContainer = {
  background: '#fff',
  borderRadius: '16px',
  maxWidth: '600px',
  width: '90%',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
};

const headerStyles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    background: '#fff',
    zIndex: 10,
    borderRadius: '16px 16px 0 0',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#0f172a',
    margin: 0,
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

const bodyStyles = {
  container: {
    padding: '24px',
  },
};

const sectionStyles = {
  container: {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #f1f5f9',
  },
  title: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '12px',
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
};

const radioStyles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  input: {
    marginRight: '10px',
    accentColor: '#f97316',
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  label: {
    fontSize: '14px',
    color: '#0f172a',
    cursor: 'pointer',
  },
};

const logoStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  dualUploadContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '12px',
    marginTop: '6px',
  },
  uploadBox: {
    background: '#f8fafc',
    border: '1px dashed #cbd5e1',
    borderRadius: '12px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  boxTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
  },
  boxDesc: {
    fontSize: '11px',
    color: '#64748b',
    margin: 0,
  },
  uploadButton: {
    background: '#ffffff',
    color: '#475569',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    border: '1px solid #cbd5e1',
    marginTop: '4px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  previewContainer: {
    position: 'relative',
    display: 'inline-block',
    marginTop: '8px',
  },
  badge: {
    fontSize: '10px',
    fontWeight: '600',
    background: '#f97316',
    color: '#fff',
    padding: '2px 6px',
    borderRadius: '4px',
    marginBottom: '4px',
    display: 'inline-flex',
    alignItems: 'center',
  },
  preview: {
    width: '64px',
    height: '64px',
    objectFit: 'contain',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '4px',
    background: '#fff',
    display: 'block',
  },
  removeButton: {
    position: 'absolute',
    top: '18px',
    right: '-6px',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    transition: 'all 0.2s',
  },
};

const toggleStyles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#475569',
  },
  track: {
    width: '40px',
    height: '22px',
    borderRadius: '11px',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
    position: 'relative',
    flexShrink: 0,
  },
  thumb: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    transition: 'transform 0.3s ease',
    position: 'absolute',
    top: '2px',
    left: '2px',
  },
};

const checkboxStyles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    padding: '4px 0',
  },
  input: {
    width: '16px',
    height: '16px',
    accentColor: '#f97316',
    cursor: 'pointer',
    flexShrink: 0,
  },
  label: {
    fontSize: '13px',
    color: '#0f172a',
    cursor: 'pointer',
  },
};

const gridStyles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '4px 8px',
  },
};

const footerStyles = {
  container: {
    display: 'flex',
    gap: '12px',
    padding: '16px 24px',
    borderTop: '1px solid #e2e8f0',
    justifyContent: 'flex-end',
    background: '#fafafa',
    borderRadius: '0 0 16px 16px',
  },
  cancelButton: {
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  downloadButton: {
    background: '#f97316',
    color: '#fff',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
  },
};

export default LabelSettingsModal;