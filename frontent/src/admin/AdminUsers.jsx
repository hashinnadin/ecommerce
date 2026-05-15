import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Ban, Search, User, Lock, Unlock, Mail, ShieldCheck, Filter, MoreVertical, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import AdminNavbar from "./AdminNavbar";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/users");
      setUsers(res.data || []);
    } catch {
      toast.error("Failed to load users!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleUserStatus = async (id, isBlocked) => {
    const action = isBlocked ? "unblock" : "suspend";
    if (!window.confirm(`Are you sure you want to ${action} this customer's access?`)) return;

    try {
      await API.put(`/admin/users/${id}/block`, { is_blocked: !isBlocked });
      toast.success(`User access ${isBlocked ? "restored" : "suspended"}`);
      loadUsers();
    } catch {
      toast.error(`Failed to ${action} user`);
    }
  };

  const filteredUsers = users.filter((u) => {
    const name = u?.name || u?.username || "";
    const email = u?.email || "";
    return [name, email].some((v) => v.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-rose-100 border-t-rose-500 rounded-full"></motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex">
      <AdminNavbar />

      {/* dY"1 MAIN CONTENT */}
      <main className="flex-1 lg:ml-72 p-6 md:p-12 mt-16 lg:mt-0 relative">
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-16 relative z-10">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">
                <User size={12} /> Community Governance
            </nav>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-4">User <span className="text-gradient">Manager</span></h1>
            <p className="text-gray-500 font-bold text-lg">Manage access and monitor engagement for your bakery circle.</p>
          </div>

          <div className="flex flex-col md:flex-row w-full xl:w-auto gap-4">
            <div className="relative flex-1 md:w-96">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                    placeholder="Search by name or email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-rose-50 transition-all shadow-premium text-sm font-bold" 
                />
            </div>
            <button className="p-5 bg-white border border-gray-100 rounded-[1.5rem] text-gray-400 shadow-premium hover:text-rose-500 transition-all"><Filter size={22} /></button>
          </div>
        </header>

        <div className="bg-white/70 backdrop-blur-xl rounded-[4rem] shadow-premium border border-white overflow-hidden relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Identity</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Status</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Engagement</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Access Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence mode="popLayout">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-10 py-40 text-center">
                          <User className="text-gray-200 mx-auto mb-6" size={64} />
                          <h3 className="text-2xl font-black text-gray-900 mb-2">No Customers Found</h3>
                          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Your search didn't return any results</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, i) => {
                      const isBlocked = u.is_blocked === true || u.status === "blocked";
                      return (
                        <motion.tr
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          key={u.ID || u.id}
                          className="hover:bg-gray-50/50 transition-colors group"
                        >
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-300 border border-gray-50 group-hover:bg-rose-50 group-hover:text-rose-500 group-hover:border-rose-100 transition-all duration-500 shadow-sm">
                                <User size={24} />
                              </div>
                              <div>
                                <p className="font-black text-gray-900 text-lg tracking-tight leading-none mb-1">{u.name || u.username || "Artisan Guest"}</p>
                                <p className="text-gray-400 font-bold text-xs flex items-center gap-2"><Mail size={12} /> {u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            {isBlocked ? (
                              <div className="px-5 py-2 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit border border-rose-100 shadow-sm animate-pulse">
                                <Ban size={14} /> Suspended
                              </div>
                            ) : (
                              <div className="px-5 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit border border-emerald-100 shadow-sm">
                                <ShieldCheck size={14} /> Active Account
                              </div>
                            )}
                          </td>
                          <td className="px-10 py-8">
                              <div className="flex flex-col gap-1">
                                  <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Member Since</span>
                                  <span className="font-black text-gray-900">{new Date(u.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                              </div>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => toggleUserStatus(u.ID || u.id, isBlocked)}
                                    className={`px-8 py-4 rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-sm flex items-center gap-3 ${isBlocked ? "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-100" : "bg-white text-rose-500 border border-rose-50 hover:bg-rose-500 hover:text-white hover:shadow-rose-100"}`}
                                >
                                    {isBlocked ? <><Unlock size={16} /> Restore Access</> : <><Lock size={16} /> Suspend Access</>}
                                </button>
                                <button className="p-4 bg-gray-50 rounded-[1.2rem] text-gray-300 hover:text-gray-900 transition-all">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminUsers;
