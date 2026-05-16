import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Phone, MapPin, Camera, Save, Edit3, 
  ChevronRight, Shield, Clock, Package, Heart, LogOut
} from "lucide-react";
import { toast } from "react-toastify";
import API from "../api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../compenent/Navbar/Navbar";
import Footer from "../compenent/Footer";

function Profile() {
  const { user, logout, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Password State
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [changingPwd, setChangingPwd] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/user/profile");
      setProfile(res.data);
      setFormData({
        name: res.data.name || "",
        mobile: res.data.address?.mobile || res.data.mobile || "",
      });
      setAvatarPreview(res.data.avatar);
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("mobile", formData.mobile);
      if (avatarFile) {
        data.append("avatar", avatarFile);
      }

      const res = await API.put("/user/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfile(res.data);
      // Update local auth context if needed
      // login(res.data); 
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("New passwords do not match");
    }
    
    setChangingPwd(true);
    try {
      await API.post("/user/change-password", {
        old_password: passwords.oldPassword,
        new_password: passwords.newPassword
      });
      toast.success("Password changed successfully!");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to change password");
    } finally {
      setChangingPwd(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-rose-100 border-t-rose-500 rounded-full"></motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />
      
      <main className="pt-32 pb-20 max-w-7xl mx-auto px-6">
        <header className="mb-12">
            <nav className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">
                <User size={12} /> Personal Sanctuary
            </nav>
            <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">Your <span className="text-gradient">Profile</span></h1>
        </header>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* 🔹 LEFT: AVATAR & QUICK STATS */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[3.5rem] p-10 shadow-premium border border-gray-50 text-center relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-32 bg-rose-50/50 -z-0"></div>
                
                <div className="relative z-10">
                    <div className="relative w-40 h-40 mx-auto mb-6 group">
                        <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-white shadow-xl border-4 border-white">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-rose-50 text-rose-500">
                                    <User size={64} />
                                </div>
                            )}
                        </div>
                        {isEditing && (
                            <label className="absolute bottom-2 right-2 w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center cursor-pointer hover:bg-rose-500 transition-colors shadow-lg">
                                <Camera size={20} />
                                <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                            </label>
                        )}
                    </div>
                    
                    <h2 className="text-2xl font-black text-gray-900 mb-1">{profile?.name}</h2>
                    <p className="text-gray-400 font-bold text-sm mb-8 flex items-center justify-center gap-2">
                        <Shield size={14} className="text-emerald-500" /> {profile?.role?.toUpperCase()} MEMBER
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Orders</p>
                            <p className="font-black text-gray-900 text-lg">12</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Reviews</p>
                            <p className="font-black text-gray-900 text-lg">5</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="bg-gray-900 rounded-[3rem] p-8 shadow-2xl space-y-4">
                <button className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-between text-white transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-rose-500/20 text-rose-500 rounded-xl flex items-center justify-center"><Heart size={18} /></div>
                        <span className="font-bold text-sm">Wishlist</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-between text-white transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500/20 text-blue-500 rounded-xl flex items-center justify-center"><Package size={18} /></div>
                        <span className="font-bold text-sm">Order History</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={logout} className="w-full p-4 hover:bg-rose-500/10 rounded-2xl flex items-center gap-4 text-rose-500 transition-all mt-4 group">
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-black uppercase text-[10px] tracking-widest">Secure Logout</span>
                </button>
            </div>
          </div>

          {/* 🔹 RIGHT: DETAILS & FORM */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[3.5rem] p-10 lg:p-14 shadow-premium border border-gray-50"
            >
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Account Details</h2>
                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                        >
                            <Edit3 size={14} /> Edit Identity
                        </button>
                    )}
                </div>

                <form onSubmit={handleUpdate} className="space-y-10">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input 
                                    disabled={!isEditing}
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className={`w-full pl-14 pr-6 py-5 rounded-[1.5rem] font-bold transition-all ${isEditing ? "bg-gray-50 focus:bg-white ring-4 ring-rose-50 border-rose-100" : "bg-transparent border-gray-100 border text-gray-500 cursor-not-allowed"}`}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Email</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input 
                                    disabled={true}
                                    value={profile?.email}
                                    className="w-full pl-14 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] font-bold text-gray-400 cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
                            <div className="relative">
                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input 
                                    disabled={!isEditing}
                                    value={formData.mobile}
                                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                                    placeholder="+91 00000 00000"
                                    className={`w-full pl-14 pr-6 py-5 rounded-[1.5rem] font-bold transition-all ${isEditing ? "bg-gray-50 focus:bg-white ring-4 ring-rose-50 border-rose-100" : "bg-transparent border-gray-100 border text-gray-500 cursor-not-allowed"}`}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Member Since</label>
                            <div className="relative">
                                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input 
                                    disabled={true}
                                    value={new Date(profile?.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                    className="w-full pl-14 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] font-bold text-gray-400 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-emerald-50/50 rounded-[2rem] border border-emerald-100 flex gap-6 items-start">
                        <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Primary Shipping Address</p>
                            <p className="font-bold text-gray-900 text-sm leading-relaxed">
                                {profile?.address?.house}, {profile?.address?.street}<br/>
                                {profile?.address?.city}, {profile?.address?.state} - {profile?.address?.pincode}
                            </p>
                        </div>
                    </div>

                    <AnimatePresence>
                        {isEditing && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                className="flex gap-4 pt-6 border-t border-gray-100"
                            >
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-5 bg-gray-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <><Save size={16} /> Save Identity</>
                                    )}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setAvatarPreview(profile?.avatar);
                                        setFormData({
                                            name: profile?.name,
                                            mobile: profile?.address?.mobile || profile?.mobile
                                        });
                                    }}
                                    className="px-10 py-5 bg-white border border-gray-100 text-gray-400 hover:text-gray-900 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>

                <div className="mt-20 pt-16 border-t border-gray-50">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Security & Privacy</h2>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Protect your artisan account</p>
                        </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="grid md:grid-cols-3 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                            <input 
                                type="password"
                                value={passwords.oldPassword}
                                onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:ring-4 focus:ring-rose-50 transition-all font-bold"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                            <input 
                                type="password"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:ring-4 focus:ring-rose-50 transition-all font-bold"
                                placeholder="Min. 6 chars"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New</label>
                            <div className="flex gap-4">
                                <input 
                                    type="password"
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                                    className="flex-1 px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:ring-4 focus:ring-rose-50 transition-all font-bold"
                                    placeholder="••••••••"
                                />
                                <button 
                                    disabled={changingPwd}
                                    className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 transition-all shadow-lg disabled:opacity-50"
                                >
                                    {changingPwd ? "..." : "Update"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Profile;
