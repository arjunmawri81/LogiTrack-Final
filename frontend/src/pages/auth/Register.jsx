import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../services/api";
import { 
  FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, 
  FaBuilding, FaMobile, FaCheckCircle, FaTruck,
  FaShieldAlt, FaHeadset, FaClock
} from "react-icons/fa";
import "./Auth.css";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP States
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: "",
    ownerName: "",
    email: "",
    mobile: "",
    emailOtp: "",
    mobileOtp: "",
    password: "",
    confirmPassword: "",
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

  const validate = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const payload = {
        companyName: formData.companyName,
        name: formData.ownerName,
        phone: formData.mobile,
        email: formData.email,
        password: formData.password,
        role: "MERCHANT",
      };

      await api.post("/auth/register", payload);

      alert("Registration Successful! Please login to your account to complete your profile setup.");
      navigate("/login");
    } catch (error) {
      alert(error?.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

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
    rightSection: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "white", padding: "40px", overflowY: "auto" },
    formWrapper: { maxWidth: "550px", width: "100%" },
    formHeader: { textAlign: "center", marginBottom: "30px" },
    formTitle: { fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px 0" },
    formSubtitle: { fontSize: "14px", color: "#64748b", margin: 0 },
    form: { display: "flex", flexDirection: "column", gap: "16px" },
    inputGroup: { position: "relative", display: "flex", alignItems: "center" },
    inputIcon: { position: "absolute", left: "16px", color: "#94a3b8", fontSize: "16px" },
    input: { width: "100%", padding: "14px 16px 14px 48px", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "14px", background: "#f8fafc", outline: "none" },
    passwordToggle: { position: "absolute", right: "16px", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" },
    otpGroup: { display: "flex", gap: "12px", alignItems: "center" },
    otpInput: { flex: 1 },
    otpBtn: { padding: "14px 20px", background: "#f1f5f9", color: "#1e293b", border: "1px solid #cbd5e1", borderRadius: "12px", cursor: "pointer", fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap" },
    verifyBtn: { padding: "14px 20px", background: "#f97316", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontSize: "13px", fontWeight: "500", whiteSpace: "nowrap" },
    verifiedBadge: { position: "absolute", right: "16px", color: "#10b981" },
    errorText: { fontSize: "11px", color: "#ef4444", marginTop: "4px", marginLeft: "12px" },
    buttonGroup: { display: "flex", gap: "12px", marginTop: "20px" },
    submitBtn: { flex: 1, padding: "14px", background: "linear-gradient(135deg, #f97316, #ea580c)", border: "none", borderRadius: "12px", color: "white", fontSize: "16px", fontWeight: "600", cursor: "pointer" },
    formFooter: { textAlign: "center", marginTop: "25px" },
    footerText: { fontSize: "14px", color: "#64748b" },
    footerLink: { color: "#f97316", textDecoration: "none", fontWeight: "600" },
    spinner: { display: "inline-block", width: "20px", height: "20px", border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" },
  };

  return (
    <div className="auth-container" style={styles.container}>
      <div className="auth-left-section" style={styles.leftSection}>
        <div style={styles.brandContent}>
          <div style={styles.brandLogo}>
            <span style={styles.logoIcon}>📦</span>
            <h1 style={styles.brandTitle}>MyParcel<span style={styles.brandSpan}>Point</span></h1>
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

      <div className="auth-right-section" style={styles.rightSection}>
        <div className="register-form-wrapper" style={styles.formWrapper}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create Account</h2>
            <p style={styles.formSubtitle}>Register your company</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <FaBuilding style={styles.inputIcon} />
              <input type="text" name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleChange} className="auth-input" style={styles.input} />
            </div>
            {errors.companyName && <span style={styles.errorText}>{errors.companyName}</span>}

            <div style={styles.inputGroup}>
              <FaUser style={styles.inputIcon} />
              <input type="text" name="ownerName" placeholder="Owner Name" value={formData.ownerName} onChange={handleChange} className="auth-input" style={styles.input} />
            </div>
            {errors.ownerName && <span style={styles.errorText}>{errors.ownerName}</span>}

            <div className="otp-group-responsive" style={styles.otpGroup}>
              <div style={{ ...styles.inputGroup, ...styles.otpInput }}>
                <FaEnvelope style={styles.inputIcon} />
                <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="auth-input" style={styles.input} disabled={emailVerified} />
                {emailVerified && <FaCheckCircle style={styles.verifiedBadge} />}
              </div>
              <button type="button" style={styles.otpBtn} onClick={sendEmailOtp} disabled={emailVerified}>
                {emailVerified ? "Verified" : "Send OTP"}
              </button>
            </div>
            {errors.email && <span style={styles.errorText}>{errors.email}</span>}

            {emailOtpSent && !emailVerified && (
              <div className="otp-group-responsive" style={styles.otpGroup}>
                <div style={{ ...styles.inputGroup, ...styles.otpInput }}>
                  <FaClock style={styles.inputIcon} />
                  <input type="text" name="emailOtp" placeholder="Enter Email OTP" value={formData.emailOtp} onChange={handleChange} className="auth-input" style={styles.input} />
                </div>
                <button type="button" style={styles.verifyBtn} onClick={verifyEmailOtp}>Verify</button>
              </div>
            )}

            <div className="otp-group-responsive" style={styles.otpGroup}>
              <div style={{ ...styles.inputGroup, ...styles.otpInput }}>
                <FaMobile style={styles.inputIcon} />
                <input type="tel" name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} className="auth-input" style={styles.input} disabled={mobileVerified} />
                {mobileVerified && <FaCheckCircle style={styles.verifiedBadge} />}
              </div>
              <button type="button" style={styles.otpBtn} onClick={sendMobileOtp} disabled={mobileVerified}>
                {mobileVerified ? "Verified" : "Send OTP"}
              </button>
            </div>
            {errors.mobile && <span style={styles.errorText}>{errors.mobile}</span>}

            {mobileOtpSent && !mobileVerified && (
              <div className="otp-group-responsive" style={styles.otpGroup}>
                <div style={{ ...styles.inputGroup, ...styles.otpInput }}>
                  <FaClock style={styles.inputIcon} />
                  <input type="text" name="mobileOtp" placeholder="Enter Mobile OTP" value={formData.mobileOtp} onChange={handleChange} className="auth-input" style={styles.input} />
                </div>
                <button type="button" style={styles.verifyBtn} onClick={verifyMobileOtp}>Verify</button>
              </div>
            )}

            <div style={styles.inputGroup}>
              <FaLock style={styles.inputIcon} />
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="auth-input" style={styles.input} />
              <button type="button" style={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <span style={styles.errorText}>{errors.password}</span>}

            <div style={styles.inputGroup}>
              <FaLock style={styles.inputIcon} />
              <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} className="auth-input" style={styles.input} />
              <button type="button" style={styles.passwordToggle} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && <span style={styles.errorText}>{errors.confirmPassword}</span>}

            <div style={styles.buttonGroup}>
              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? <span style={styles.spinner}></span> : "Register"}
              </button>
            </div>
          </form>

          <div style={styles.formFooter}>
            <p style={styles.footerText}>Already have an account? <Link to="/login" style={styles.footerLink}>Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;