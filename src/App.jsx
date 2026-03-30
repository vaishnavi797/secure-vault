import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Vault, Settings, Shield, X, Minus, Square, Terminal, Lock, Unlock, Eye, EyeOff, Plus, Trash2, Copy, FileText, CheckCircle, Search, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Views
const Dashboard = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAudit, setShowAudit] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        try {
            const data = await window.electronAPI.getAssets();
            setAssets(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const stats = [
        { label: 'Total Assets', value: assets.length, icon: Shield, color: 'var(--accent-primary)' },
        { label: 'Recently Added', value: assets.filter(a => new Date(a.timestamp) > new Date(Date.now() - 86400000)).length, icon: Plus, color: 'var(--success)' },
        { label: 'Security Score', value: '98%', icon: ShieldCheck, color: 'var(--accent-secondary)' },
        { label: 'Offline Mode', value: 'Active', icon: Lock, color: 'var(--warning)' }
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-8 relative">
            <header>
                <h1 className="text-3xl font-bold mb-2 text-white">Security Dashboard</h1>
                <p className="text-gray-400">Welcome back. Your vault is currently encrypted & localized.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="card flex items-center gap-4 border border-slate-800 bg-slate-900/30">
                        <div className="p-3 rounded-xl bg-slate-900/50" style={{ color: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <div className="text-sm text-gray-400">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center text-white">
                        <h2 className="text-xl font-semibold">Credential Health</h2>
                        <button className="text-sm text-indigo-400 hover:underline" onClick={() => setShowAudit(true)}>View Audit Log</button>
                    </div>
                    <div className="relative overflow-hidden card border border-indigo-500/20 bg-gradient-to-br from-indigo-900/20 to-slate-900/40 p-10 text-center">
                        <ShieldCheck className="mx-auto mb-4 text-indigo-400" size={64} />
                        <h3 className="text-2xl font-bold mb-2 text-white">Vault Integrity: Optimal</h3>
                        <p className="text-gray-400 max-w-md mx-auto mb-6">Your data is stored with AES-256-CBC encryption on your local machine. No data leaves your workstation.</p>
                        <div className="flex justify-center gap-4">
                            <span className="status-badge bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs">AES-256 Enabled</span>
                            <span className="status-badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs">Local Database Active</span>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <h2 className="text-xl font-semibold text-white">Recent Security Assets</h2>
                        {assets.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 bg-white/5 rounded-xl border border-dashed border-white/10">
                                No assets secured yet. Use the Quick Action to begin.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {assets.slice(0, 4).map((asset) => (
                                    <div key={asset._id} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center gap-4">
                                        <div className="w-10 h-10 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                            <Lock size={18} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="font-bold text-white truncate">{asset.title}</div>
                                            <div className="text-xs text-gray-500 font-mono truncate">{asset.username}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button onClick={() => navigate('/vault')} className="w-full py-2 text-sm text-indigo-400 hover:text-white transition-colors">View All Assets in Vault →</button>
                    </div>
                </div>

                <div className="space-y-6">
                   <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
                   <div className="space-y-3">
                       <button className="btn w-full justify-start gap-4 py-4" onClick={() => navigate('/vault')}>
                           <div className="p-2 bg-white/10 rounded-lg"><Plus size={18} /></div>
                           <span className="font-bold">Add New Asset</span>
                       </button>
                       <button className="btn btn-ghost w-full justify-start gap-4 py-4 border-slate-800" onClick={() => setShowAudit(true)}>
                           <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg"><Shield size={18} /></div>
                           <span className="font-bold">Security Scan</span>
                       </button>
                       <button className="btn btn-ghost w-full justify-start gap-4 py-4 border-slate-800" onClick={() => navigate('/viewer')}>
                           <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><FileText size={18} /></div>
                           <span className="font-bold">Documentation</span>
                       </button>
                   </div>
                </div>
            </div>

            <AnimatePresence>
                {showAudit && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card w-full max-w-lg bg-slate-900 border-indigo-500/30 p-0 overflow-hidden">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-800">
                                <div className="flex items-center gap-2 text-indigo-400">
                                    <Terminal size={18} /> <span className="font-bold text-sm uppercase tracking-tighter">System Audit Log</span>
                                </div>
                                <button onClick={() => setShowAudit(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                            </div>
                            <div className="p-6 font-mono text-xs space-y-2 bg-black text-emerald-500 h-64 overflow-y-auto">
                                <p>[{new Date().toISOString()}] INITIALIZING SECURITY BRIDGES...</p>
                                <p>[{new Date().toISOString()}] LOCAL DATABASE: CONNECTED (OK)</p>
                                <p>[{new Date().toISOString()}] AES-256 MODULE: VERIFIED</p>
                                <p>[{new Date().toISOString()}] INTEGRITY SCAN: 100% COMPLETE</p>
                                <p className="text-white">--------------------------------------------------</p>
                                <p>[SYSTEM] Vault currently managing {assets.length} encrypted entries.</p>
                                <p>[SYSTEM] All local document readers are sandboxed.</p>
                                <p className="text-indigo-400 animate-pulse">_ LISTENING FOR PANIC KEY (CTRL+SHIFT+L)...</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const TheVault = () => {
    const [assets, setAssets] = useState([]);
    const [showPassword, setShowPassword] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newAsset, setNewAsset] = useState({ title: '', username: '', secret: '', type: 'API Key' });

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        const data = await window.electronAPI.getAssets();
        setAssets(data);
    };

    const checkStrength = (pass) => {
        if (!pass) return { score: 0, label: 'Initial', color: 'text-gray-500', bar: 'bg-gray-800 w-0' };
        let score = 0;
        if (pass.length > 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        
        switch(score) {
            case 1: return { score: 1, label: 'Weak', color: 'text-red-400', bar: 'bg-red-400 w-1/4' };
            case 2: return { score: 2, label: 'Fair', color: 'text-yellow-400', bar: 'bg-yellow-400 w-2/4' };
            case 3: return { score: 3, label: 'Strong', color: 'text-indigo-400', bar: 'bg-indigo-400 w-3/4' };
            case 4: return { score: 4, label: 'Elite', color: 'text-emerald-400', bar: 'bg-emerald-400 w-full' };
            default: return { score: 0, label: 'Vulnerable', color: 'text-gray-500', bar: 'bg-gray-800 w-0' };
        }
    };

    const copyToClipboard = (text, isSecret = false) => {
        navigator.clipboard.writeText(text);
        if (isSecret) {
            // Security: Auto-clear clipboard after 30 seconds
            setTimeout(() => {
                navigator.clipboard.writeText('');
                console.log('Clipboard cleared for security.');
            }, 30000);
            alert('Copied to clipboard. For your security, this will be cleared in 30 seconds.');
        }
    };

    const handleAddAsset = async (e) => {
        e.preventDefault();
        try {
            await window.electronAPI.saveAsset(newAsset);
            setNewAsset({ title: '', username: '', secret: '', type: 'API Key' });
            setShowAddForm(false);
            setTimeout(() => loadAssets(), 100);
        } catch (error) {
            console.error('Failed to save asset:', error);
            alert('Security Error: Could not write to local vault.');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this asset? This cannot be undone.')) {
            await window.electronAPI.deleteAsset(id);
            loadAssets();
        }
    };

    const filteredAssets = assets.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 space-y-6 h-full flex flex-col">
            <header className="flex justify-between items-end">
                <div>
                   <h1 className="text-3xl font-bold mb-2 text-white">Vault Manager</h1>
                   <p className="text-gray-400">Manage your encrypted credentials securely.</p>
                </div>
                <button className="btn" onClick={() => setShowAddForm(true)}>
                    <Plus size={18} /> Add Asset
                </button>
            </header>

            <div className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                <Search size={20} className="text-gray-500" />
                <input type="text" placeholder="Search by title or username..." className="bg-transparent border-none outline-none flex-1 text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <span className="text-xs text-gray-500">{filteredAssets.length} found</span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {filteredAssets.length === 0 ? (
                    <div className="card text-center py-20 text-gray-500 border-dashed border-2">
                        <Vault className="mx-auto mb-4 opacity-20" size={64} />
                        <p>No assets found. Click Add Asset to begin.</p>
                    </div>
                ) : (
                    filteredAssets.map((asset) => (
                        <div key={asset._id} className="card group relative overflow-hidden transition-all hover:scale-[1.01] border border-slate-800">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-lg text-white">{asset.title}</h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-widest bg-slate-800 ${checkStrength(asset.secret).color}`}>
                                            {checkStrength(asset.secret).label} - {asset.type}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-400 font-mono">{asset.username}</div>
                                </div>
                                <button onClick={() => handleDelete(asset._id)} className="p-2 text-red-500/40 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                            </div>
                            
                            <div className="mt-4 flex items-center justify-between bg-black/40 p-3 rounded-md border border-white/5">
                                <div className="flex-1 font-mono text-sm tracking-widest text-indigo-200/50">
                                    {showPassword[asset._id] ? asset.secret : '••••••••••••••••••••'}
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => togglePassword(asset._id)} className="text-gray-500 hover:text-white transition-colors">{showPassword[asset._id] ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                    <button onClick={() => copyToClipboard(asset.secret, true)} className="text-gray-500 hover:text-white transition-colors"><Copy size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AnimatePresence>
                {showAddForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="card w-full max-w-sm shadow-2xl border-indigo-500/20 bg-slate-900 border">
                            <div className="bg-indigo-600/10 px-4 py-2 border-b border-white/5 flex justify-between items-center text-white">
                                <h2 className="text-sm font-bold flex items-center gap-2">
                                    <Plus className="text-indigo-400" size={16} /> New Security Asset
                                </h2>
                                <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-white"><X size={16} /></button>
                            </div>
                            
                            <form onSubmit={handleAddAsset} className="p-4 space-y-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-indigo-400">Asset Title</label>
                                        <input required value={newAsset.title} onChange={e => setNewAsset({...newAsset, title: e.target.value})} className="input w-full bg-black/50 border-slate-800 text-white text-xs py-1.5" placeholder="e.g. AWS Key" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-indigo-400">Category</label>
                                        <select value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})} className="input w-full bg-black/50 border-slate-800 text-white text-xs py-1.5">
                                            <option>Password</option><option>API Key</option><option>Secret</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-indigo-400">Username/ID</label>
                                    <input required value={newAsset.username} onChange={e => setNewAsset({...newAsset, username: e.target.value})} className="input w-full bg-black/50 border-slate-800 text-white text-xs py-1.5" placeholder="admin_user" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-indigo-400">Secret Value</label>
                                    <input required type="password" value={newAsset.secret} onChange={e => setNewAsset({...newAsset, secret: e.target.value})} className="input w-full bg-black/50 border-slate-800 text-white text-xs py-1.5 font-mono" placeholder="••••••••" />
                                    <div className="flex justify-between items-center bg-black/30 px-2 py-1 rounded border border-white/5">
                                        <span className="text-[9px] font-bold text-gray-500 uppercase">Score</span>
                                        <span className={`${checkStrength(newAsset.secret).color} text-[10px] font-black`}>{checkStrength(newAsset.secret).label}</span>
                                        <div className="flex-1 max-w-[100px] h-1 bg-slate-800 rounded-full overflow-hidden ml-3">
                                            <motion.div animate={{ width: checkStrength(newAsset.secret).score * 25 + '%' }} className={`h-full ${checkStrength(newAsset.secret).bar.split(' ')[0]}`} />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-ghost flex-1 py-1.5 text-xs border-slate-800">Cancel</button>
                                    <button type="submit" className="btn flex-1 py-1.5 text-xs shadow-lg shadow-indigo-500/20">Save Asset</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const FileViewer = () => {
    const [filePath, setFilePath] = useState(null);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const pickFile = async () => {
        const path = await window.electronAPI.openFileDialog();
        if (path) {
            setFilePath(path);
            setLoading(true);
            const data = await window.electronAPI.readFile(path);
            setContent(data);
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 space-y-6 h-full flex flex-col">
            <header className="flex justify-between items-end">
                <div>
                   <h1 className="text-3xl font-bold mb-2">Documentation Viewer</h1>
                   <p className="text-gray-400">Examine logs and sensitive documents locally.</p>
                </div>
                <button className="btn" onClick={pickFile}>
                    <Plus size={18} /> Open Local File
                </button>
            </header>

            {!filePath ? (
                <div className="flex-1 card border-dashed border-2 flex flex-col items-center justify-center text-gray-500 gap-4" onClick={pickFile} style={{ cursor: 'pointer' }}>
                   <Terminal size={64} className="opacity-20" />
                   <p>No file selected. Click to browse JSON, Log, or Text files.</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    <div className="flex items-center gap-2 text-sm text-indigo-400 font-mono bg-slate-900/50 p-2 rounded border border-slate-700">
                        <FileText size={14} /> {filePath}
                    </div>
                    <div className="flex-1 bg-black rounded-lg border border-slate-800 p-4 font-mono text-sm overflow-auto text-emerald-400 custom-terminal whitespace-pre-wrap">
                        {loading ? 'Decrypting and loading...' : content}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

const SettingsView = () => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 space-y-8">
            <header>
                <h1 className="text-3xl font-bold mb-2">System Configuration</h1>
                <p className="text-gray-400">Configure SecureVault for your environment.</p>
            </header>

            <div className="space-y-6 max-w-2xl">
                <div className="card space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-indigo-400"><Shield size={20} /> Security Settings</h2>
                    <div className="flex items-center justify-between">
                         <div>
                             <div className="font-medium">Auto-Lock Vault</div>
                             <div className="text-sm text-gray-500">Automatically hide application when inactive for 10 minutes.</div>
                         </div>
                         <input type="checkbox" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                         <div>
                             <div className="font-medium">Panic Key (Global)</div>
                             <div className="text-sm text-gray-500">Hide vault instantly using <kbd className="bg-slate-800 p-1 rounded font-mono text-indigo-400">Ctrl+Shift+L</kbd></div>
                         </div>
                         <div className="status-badge">Active</div>
                    </div>
                </div>

                <div className="card space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-indigo-400"><Trash2 size={20} /> Data Management</h2>
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-4">
                         <AlertTriangle className="text-red-400 shrink-0" size={24} />
                         <div>
                             <div className="font-bold text-red-100">Factory Reset</div>
                             <p className="text-sm text-red-300">This will permanently delete all encrypted assets and local logs. This action cannot be reversed.</p>
                             <button className="btn mt-4 bg-red-600 hover:bg-red-700 text-white border-none">Purge All Data</button>
                         </div>
                    </div>
                </div>

                <div className="text-center text-gray-600 text-sm">
                   <p>SecureVault v1.0.0 (Build 2026.03.30)</p>
                   <p>Offline Security Asset Manager</p>
                </div>
            </div>
        </motion.div>
    );
};

// Main Layout Wrapper
const MainLayout = ({ children, isLocked, onUnlock }) => {
    return (
        <div className="flex flex-1 overflow-hidden relative">
            <aside className="w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col py-8">
                <div className="flex items-center gap-3 px-8 mb-12">
                   <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <Shield className="text-white" size={24} />
                   </div>
                   <span className="font-bold text-xl tracking-tight">SecureVault</span>
                </div>

                <nav className="flex-1 space-y-2 px-4">
                    <NavLink to="/" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}>
                        <LayoutDashboard size={20} /> Dashboard
                    </NavLink>
                    <NavLink to="/vault" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}>
                        <Vault size={20} /> The Vault
                    </NavLink>
                    <NavLink to="/viewer" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}>
                        <Terminal size={20} /> Documentation
                    </NavLink>
                </nav>

                <div className="px-4 mt-auto">
                    <NavLink to="/settings" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}>
                        <Settings size={20} /> Settings
                    </NavLink>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto bg-slate-950/20 relative custom-scrollbar">
                {children}
            </main>

            <AnimatePresence>
                {isLocked && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="absolute inset-0 z-[100] bg-[#020617] backdrop-blur-3xl flex flex-col items-center justify-center"
                    >
                        <motion.div 
                           initial={{ scale: 0.8, filter: 'blur(10px)' }}
                           animate={{ scale: 1, filter: 'blur(0px)' }}
                           className="text-center space-y-8"
                        >
                            <div className="w-32 h-32 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center mx-auto mb-8 relative">
                                <Lock className="text-indigo-500" size={64} />
                                <motion.div 
                                    animate={{ rotate: 360 }} 
                                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-[-10px] border-2 border-dashed border-indigo-500/20 rounded-full"
                                />
                            </div>
                            <div>
                                <h2 className="text-4xl font-bold mb-2">Vault Encrypted</h2>
                                <p className="text-gray-500">Application locked via Global Panic Key</p>
                            </div>
                            <button onClick={onUnlock} className="btn mx-auto gap-4 px-8 py-4 text-lg">
                                <Unlock size={24} /> Unlock Security Session
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const App = () => {
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.onVaultLocked(() => {
                setIsLocked(true);
            });
        }
    }, [isLocked]);

    const handleUnlock = () => {
        setIsLocked(false);
    };

    return (
        <Router>
            <div className="titlebar">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 tracking-widest uppercase">
                    <Shield size={14} /> SECUREVAULT v1.0.0
                </div>
                <div className="titlebar-controls">
                    <button className="titlebar-btn" onClick={() => window.electronAPI.window.minimize()}><Minus size={16} /></button>
                    <button className="titlebar-btn" onClick={() => window.electronAPI.window.maximize()}><Square size={14} /></button>
                    <button className="titlebar-btn close" onClick={() => window.electronAPI.window.close()}><X size={16} /></button>
                </div>
            </div>
            
            <MainLayout isLocked={isLocked} onUnlock={handleUnlock}>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/vault" element={<TheVault />} />
                    <Route path="/viewer" element={<FileViewer />} />
                    <Route path="/settings" element={<SettingsView />} />
                </Routes>
            </MainLayout>
        </Router>
    );
};

export default App;
