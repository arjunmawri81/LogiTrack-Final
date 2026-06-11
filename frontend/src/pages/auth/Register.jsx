import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../services/api";
import { 
  FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, 
  FaBuilding, FaMobile, FaCheckCircle, FaTruck,
  FaShieldAlt, FaHeadset, FaFileInvoice, FaUniversity,
  FaMapMarkerAlt, FaIdCard, FaArrowRight, FaStore,
  FaRegIdCard, FaHandshake, FaClock, FaGlobe
} from "react-icons/fa";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP States
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);
  const [mobileOtpLoading, setMobileOtpLoading] = useState(false);
  
  // KYC States
  const [gstVerified, setGstVerified] = useState(false);
  const [panVerified, setPanVerified] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1: Basic Registration
    companyName: "",
    ownerName: "",
    email: "",
    mobile: "",
    emailOtp: "",
    mobileOtp: "",
    password: "",
    confirmPassword: "",
    
    // Step 2: GST Details
    gstNumber: "",
    panNumber: "",
    businessType: "",
    businessCategory: "",
    yearOfEstablishment: "",
    website: "",
    
    // Step 3: Company Details
    address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    
    // Step 4: KYC & Bank Details
    accountHolderName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
    upiId: "",
    
    // Terms
    agreeTerms: false,
    agreeKYC: false,
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleCheckbox = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
    });
  };

  // Email OTP Functions - Temporarily disabled
  const sendEmailOtp = () => {
    alert("Coming Soon");
  };

  const verifyEmailOtp = () => {
    setEmailVerified(true);
    alert("Email verified successfully!");
  };

  // Mobile OTP Functions - Temporarily disabled
  const sendMobileOtp = () => {
    alert("Coming Soon");
  };

  const verifyMobileOtp = () => {
    setMobileVerified(true);
    alert("Mobile verified successfully!");
  };

  // GST & PAN Verification - Temporarily disabled
  const verifyGST = () => {
    setGstVerified(true);
    alert("GST verified successfully!");
  };

  const verifyPAN = () => {
    setPanVerified(true);
    alert("PAN verified successfully!");
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.companyName) newErrors.companyName = "Company name is required";
    if (!formData.ownerName) newErrors.ownerName = "Owner name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.mobile) newErrors.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Mobile must be 10 digits";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.gstNumber) newErrors.gstNumber = "GST number is required";
    if (!formData.panNumber) newErrors.panNumber = "PAN number is required";
    if (!formData.businessType) newErrors.businessType = "Business type is required";
    if (!formData.businessCategory) newErrors.businessCategory = "Business category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.pincode) newErrors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = "Pincode must be 6 digits";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors = {};
    if (!formData.accountHolderName) newErrors.accountHolderName = "Account holder name is required";
    if (!formData.accountNumber) newErrors.accountNumber = "Account number is required";
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = "Account numbers do not match";
    }
    if (!formData.ifscCode) newErrors.ifscCode = "IFSC code is required";
    if (!formData.bankName) newErrors.bankName = "Bank name is required";
    if (!formData.agreeTerms) newErrors.agreeTerms = "You must agree to Terms & Conditions";
    if (!formData.agreeKYC) newErrors.agreeKYC = "You must agree to KYC verification";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    } else if (currentStep === 3 && validateStep3()) {
      setCurrentStep(4);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep4()) return;

    setLoading(true);

    try {
      await api.post("/auth/register", {
        companyName: formData.companyName,
        name: formData.ownerName,
        phone: formData.mobile,
        email: formData.email,
        password: formData.password,

        gstNumber: formData.gstNumber,
        panNumber: formData.panNumber,
        businessType: formData.businessType,
        businessCategory: formData.businessCategory,
        yearOfEstablishment: formData.yearOfEstablishment,
        website: formData.website,

        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        landmark: formData.landmark,

        accountHolderName: formData.accountHolderName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        bankName: formData.bankName,
        branchName: formData.branchName,
        upiId: formData.upiId,

        role: "MERCHANT",
        kycStatus: "PENDING",
      });

      alert("Registration Successful. Please Login.");

      navigate("/login");
    } catch (error) {
      alert(error?.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  const businessTypes = ["Proprietorship", "Partnership", "Private Limited", "Public Limited", "LLP", "Trust", "Society"];
  const businessCategories = ["Logistics", "E-commerce", "Manufacturing", "Trading", "Services", "Others"];
  const states = ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "Uttar Pradesh", "West Bengal", "Rajasthan", "Punjab", "Haryana"];

  const styles = {
    container: { display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)" },
    leftSection: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 27, 75, 0.95))" },
    brandContent: { maxWidth: "500px" },
    brandLogo: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" },
    logoIcon: { fontSize: "48px" },
    brandTitle: { fontSize: "42px", fontWeight: "800", color: "white", margin: 0 },
    brandSpan: { color: "#f97316" },
    brandTagline: { fontSize: "18px", color: "#94a3b8", marginBottom: "40px" },
    features: { display: "flex", flexDirection: "column", gap: "24px", marginBottom: "50px" },
    feature: { display: "flex", alignItems: "center", gap: "16px" },
    featureIcon: { fontSize: "28px", color: "#f97316", background: "rgba(249, 115, 22, 0.1)", padding: "12px", borderRadius: "12px" },
    featureTitle: { fontSize: "16px", fontWeight: "600", color: "white", margin: "0 0 4px 0" },
    featureDesc: { fontSize: "13px", color: "#94a3b8", margin: 0 },
    stats: { display: "flex", gap: "40px", paddingTop: "30px", borderTop: "1px solid rgba(255, 255, 255, 0.1)" },
    statValue: { fontSize: "28px", fontWeight: "800", color: "#f97316", margin: "0 0 4px 0" },
    statLabel: { fontSize: "12px", color: "#94a3b8", margin: 0 },
    rightSection: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "white", padding: "40px", overflowY: "auto", maxHeight: "100vh" },
    formWrapper: { maxWidth: "550px", width: "100%" },
    formHeader: { textAlign: "center", marginBottom: "30px" },
    formTitle: { fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px 0" },
    formSubtitle: { fontSize: "14px", color: "#64748b", margin: 0 },
    progressBar: { display: "flex", gap: "8px", marginBottom: "30px", justifyContent: "center" },
    progressStep: (active) => ({ width: "70px", height: "4px", borderRadius: "2px", background: active ? "#f97316" : "#e2e8f0", transition: "all 0.3s" }),
    form: { display: "flex", flexDirection: "column", gap: "16px" },
    row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
    inputGroup: { position: "relative", display: "flex", alignItems: "center" },
    inputIcon: { position: "absolute", left: "16px", color: "#94a3b8", fontSize: "16px" },
    input: { width: "100%", padding: "14px 16px 14px 48px", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "14px", background: "#f8fafc", outline: "none" },
    select: { width: "100%", padding: "14px 16px 14px 48px", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "14px", background: "#f8fafc", outline: "none" },
    passwordToggle: { position: "absolute", right: "16px", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" },
    otpGroup: { display: "flex", gap: "12px", alignItems: "center" },
    otpInput: { flex: 1 },
    otpBtn: { padding: "14px 20px", background: "#f1f5f9", border: "none", borderRadius: "12px", cursor: "pointer", fontSize: "13px", fontWeight: "500", whiteSpace: "nowrap" },
    verifyBtn: { padding: "14px 20px", background: "#f97316", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontSize: "13px", fontWeight: "500", whiteSpace: "nowrap" },
    verifiedBadge: { position: "absolute", right: "16px", color: "#10b981" },
    errorText: { fontSize: "11px", color: "#ef4444", marginTop: "4px", marginLeft: "12px" },
    checkboxGroup: { display: "flex", alignItems: "center", gap: "12px", marginTop: "10px" },
    checkbox: { width: "18px", height: "18px", cursor: "pointer", accentColor: "#f97316" },
    buttonGroup: { display: "flex", gap: "12px", marginTop: "20px" },
    nextBtn: { flex: 1, padding: "14px", background: "linear-gradient(135deg, #f97316, #ea580c)", border: "none", borderRadius: "12px", color: "white", fontSize: "16px", fontWeight: "600", cursor: "pointer" },
    backBtn: { padding: "14px 24px", background: "#f1f5f9", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "600", cursor: "pointer" },
    submitBtn: { flex: 1, padding: "14px", background: "linear-gradient(135deg, #f97316, #ea580c)", border: "none", borderRadius: "12px", color: "white", fontSize: "16px", fontWeight: "600", cursor: "pointer" },
    formFooter: { textAlign: "center", marginTop: "25px" },
    footerText: { fontSize: "14px", color: "#64748b" },
    footerLink: { color: "#f97316", textDecoration: "none", fontWeight: "600" },
    spinner: { display: "inline-block", width: "20px", height: "20px", border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" },
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftSection}>
        <div style={styles.brandContent}>
          <div style={styles.brandLogo}>
            <span style={styles.logoIcon}>📦</span>
            <h1 style={styles.brandTitle}>Logi<span style={styles.brandSpan}>Track</span></h1>
          </div>
          <p style={styles.brandTagline}>India's Most Trusted Logistics Platform</p>
          <div style={styles.features}>
            <div style={styles.feature}><FaTruck style={styles.featureIcon} /><div><h4 style={styles.featureTitle}>Real-time Tracking</h4><p style={styles.featureDesc}>Track your shipments instantly</p></div></div>
            <div style={styles.feature}><FaShieldAlt style={styles.featureIcon} /><div><h4 style={styles.featureTitle}>Secure Delivery</h4><p style={styles.featureDesc}>100% insured shipments</p></div></div>
            <div style={styles.feature}><FaHeadset style={styles.featureIcon} /><div><h4 style={styles.featureTitle}>24/7 Support</h4><p style={styles.featureDesc}>Dedicated customer care</p></div></div>
          </div>
          <div style={styles.stats}>
            <div><h3 style={styles.statValue}>1M+</h3><p style={styles.statLabel}>Happy Customers</p></div>
            <div><h3 style={styles.statValue}>50K+</h3><p style={styles.statLabel}>Daily Shipments</p></div>
            <div><h3 style={styles.statValue}>99.9%</h3><p style={styles.statLabel}>On-time Delivery</p></div>
          </div>
        </div>
      </div>

      <div style={styles.rightSection}>
        <div style={styles.formWrapper}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create Account</h2>
            <p style={styles.formSubtitle}>Register your company</p>
          </div>

          <div style={styles.progressBar}>
            <div style={styles.progressStep(currentStep >= 1)}></div>
            <div style={styles.progressStep(currentStep >= 2)}></div>
            <div style={styles.progressStep(currentStep >= 3)}></div>
            <div style={styles.progressStep(currentStep >= 4)}></div>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {currentStep === 1 && (
              <>
                <div style={styles.inputGroup}>
                  <FaBuilding style={styles.inputIcon} />
                  <input type="text" name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleChange} style={styles.input} />
                </div>
                {errors.companyName && <span style={styles.errorText}>{errors.companyName}</span>}

                <div style={styles.inputGroup}>
                  <FaUser style={styles.inputIcon} />
                  <input type="text" name="ownerName" placeholder="Owner Name" value={formData.ownerName} onChange={handleChange} style={styles.input} />
                </div>
                {errors.ownerName && <span style={styles.errorText}>{errors.ownerName}</span>}

                <div style={styles.otpGroup}>
                  <div style={{ ...styles.inputGroup, ...styles.otpInput }}>
                    <FaEnvelope style={styles.inputIcon} />
                    <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} style={styles.input} disabled={emailVerified} />
                    {emailVerified && <FaCheckCircle style={styles.verifiedBadge} />}
                  </div>
                  <button type="button" style={styles.otpBtn} onClick={sendEmailOtp} disabled={emailVerified}>
                    {emailVerified ? "Verified" : "Send OTP"}
                  </button>
                </div>
                {errors.email && <span style={styles.errorText}>{errors.email}</span>}

                {emailOtpSent && !emailVerified && (
                  <div style={styles.otpGroup}>
                    <div style={{ ...styles.inputGroup, ...styles.otpInput }}>
                      <FaClock style={styles.inputIcon} />
                      <input type="text" name="emailOtp" placeholder="Enter Email OTP" value={formData.emailOtp} onChange={handleChange} style={styles.input} />
                    </div>
                    <button type="button" style={styles.verifyBtn} onClick={verifyEmailOtp}>Verify</button>
                  </div>
                )}

                <div style={styles.otpGroup}>
                  <div style={{ ...styles.inputGroup, ...styles.otpInput }}>
                    <FaMobile style={styles.inputIcon} />
                    <input type="tel" name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} style={styles.input} disabled={mobileVerified} />
                    {mobileVerified && <FaCheckCircle style={styles.verifiedBadge} />}
                  </div>
                  <button type="button" style={styles.otpBtn} onClick={sendMobileOtp} disabled={mobileVerified}>
                    {mobileVerified ? "Verified" : "Send OTP"}
                  </button>
                </div>
                {errors.mobile && <span style={styles.errorText}>{errors.mobile}</span>}

                {mobileOtpSent && !mobileVerified && (
                  <div style={styles.otpGroup}>
                    <div style={{ ...styles.inputGroup, ...styles.otpInput }}>
                      <FaClock style={styles.inputIcon} />
                      <input type="text" name="mobileOtp" placeholder="Enter Mobile OTP" value={formData.mobileOtp} onChange={handleChange} style={styles.input} />
                    </div>
                    <button type="button" style={styles.verifyBtn} onClick={verifyMobileOtp}>Verify</button>
                  </div>
                )}

                <div style={styles.inputGroup}>
                  <FaLock style={styles.inputIcon} />
                  <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={formData.password} onChange={handleChange} style={styles.input} />
                  <button type="button" style={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <span style={styles.errorText}>{errors.password}</span>}

                <div style={styles.inputGroup}>
                  <FaLock style={styles.inputIcon} />
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} style={styles.input} />
                  <button type="button" style={styles.passwordToggle} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && <span style={styles.errorText}>{errors.confirmPassword}</span>}
              </>
            )}

            {currentStep === 2 && (
              <>
                <div style={styles.otpGroup}>
                  <div style={{ ...styles.inputGroup, ...styles.otpInput }}>
                    <FaFileInvoice style={styles.inputIcon} />
                    <input type="text" name="gstNumber" placeholder="GST Number (15 digits)" value={formData.gstNumber} onChange={handleChange} style={styles.input} disabled={gstVerified} />
                    {gstVerified && <FaCheckCircle style={styles.verifiedBadge} />}
                  </div>
                  <button type="button" style={styles.verifyBtn} onClick={verifyGST} disabled={gstVerified}>Verify GST</button>
                </div>
                {errors.gstNumber && <span style={styles.errorText}>{errors.gstNumber}</span>}

                <div style={styles.otpGroup}>
                  <div style={{ ...styles.inputGroup, ...styles.otpInput }}>
                    <FaRegIdCard style={styles.inputIcon} />
                    <input type="text" name="panNumber" placeholder="PAN Number (10 digits)" value={formData.panNumber} onChange={handleChange} style={styles.input} disabled={panVerified} />
                    {panVerified && <FaCheckCircle style={styles.verifiedBadge} />}
                  </div>
                  <button type="button" style={styles.verifyBtn} onClick={verifyPAN} disabled={panVerified}>Verify PAN</button>
                </div>
                {errors.panNumber && <span style={styles.errorText}>{errors.panNumber}</span>}

                <div style={styles.inputGroup}>
                  <FaHandshake style={styles.inputIcon} />
                  <select name="businessType" value={formData.businessType} onChange={handleChange} style={styles.select}>
                    <option value="">Select Business Type</option>
                    {businessTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                {errors.businessType && <span style={styles.errorText}>{errors.businessType}</span>}

                <div style={styles.inputGroup}>
                  <FaStore style={styles.inputIcon} />
                  <select name="businessCategory" value={formData.businessCategory} onChange={handleChange} style={styles.select}>
                    <option value="">Select Business Category</option>
                    {businessCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                {errors.businessCategory && <span style={styles.errorText}>{errors.businessCategory}</span>}

                <div style={styles.row2}>
                  <div style={styles.inputGroup}>
                    <FaClock style={styles.inputIcon} />
                    <input type="text" name="yearOfEstablishment" placeholder="Year of Establishment" value={formData.yearOfEstablishment} onChange={handleChange} style={styles.input} />
                  </div>
                  <div style={styles.inputGroup}>
                    <FaGlobe style={styles.inputIcon} />
                    <input type="text" name="website" placeholder="Website (Optional)" value={formData.website} onChange={handleChange} style={styles.input} />
                  </div>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div style={styles.inputGroup}>
                  <FaMapMarkerAlt style={styles.inputIcon} />
                  <textarea name="address" placeholder="Full Address" value={formData.address} onChange={handleChange} style={{ ...styles.input, resize: "vertical", minHeight: "80px" }} />
                </div>
                {errors.address && <span style={styles.errorText}>{errors.address}</span>}

                <div style={styles.row2}>
                  <div style={styles.inputGroup}>
                    <FaBuilding style={styles.inputIcon} />
                    <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} style={styles.input} />
                  </div>
                  <div style={styles.inputGroup}>
                    <FaMapMarkerAlt style={styles.inputIcon} />
                    <select name="state" value={formData.state} onChange={handleChange} style={styles.select}>
                      <option value="">Select State</option>
                      {states.map(state => <option key={state} value={state}>{state}</option>)}
                    </select>
                  </div>
                </div>
                {errors.city && <span style={styles.errorText}>{errors.city}</span>}
                {errors.state && <span style={styles.errorText}>{errors.state}</span>}

                <div style={styles.row2}>
                  <div style={styles.inputGroup}>
                    <FaMapMarkerAlt style={styles.inputIcon} />
                    <input type="text" name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} style={styles.input} />
                  </div>
                  <div style={styles.inputGroup}>
                    <FaMapMarkerAlt style={styles.inputIcon} />
                    <input type="text" name="landmark" placeholder="Landmark (Optional)" value={formData.landmark} onChange={handleChange} style={styles.input} />
                  </div>
                </div>
                {errors.pincode && <span style={styles.errorText}>{errors.pincode}</span>}
              </>
            )}

            {currentStep === 4 && (
              <>
                <div style={styles.inputGroup}>
                  <FaUser style={styles.inputIcon} />
                  <input type="text" name="accountHolderName" placeholder="Account Holder Name" value={formData.accountHolderName} onChange={handleChange} style={styles.input} />
                </div>
                {errors.accountHolderName && <span style={styles.errorText}>{errors.accountHolderName}</span>}

                <div style={styles.inputGroup}>
                  <FaUniversity style={styles.inputIcon} />
                  <input type="text" name="accountNumber" placeholder="Account Number" value={formData.accountNumber} onChange={handleChange} style={styles.input} />
                </div>
                {errors.accountNumber && <span style={styles.errorText}>{errors.accountNumber}</span>}

                <div style={styles.inputGroup}>
                  <FaUniversity style={styles.inputIcon} />
                  <input type="text" name="confirmAccountNumber" placeholder="Confirm Account Number" value={formData.confirmAccountNumber} onChange={handleChange} style={styles.input} />
                </div>
                {errors.confirmAccountNumber && <span style={styles.errorText}>{errors.confirmAccountNumber}</span>}

                <div style={styles.row2}>
                  <div style={styles.inputGroup}>
                    <FaIdCard style={styles.inputIcon} />
                    <input type="text" name="ifscCode" placeholder="IFSC Code" value={formData.ifscCode} onChange={handleChange} style={styles.input} />
                  </div>
                  <div style={styles.inputGroup}>
                    <FaUniversity style={styles.inputIcon} />
                    <input type="text" name="bankName" placeholder="Bank Name" value={formData.bankName} onChange={handleChange} style={styles.input} />
                  </div>
                </div>
                {errors.ifscCode && <span style={styles.errorText}>{errors.ifscCode}</span>}
                {errors.bankName && <span style={styles.errorText}>{errors.bankName}</span>}

                <div style={styles.inputGroup}>
                  <FaUniversity style={styles.inputIcon} />
                  <input type="text" name="branchName" placeholder="Branch Name" value={formData.branchName} onChange={handleChange} style={styles.input} />
                </div>

                <div style={styles.inputGroup}>
                  <FaMobile style={styles.inputIcon} />
                  <input type="text" name="upiId" placeholder="UPI ID (Optional)" value={formData.upiId} onChange={handleChange} style={styles.input} />
                </div>

                <div style={styles.checkboxGroup}>
                  <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleCheckbox} style={styles.checkbox} />
                  <span>I agree to the <Link to="/terms">Terms & Conditions</Link></span>
                </div>
                {errors.agreeTerms && <span style={styles.errorText}>{errors.agreeTerms}</span>}

                <div style={styles.checkboxGroup}>
                  <input type="checkbox" name="agreeKYC" checked={formData.agreeKYC} onChange={handleCheckbox} style={styles.checkbox} />
                  <span>I consent to <Link to="/kyc">KYC verification</Link> process</span>
                </div>
                {errors.agreeKYC && <span style={styles.errorText}>{errors.agreeKYC}</span>}
              </>
            )}

            <div style={styles.buttonGroup}>
              {currentStep > 1 && <button type="button" style={styles.backBtn} onClick={handlePrevious}>Back</button>}
              {currentStep < 4 ? (
                <button type="button" style={styles.nextBtn} onClick={handleNext}>Next <FaArrowRight /></button>
              ) : (
                <button type="submit" style={styles.submitBtn} disabled={loading}>
                  {loading ? <span style={styles.spinner}></span> : "Register"}
                </button>
              )}
            </div>
          </form>

          <div style={styles.formFooter}>
            <p style={styles.footerText}>Already have an account? <Link to="/login" style={styles.footerLink}>Login</Link></p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, select:focus, textarea:focus { border-color: #f97316 !important; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1) !important; background: white !important; }
        @media (max-width: 992px) { .register-left { display: none; } }
      `}</style>
    </div>
  );
};

export default Register;