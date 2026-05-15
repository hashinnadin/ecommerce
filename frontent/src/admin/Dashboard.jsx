import React, { useEffect, useState } from "react";
import API from "../api";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import {
  Users, Box, ShoppingCart, IndianRupee, Plus, Activity, ArrowRight, Settings, ShoppingBag, TrendingUp, Filter, Calendar
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import AdminNavbar from "./AdminNavbar";

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [dashRes, ordersRes] = await Promise.all([
          API.get("/admin/dashboard"),
          API.get("/admin/orders"),
        ]);

        const dashboardData = dashRes.data || {};
        const orders = ordersRes.data || [];

        // Build chart data
        const dailyRevenue = {};
        orders.forEach(o => {
          const date = new Date(o.created_at || o.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
          if (!dailyRevenue[date]) dailyRevenue[date] = 0;
          dailyRevenue[date] += (o.total_amount || o.totalAmount || 0);
        });

        const cData = Object.keys(dailyRevenue).map(date => ({
          date,
          revenue: dailyRevenue[date]
        })).reverse();

        setChartData(cData.slice(-7));

        const sorted = orders
          .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
          .slice(0, 5)
          .map((o) => ({
            id: o.id || o.orderId,
            userName: o.user?.name || `User ${o.user_id || o.userId}`,
            totalAmount: o.total_amount || o.totalAmount,
            status: o.status,
            date: o.created_at || o.date,
          }));

        setStats({
          totalUsers: dashboardData.total_users || 0,
          totalProducts: dashboardData.total_products || 0,
          totalOrders: dashboardData.total_orders || orders.length,
          totalRevenue: orders.reduce((a, b) => a + (b.total_amount || b.totalAmount || 0), 0),
        });

        setRecentOrders(sorted);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getStatusColor = (status = "") => {
    const s = status.toLowerCase();
    if (s.includes("deliv") || s.includes("succ")) return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (s.includes("pend") || s.includes("proc")) return "bg-amber-50 text-amber-600 border-amber-100";
    if (s.includes("can") || s.includes("fail")) return "bg-rose-50 text-rose-600 border-rose-100";
    return "bg-gray-50 text-gray-600 border-gray-100";
  };

  const statCards = [
    { title: "Net Revenue", value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "rose", trend: "+12.5%" },
    { title: "Active Orders", value: stats.totalOrders, icon: ShoppingCart, color: "blue", trend: "+8.2%" },
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "violet", trend: "+24.1%" },
    { title: "Inventory", value: stats.totalProducts, icon: Box, color: "emerald", trend: "+4.3%" },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-rose-100 border-t-rose-500 rounded-full"></motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex">
      <AdminNavbar />

      {/* dY"1 MAIN CONTENT */}
      <main className="flex-1 lg:ml-72 p-6 md:p-12 mt-16 lg:mt-0 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[50%] bg-rose-50/50 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[40%] bg-blue-50/50 rounded-full blur-[100px] pointer-events-none"></div>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 relative z-10">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">
                <Activity size={12} /> Management Dashboard
            </nav>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-4">Command <span className="text-gradient">Center</span></h1>
            <p className="text-gray-500 font-bold text-lg">Real-time performance analytics for your artisan bakery.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={() => navigate("/admin/products/add")}
              className="group relative px-10 py-5 bg-gray-900 text-white rounded-[2rem] font-black text-sm overflow-hidden shadow-2xl hover:shadow-rose-100 transition-all flex items-center gap-3"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-rose-600 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500"></div>
              <span className="relative z-10 flex items-center gap-3"><Plus size={18} /> New Product</span>
            </button>
            <button className="p-5 bg-white border border-gray-100 rounded-[1.5rem] text-gray-400 shadow-premium hover:text-rose-500 transition-all">
              <Settings size={22} />
            </button>
          </div>
        </header>

        {/* dY"1 STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 relative z-10">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
                <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i}
                className="bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] shadow-premium hover:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.08)] border border-white group transition-all duration-500 hover:-translate-y-2"
                >
                <div className={`w-14 h-14 bg-${s.color}-50 text-${s.color}-500 rounded-[1.2rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500`}>
                    <Icon size={24} />
                </div>
                <div className="flex items-end justify-between">
                    <div>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{s.title}</p>
                    <h3 className="text-3xl font-black text-gray-900 leading-none tracking-tighter">{s.value}</h3>
                    </div>
                    <div className="flex flex-col items-end">
                        <TrendingUp size={14} className="text-emerald-500 mb-1" />
                        <span className="text-emerald-500 text-[10px] font-black bg-emerald-50 px-2 py-1 rounded-lg">
                        {s.trend}
                        </span>
                    </div>
                </div>
                </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-12 relative z-10">
          {/* dY"1 CHART */}
          <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl p-10 rounded-[4rem] shadow-premium border border-white overflow-hidden">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Revenue Dynamics</h2>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Daily trend analysis</p>
                </div>
                <div className="flex gap-2">
                    <button className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all"><Calendar size={18} /></button>
                    <button className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all"><Filter size={18} /></button>
                </div>
            </div>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f1f1" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 900}} dy={20} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 900}} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '2rem', border: '1px solid #f1f1f1', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '1.5rem' }}
                    itemStyle={{ fontWeight: 900, color: '#F43F5E' }}
                    labelStyle={{ fontWeight: 900, marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#F43F5E" strokeWidth={5} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* dY"1 RECENT ORDERS */}
          <div className="bg-white/70 backdrop-blur-xl p-10 rounded-[4rem] shadow-premium border border-white flex flex-col">
            <div className="flex justify-between items-center mb-12">
              <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Recent Sales</h2>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Latest transitions</p>
              </div>
              <Link to="/admin/orders" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                <ArrowRight size={18} />
              </Link>
            </div>
            <div className="space-y-8 flex-1">
              {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                    <ShoppingBag size={48} className="text-gray-300 mb-4" />
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No orders yet</p>
                </div>
              ) : (
                recentOrders.map((o, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    key={o.id} 
                    className="flex items-center justify-between group cursor-pointer" 
                    onClick={() => navigate("/admin/orders")}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-300 border border-gray-50 group-hover:bg-rose-50 group-hover:text-rose-500 group-hover:border-rose-100 transition-all duration-300 shadow-sm">
                        <ShoppingBag size={20} />
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-sm tracking-tight">{o.userName}</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">ID #{o.id.toString().slice(-4)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900 text-base mb-1">₹{o.totalAmount}</p>
                      <span className={`text-[9px] px-3 py-1 rounded-xl font-black uppercase tracking-widest border ${getStatusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            <button 
              onClick={() => navigate("/admin/orders")}
              className="w-full mt-12 py-5 bg-gray-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-rose-500 transition-all shadow-xl"
            >
              Detailed Analytics
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
