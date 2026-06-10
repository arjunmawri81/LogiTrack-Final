import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import "./Profile.css";

const Profile = () => {
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

      setProfile(res.data.merchant);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="profile-container">
        <h1>My Profile</h1>

        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar">
              AS
            </div>

            <div>
              <h2>Arjun Singh Mawri</h2>
              <p>Merchant Account</p>
            </div>
          </div>

          <div className="profile-form">
            <input
              type="text"
              value={profile.companyName}
              readOnly
            />

            <input
              type="text"
              value={profile.gstNumber}
              readOnly
            />

            <input
              type="text"
              value={profile.panNumber}
              readOnly
            />

            <input
              type="text"
              value={profile.bankAccount}
              readOnly
            />

            <textarea
              value={profile.address}
              readOnly
            />

            <button>
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;