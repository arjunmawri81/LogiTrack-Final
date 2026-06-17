import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import "./Profile.css";

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [profile, setProfile] = useState({
    companyName: "",
    gstNumber: "",
    panNumber: "",
    bankAccount: "",
    address: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/merchant/profile");

      setProfile({
        companyName: res.data.merchant?.companyName || "",
        gstNumber: res.data.merchant?.gstNumber || "",
        panNumber: res.data.merchant?.panNumber || "",
        bankAccount: res.data.merchant?.bankAccount || "",
        address: res.data.merchant?.address || "",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const saveProfile = async () => {
    try {
      setLoading(true);

      const res = await api.put(
        "/merchant/profile",
        profile
      );

      alert(
        res.data.message ||
          "Profile Updated Successfully"
      );

      setEditMode(false);
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "Profile Update Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      <Sidebar />

      <div className="profile-container">
        <h1>My Profile</h1>

        <div
          style={{
            width: "100%",
            maxWidth: "1400px",
          }}
        >
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar">
                {profile.companyName
                  ? profile.companyName
                      .charAt(0)
                      .toUpperCase()
                  : "M"}
              </div>

              <div>
                <h2>
                  {profile.companyName ||
                    "Merchant Account"}
                </h2>

                <p>
                  Manage your company information and
                  business details
                </p>
              </div>
            </div>

            {/* Professional Stats Section */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(220px,1fr))",
                gap: "15px",
                marginBottom: "25px",
              }}
            >
              <div className="profile-stat">
                <h4>Company</h4>
                <p>{profile.companyName || "Not Added"}</p>
              </div>

              <div className="profile-stat">
                <h4>GST</h4>
                <p>{profile.gstNumber || "Not Added"}</p>
              </div>

              <div className="profile-stat">
                <h4>PAN</h4>
                <p>{profile.panNumber || "Not Added"}</p>
              </div>
            </div>

            <div className="profile-form">
              <input
                type="text"
                name="companyName"
                placeholder="Company Name"
                value={profile.companyName}
                onChange={handleChange}
                readOnly={!editMode}
              />

              <input
                type="text"
                name="gstNumber"
                placeholder="GST Number"
                value={profile.gstNumber}
                onChange={handleChange}
                readOnly={!editMode}
              />

              <input
                type="text"
                name="panNumber"
                placeholder="PAN Number"
                value={profile.panNumber}
                onChange={handleChange}
                readOnly={!editMode}
              />

              <input
                type="text"
                name="bankAccount"
                placeholder="Bank Account"
                value={profile.bankAccount}
                onChange={handleChange}
                readOnly={!editMode}
              />

              <textarea
                name="address"
                placeholder="Address"
                value={profile.address}
                onChange={handleChange}
                readOnly={!editMode}
              />

              {!editMode ? (
                <button
                  onClick={() =>
                    setEditMode(true)
                  }
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={saveProfile}
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;