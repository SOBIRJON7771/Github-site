/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MapPin, 
  Plus, 
  MessageSquare, 
  User as UserIcon, 
  LogOut, 
  Trash2,
  Search, 
  Filter, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  ArrowRight,
  ShieldCheck,
  Zap,
  DollarSign,
  Users,
  TrendingUp,
  Trophy,
  Activity,
  Calendar,
  Award,
  Crown,
  ChevronRight,
  Globe,
  Share2,
  Sparkles,
  Medal,
  Baby,
  BookOpen,
  Wrench,
  ShoppingBag,
  Compass,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { auth, loginWithGoogle, logout } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { firebaseService, UserProfile, HelpRequest, Message, Mahalla, Proposal } from './services/firebaseService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow } from 'date-fns';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getKarmaTier = (karma: number) => {
  if (karma >= 500) return 'Oliy Elchi';
  if (karma >= 200) return 'Tashabbuskor';
  if (karma >= 80) return 'Yordamchi';
  if (karma >= 30) return 'Farishta';
  return 'Mahalla Do\'sti';
};

// --- Components ---

const Navbar = ({ 
  user, 
  profile, 
  onProfileClick, 
  resetView, 
  mainTab, 
  setMainTab,
  onLogin
}: { 
  user: User | null; 
  profile: UserProfile | null; 
  onProfileClick: () => void; 
  resetView: () => void; 
  mainTab: 'home' | 'feed' | 'forum' | 'ai' | 'mahallas' | 'rewards'; 
  setMainTab: (tab: 'home' | 'feed' | 'forum' | 'ai' | 'mahallas' | 'rewards') => void; 
  onLogin?: () => void;
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:py-5">
      <div className="max-w-7xl mx-auto backdrop-blur-xl bg-white/80 rounded-2xl px-5 md:px-7 py-3 md:py-3.5 flex justify-between items-center border border-slate-200/50 shadow-[0_15px_35px_-10px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.02)] transition-all">
        <div 
          onClick={() => { resetView(); setMainTab('home'); }}
          className="flex items-center gap-3 shrink-0 transition-transform active:scale-98 cursor-pointer group"
        >
          <div className="w-9 h-9 md:w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg overflow-hidden relative">
             <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <Heart size={15} fill="white" className="relative z-10 transition-transform group-hover:scale-110" />
          </div>
          <div>
            <span className="font-display font-bold text-lg md:text-xl tracking-tight block leading-none text-slate-900">CivicBridge</span>
            <span className="text-[8px] text-blue-600 font-bold uppercase tracking-widest mt-1 block opacity-80">Raqamli Ko'mak</span>
          </div>
        </div>

        {user && (
          <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'home', label: 'Tushuntirish', icon: <Compass size={13} /> },
              { id: 'feed', label: 'Yordam e\'lonlari', icon: <Heart size={13} /> },
              { id: 'forum', label: 'Munozaralar / Forum', icon: <MessageSquare size={13} /> },
              { id: 'mahallas', label: 'Mahallalar', icon: <Users size={13} /> },
              { id: 'rewards', label: 'Reyting & Sovrin', icon: <Trophy size={13} /> },
              { id: 'ai', label: 'AI Ko\'makchi', icon: <Sparkles size={13} className="text-amber-500 animate-pulse" /> },
            ].map(tab => {
              const isActive = mainTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setMainTab(tab.id as any)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 relative transition-all active:scale-95 duration-200 select-none",
                    isActive 
                      ? "text-slate-950 font-extrabold" 
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                      className="absolute inset-0 bg-white shadow-sm border border-slate-200/50 rounded-lg"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={onProfileClick}
                className="flex items-center gap-3 group transition-all"
              >
                <div className="text-right hidden md:block">
                  <p className="text-xs font-bold tracking-tight text-slate-800">
                    {profile?.displayName?.split(' ')[0]} 
                    <span className="text-blue-600 ml-1 font-extrabold">#{profile?.karma || 0} XP</span>
                  </p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{getKarmaTier(profile?.karma || 0)}</p>
                </div>
                <div className="relative">
                  <img 
                    src={user.photoURL || ''} 
                    className="w-9 h-9 rounded-xl border border-slate-200 shadow-sm transition-transform group-hover:scale-105" 
                    alt="Profile" 
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border border-white rounded-full"></div>
                </div>
              </button>
              <div className="w-px h-6 bg-slate-200 hidden md:block"></div>
              <button 
                onClick={logout}
                className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all border border-slate-100 hover:border-rose-100"
                title="Tizimdan chiqish"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button 
              onClick={onLogin || loginWithGoogle}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[11px] font-bold hover:bg-black transition-all flex items-center gap-2 active:scale-95 uppercase tracking-widest"
            >
              Kirish <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

interface RequestCardProps {
  request: HelpRequest;
  onRespond?: (id: string) => void;
  isViewOnly?: boolean;
  showNotification?: (msg: string, type?: 'success' | 'error') => void;
  onUserClick?: (u: UserProfile) => void;
}

const ChatModal = ({ request, onClose }: { request: HelpRequest; onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return firebaseService.subscribeToMessages(request.id, setMessages);
  }, [request.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !auth.currentUser) return;
    setLoading(true);
    try {
      await firebaseService.sendMessage(request.id, newMsg, auth.currentUser.uid);
      setNewMsg('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative bg-white rounded-[40px] w-full max-w-lg h-[600px] flex flex-col overflow-hidden shadow-2xl border border-slate-100">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-display font-black uppercase tracking-tight text-slate-900">{request.title}</h3>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">Chat with Neighbor</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:rotate-90 transition-transform">
            <Plus className="rotate-45" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
          {messages.map(m => (
            <div key={m.id} className={cn("flex flex-col max-w-[80%] space-y-1", m.senderId === auth.currentUser?.uid ? "ml-auto items-end" : "items-start")}>
              <div className={cn("px-4 py-3 rounded-[20px] text-sm font-medium leading-relaxed", m.senderId === auth.currentUser?.uid ? "bg-slate-900 text-white rounded-br-none" : "bg-white text-slate-800 rounded-bl-none shadow-sm")}>
                {m.text}
              </div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                {m.createdAt?.toDate ? formatDistanceToNow(m.createdAt.toDate()) + ' ago' : 'Sending...'}
              </span>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-10">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-4">
                <MessageSquare className="text-slate-200" size={32} />
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Start the conversation</p>
              <p className="text-xs text-slate-300 mt-2">Write a message to coordinate the help.</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-50 flex gap-3">
          <input 
            required 
            className="flex-1 px-5 py-4 bg-slate-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold placeholder:text-slate-300" 
            placeholder="Xabar yozing..." 
            value={newMsg} 
            onChange={e => setNewMsg(e.target.value)}
          />
          <button disabled={loading} className="w-14 h-14 flex items-center justify-center bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all disabled:opacity-50">
            <Send size={20} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const ProfileModal = ({ profile, onClose, showNotification, isReadOnly = false }: { profile: UserProfile; onClose: () => void; showNotification: (msg: string, type?: 'success' | 'error') => void; isReadOnly?: boolean }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile.displayName || '',
    bio: profile.bio || '',
    location: profile.location || '',
    skills: (profile.skills || []).join(', ')
  });
  const [loading, setLoading] = useState(false);

  // Sync form data if profile updates from subscription
  useEffect(() => {
    if (!isEditing) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        location: profile.location || '',
        skills: (profile.skills || []).join(', ')
      });
    }
  }, [profile, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await firebaseService.updateUserProfile(profile.uid, {
        displayName: formData.displayName,
        bio: formData.bio,
        location: formData.location,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      });
      showNotification('Profil muvaffaqiyatli yangilandi!');
      setIsEditing(false);
    } catch (e) {
      showNotification('Xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xl" />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-[#141517] rounded-[48px] overflow-hidden shadow-[0_100px_200px_-40px_rgba(0,0,0,0.6)] border border-white/5"
      >
        <div className="bg-slate-800/50 p-6 md:p-10 border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.3em] leading-none">Mahalla Citizen</h3>
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mt-1.5">Official Member ID Card</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              {!isReadOnly && (
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all"
                >
                  {isEditing ? 'Ortga' : 'Tahrirlash'}
                </button>
              )}
              <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
                <Plus size={24} className="rotate-45" />
              </button>
           </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">To'liq ism</label>
                <input required className="w-full px-6 py-5 bg-white/5 rounded-[24px] focus:outline-none focus:ring-2 focus:ring-blue-600 border border-white/5 text-white font-bold" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Manzil</label>
                <input className="w-full px-6 py-5 bg-white/5 rounded-[24px] focus:outline-none focus:ring-2 focus:ring-blue-600 border border-white/5 text-white font-bold" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Ko'nikmalar (vergul bilan)</label>
                <input className="w-full px-6 py-5 bg-white/5 rounded-[24px] focus:outline-none focus:ring-2 focus:ring-blue-600 border border-white/5 text-white font-bold" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} placeholder="Santehnik, Duradgor..." />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">O'zingiz haqingizda</label>
                <textarea rows={3} className="w-full px-6 py-5 bg-white/5 rounded-[24px] focus:outline-none focus:ring-2 focus:ring-blue-600 border border-white/5 text-white font-bold resize-none" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-[24px] font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 disabled:opacity-50">
              {loading ? 'Saqlanmoqda...' : 'O\'zgarishlarni saqlash'}
            </button>
          </form>
        ) : (
          <>
            <div className="p-6 md:p-10">
              <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                <div className="shrink-0 flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-600/20 blur-2xl rounded-full"></div>
                      <img src={profile.photoURL} className="relative w-32 h-40 rounded-[32px] border-4 border-slate-700 object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="" />
                      <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-slate-800 border-4 border-[#141517] rounded-full flex items-center justify-center text-yellow-400">
                        <Medal size={20} />
                      </div>
                    </div>
                    <div className="bg-blue-600/10 px-3 py-1 rounded-full border border-blue-600/20">
                      <p className="text-[8px] font-black uppercase tracking-widest text-blue-400">Verified Citizen</p>
                    </div>
                </div>

                <div className="flex-1 text-left space-y-6">
                    <div>
                      <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] block mb-1">Full Name</label>
                      <p className="text-2xl font-black text-white uppercase tracking-tight">{profile.displayName}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] block mb-1">Origin</label>
                        <p className="text-white/80 font-black text-xs uppercase tracking-widest italic flex items-center gap-2">
                           <MapPin size={10} className="text-blue-500" /> {profile.location || 'Neighbor'}
                        </p>
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] block mb-1">XP Points</label>
                        <p className="text-yellow-400 font-black text-sm tracking-widest uppercase">{profile.karma || 0} XP</p>
                      </div>
                    </div>

                    {profile.skills && profile.skills.length > 0 && (
                      <div>
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] block mb-1">Expertise</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {profile.skills.map((s, i) => (
                            <span key={i} className="text-[8px] font-black px-2 py-1 bg-white/5 rounded-lg border border-white/5 uppercase tracking-widest text-white/60">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-4 pt-10 border-t border-white/5">
                  {[
                    { label: 'Level', val: Math.floor((profile.karma || 0) / 100) + 1, icon: <Award size={14} /> },
                    { label: 'Rank', val: '#12', icon: <Trophy size={14} /> },
                    { label: 'Medals', val: 3, icon: <Medal size={14} /> }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 rounded-3xl p-4 text-center group hover:bg-blue-600/20 transition-all cursor-default">
                      <div className="text-white/40 mb-2 flex justify-center group-hover:text-blue-400 transition-colors">{stat.icon}</div>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-white font-black">{stat.val}</p>
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="p-4 bg-slate-800/30 text-center">
                <p className="text-white/10 font-mono text-[8px] uppercase tracking-[10px]">VERIFIED AUTHENTIC CITIZEN PASSPORT</p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

const RewardQuest = ({ karma }: { karma: number }) => {
  const goal = 1000;
  const progress = Math.min((karma / goal) * 100, 100);
  
  return (
    <div className="p-8 bg-slate-900 rounded-[40px] text-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/30 transition-colors" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full -ml-16 -mb-16 blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-amber-400 fill-amber-400 animate-pulse" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">FAOL YORDAMCHI QUEST</h3>
        </div>
        
        <h4 className="text-3xl font-display font-black mb-3 uppercase leading-none tracking-tight">5,000,000 UZS</h4>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-8 leading-relaxed opacity-80">
          1000 Karma XP ga erishing va mahalla taraqqiyoti uchun pul mukofotini qo'lga kiriting!
        </p>
        
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Joriy natija</p>
               <span className="text-3xl font-display font-black leading-none">{karma}</span>
               <span className="text-[12px] text-slate-500 font-black ml-1.5 uppercase tracking-widest">/ {goal} XP</span>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Progress</p>
               <span className="text-lg font-black text-blue-400">{Math.round(progress)}%</span>
            </div>
          </div>
          <div className="h-4 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 p-[3px]">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] rounded-full"
            />
          </div>
        </div>

        {/* Anti-Cheat Trust Protection Panel */}
        <div className="mt-6 pt-6 border-t border-white/5 space-y-3 text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-blue-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Adolatli XP Himoya Tizimi</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Kundalik cheklov</span>
              <span className="text-[10px] font-black text-white uppercase tracking-wider">Max 50 XP (5 ta yordam)</span>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Sheriklik cheklovi</span>
              <span className="text-[10px] font-black text-white uppercase tracking-wider">Maks 3 marta / sherik</span>
            </div>
          </div>
          <p className="text-[8px] font-extrabold text-slate-500 uppercase tracking-widest leading-relaxed">
            * 500 XP va 1000 XP darajalarida mahalla oqsoqollari va audit komissiyasi yordam tarixi, chatlar hamda xaritalarni qat'iy tekshiradi va soxtalik aniqlansa, akkaunt bloklanadi.
          </p>
        </div>
      </div>
    </div>
  );
};

const MahallaMembers = ({ mahalla, currentUid, onUserClick }: { mahalla: Mahalla; currentUid?: string; onUserClick?: (u: UserProfile) => void }) => {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    firebaseService.getUsersByUids(mahalla.members).then(data => {
      if (data) setMembers(data);
      setLoading(false);
    });
  }, [mahalla.members]);

  if (loading) return <div className="p-4 text-[10px] font-black text-slate-300 uppercase animate-pulse tracking-widest">Yuklanmoqda...</div>;

  return (
    <div className="pt-2 pb-4 px-4 space-y-4 border-t border-slate-50/10 mt-2">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Guruh a'zolari • {mahalla.members.length}</p>
      <div className="space-y-3">
        {members.map(m => (
          <div 
            key={m.uid} 
            onClick={() => onUserClick?.(m)}
            className="flex items-center justify-between group/m cursor-pointer hover:bg-slate-50/10 p-2 rounded-2xl transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={m.photoURL} className="w-8 h-8 rounded-xl border border-slate-100 object-cover" alt="" />
                {m.uid === mahalla.ownerId && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center">
                    <ShieldCheck size={8} className="text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className={cn("text-[11px] font-bold tracking-tight", m.uid === currentUid ? "text-blue-600" : "text-slate-700")}>
                  {m.displayName}
                  {m.uid === currentUid && <span className="ml-1 opacity-50">(Men)</span>}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{m.karma} XP</p>
                </div>
              </div>
            </div>
            {m.karma > 100 && (
              <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                <Zap size={10} className="text-blue-500" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const AnnouncementCard = ({ mahalla, currentUid, onUpdate }: { mahalla: Mahalla; currentUid?: string; onUpdate: (announcement: string) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(mahalla.announcement || '');
  const isOwner = mahalla.ownerId === currentUid;

  useEffect(() => {
    setText(mahalla.announcement || '');
  }, [mahalla.announcement]);

  const handleSave = () => {
    onUpdate(text);
    setIsEditing(false);
  };

  if (!mahalla.announcement && !isOwner) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 rounded-[32px] premium-shadow relative overflow-hidden",
        isOwner ? "bg-blue-600 text-white" : "bg-white border border-slate-100"
      )}
    >
      {isOwner && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      )}
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className={cn("text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2", isOwner ? "text-blue-100" : "text-slate-400")}>
          <Sparkles size={14} className={isOwner ? "text-blue-200" : "text-blue-500"} /> Guruh E'loni
        </h3>
        {isOwner && (
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="text-[9px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-all"
          >
            {isEditing ? 'Yopish' : 'Tahrirlash'}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4 relative z-10">
          <textarea 
            className="w-full bg-white/10 border-none rounded-2xl p-4 text-sm font-bold placeholder:text-white/40 focus:ring-2 focus:ring-white/20 text-white outline-none"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Guruh a'zolari uchun muhim xabar yo'zing..."
          />
          <button 
            onClick={handleSave}
            className="bg-white text-blue-600 w-full py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-50 active:scale-95 transition-all shadow-xl shadow-black/10"
          >
            E'lonni yangilash
          </button>
        </div>
      ) : (
        <div className="relative z-10">
          {mahalla.announcement ? (
            <p className={cn("text-sm font-bold leading-relaxed", isOwner ? "text-white" : "text-slate-700")}>
              {mahalla.announcement}
            </p>
          ) : (
            <div className="flex items-center justify-center py-4 border border-dashed border-white/20 rounded-2xl">
               <p className="text-blue-100 font-bold text-[10px] uppercase tracking-widest opacity-60">Sizda hali e'lon yo'q</p>
            </div>
          )}
          
          {mahalla.description && !isEditing && (
            <div className={cn("mt-4 pt-4 border-t", isOwner ? "border-white/10" : "border-slate-100")}>
              <p className={cn("text-[10px] font-bold leading-relaxed opacity-60", isOwner ? "text-white" : "text-slate-500")}>
                {mahalla.description}
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};


const PremiumLeaderboard = ({ mahalla, onUserClick }: { mahalla: Mahalla; onUserClick?: (u: UserProfile) => void }) => {
  const [topMembers, setTopMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopMembers = async () => {
      setLoading(true);
      const members = await firebaseService.getMahallaMembersProfiles(mahalla.members);
      setTopMembers(members);
      setLoading(false);
    };
    fetchTopMembers();
  }, [mahalla]);

  if (loading) return (
    <div className="p-8 bg-white border border-slate-100 rounded-[44px] animate-pulse">
      <div className="h-4 w-32 bg-slate-100 rounded mb-6"></div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-2xl"></div>)}
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-white border border-slate-100 rounded-[44px] premium-shadow relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
          <Trophy size={16} className="text-yellow-500" /> Top Yordamchilar
        </h3>
        <div className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-yellow-100/50">
          Reyting
        </div>
      </div>

      <div className="space-y-3">
        {topMembers.slice(0, 5).map((member, index) => (
          <div 
            key={member.uid}
            onClick={() => onUserClick?.(member)}
            className={cn(
              "p-4 rounded-3xl flex items-center justify-between transition-all group hover:scale-[1.02] cursor-pointer",
              index === 0 ? "bg-slate-900 text-white" : "bg-slate-50 border border-slate-100"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={member.photoURL} alt="" className="w-10 h-10 rounded-2xl object-cover shrink-0" />
                {index === 0 && <Crown size={14} className="absolute -top-1.5 -right-1.5 text-yellow-400 fill-yellow-400 rotate-12" />}
              </div>
              <div>
                <p className={cn("text-xs font-black tracking-tight uppercase", index === 0 ? "text-white" : "text-slate-800")}>
                  {member.displayName}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className={cn("w-1.5 h-1.5 rounded-full", index === 0 ? "bg-white/40" : "bg-blue-600/40")}></div>
                   <p className={cn("text-[8px] font-bold uppercase tracking-wider", index === 0 ? "text-white/60" : "text-blue-600/60")}>
                    {index === 0 ? 'Mahalla Sardori' : 'Faol A\'zo'}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={cn("text-sm font-black tracking-tighter", index === 0 ? "text-yellow-400" : "text-blue-600")}>
                {member.karma || 0} XP
              </p>
              <div className="flex justify-end gap-0.5 mt-0.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className={cn("w-2 h-0.5 rounded-full", i <= (3 - index) ? (index === 0 ? "bg-yellow-400" : "bg-blue-600") : "bg-slate-200")}></div>
                ))}
              </div>
            </div>
          </div>
        ))}
        {topMembers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Hali a'zolar yo'q</p>
          </div>
        )}
      </div>
    </div>
  );
};

const MahallaWall = ({ mahallaId }: { mahallaId: string }) => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    return firebaseService.subscribeToEvents(mahallaId, setEvents);
  }, [mahallaId]);

  return (
    <div className="p-8 bg-white border border-slate-100 rounded-[44px] premium-shadow">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
          <Activity size={16} className="text-blue-500" /> Guruh Yangiliklari
        </h3>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-100"></div>
        <div className="space-y-8">
          {events.map((event) => (
            <div key={event.id} className="relative pl-12 group">
              <div className="absolute left-4 top-1 w-4 h-4 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center -translate-x-1/2 z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 group-hover:scale-150 transition-transform"></div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                  {event.timestamp ? formatDistanceToNow(event.timestamp.toDate(), { addSuffix: true }) : 'Hozirgina'}
                </p>
                <p className="text-xs font-bold leading-relaxed text-slate-700">
                  <span className="text-slate-900">{event.userName}</span> {event.description}
                </p>
                {event.type === 'help_completed' && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-50 rounded-xl border border-green-100">
                    <Medal size={10} className="text-green-600" />
                    <span className="text-[8px] font-black uppercase text-green-700 tracking-widest">+10 Karma issued</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="text-center py-12">
               <div className="w-12 h-12 bg-slate-50 rounded-2xl mx-auto flex items-center justify-center text-slate-200 mb-4">
                  <Clock size={24} />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Hali yangiliklar yo'q</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const RequestCard = (props: RequestCardProps & { onOpenChat?: (r: HelpRequest) => void, onComplete?: (r: HelpRequest) => void }) => {
  const { request, onRespond, isViewOnly = false, showNotification, onOpenChat, onComplete, onUserClick } = props;
  const isOwner = auth.currentUser?.uid === request.requesterId;
  const isAssignee = auth.currentUser?.uid === request.assigneeId;
  const [completing, setCompleting] = useState(false);
  const [requester, setRequester] = useState<UserProfile | null>(null);
  const [assigneeProfile, setAssigneeProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let active = true;
    if (request.requesterId) {
      firebaseService.getUserProfile(request.requesterId).then(p => {
        if (p && active) setRequester(p);
      });
    }
    return () => { active = false; };
  }, [request.requesterId]);

  useEffect(() => {
    let active = true;
    if (request.assigneeId) {
      firebaseService.getUserProfile(request.assigneeId).then(p => {
        if (p && active) setAssigneeProfile(p);
      });
    }
    return () => { active = false; };
  }, [request.assigneeId]);

  const handleComplete = async () => {
    if (!request.assigneeId) return;
    setCompleting(true);
    try {
      if (onComplete) {
        await onComplete(request);
      } else {
        await firebaseService.completeRequest(request.id, request.assigneeId);
        showNotification?.('Muvaffaqiyatli yakunlandi!');
      }
    } catch (e) {
      console.error(e);
      showNotification?.('Xatolik yuz berdi.');
    } finally {
      setCompleting(false);
    }
  };

  const urgencyColors = {
    low: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20',
    medium: 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20',
    high: 'bg-rose-50 text-rose-600 ring-1 ring-rose-500/20'
  };

  const statusTags = {
    open: 'bg-sky-50 text-sky-600 ring-1 ring-sky-500/20',
    assigned: 'bg-violet-50 text-violet-600 ring-1 ring-violet-500/20',
    completed: 'bg-slate-900 text-white',
    cancelled: 'bg-slate-100 text-slate-400'
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    errands: <Search size={12} />,
    repairs: <Zap size={12} />,
    tutoring: <UserIcon size={12} />,
    childcare: <Users size={12} />,
    'elderly care': <Heart size={12} />,
    other: <Plus size={12} />
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative bg-white border border-slate-100 rounded-[40px] p-8 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.06)] transition-all flex flex-col h-full overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50/50 to-transparent -mr-16 -mt-16 rounded-full blur-2xl group-hover:bg-blue-100/50 transition-colors"></div>
      
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className="flex flex-wrap gap-2">
          <div className={cn("px-3 py-1 rounded-[12px] text-[10px] font-black uppercase tracking-wider", urgencyColors[request.urgency])}>
            {request.urgency}
          </div>
          <div className={cn("px-3 py-1 rounded-[12px] text-[10px] font-black uppercase tracking-wider", statusTags[request.status])}>
            {request.status}
          </div>
          <div className="px-3 py-1 rounded-[12px] text-[10px] font-black uppercase tracking-wider bg-slate-50 text-slate-400 flex items-center gap-1.5 border border-slate-100">
            {categoryIcons[request.category] || <Plus size={12} />}
            {request.category}
          </div>
        </div>
        <div className="flex items-center text-[10px] font-black text-slate-300 gap-1.5 uppercase tracking-widest">
          <Clock size={12} />
          {formatDistanceToNow(request.createdAt?.toDate() || new Date())}
        </div>
      </div>

      <div className="relative z-10 flex flex-col h-full text-left">
        {requester && (
          <div 
            onClick={() => onUserClick?.(requester)}
            className="flex items-center gap-3 mb-4 p-2 bg-slate-50/50 hover:bg-blue-50/30 rounded-2xl cursor-pointer transition-all border border-slate-100/50 group/req max-w-fit"
          >
            <img src={requester.photoURL} className="w-7 h-7 rounded-full object-cover border border-white shadow-sm shrink-0" alt="" />
            <div className="text-left min-w-0 pr-2">
              <p className="text-[10px] font-black tracking-tight text-slate-700 uppercase group-hover/req:text-blue-600 transition-colors leading-none">{requester.displayName}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-1 leading-none">{requester.karma || 0} XP • {getKarmaTier(requester.karma || 0)}</p>
            </div>
          </div>
        )}
        <h3 className="text-2xl font-display font-black mb-4 leading-[1.1] text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{request.title}</h3>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium line-clamp-3 break-words">{request.description}</p>

        <div className="flex flex-wrap gap-3 mb-10">
          <div className="flex items-center gap-2 text-[10px] font-black bg-slate-50 px-4 py-2 rounded-2xl text-slate-500 uppercase tracking-widest border border-slate-100">
             <MapPin size={12} className="text-slate-900" />
             {request.location || 'Local Neighbors'}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black bg-slate-50 px-4 py-2 rounded-2xl text-slate-500 uppercase tracking-widest border border-slate-100">
             {request.type === 'paid' ? <DollarSign size={12} className="text-emerald-600" /> : <Zap size={12} className="text-amber-500" />}
             {request.type === 'paid' ? `Budget: $${request.budget}` : 'Volunteer Basis'}
          </div>
        </div>

        {assigneeProfile && (
          <div 
            onClick={() => onUserClick?.(assigneeProfile)}
            className="flex items-center gap-3 mb-4 p-3 bg-indigo-50/40 hover:bg-indigo-50/80 rounded-2xl cursor-pointer transition-all border border-indigo-100/50 group/as text-left"
          >
            <img src={assigneeProfile.photoURL} className="w-6 h-6 rounded-xl object-cover shrink-0" alt="" />
            <div>
              <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Tanlangan yordamchi</p>
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight group-hover/as:text-indigo-600 transition-colors leading-none">{assigneeProfile.displayName}</p>
            </div>
          </div>
        )}

        <div className="pt-8 border-t border-[#F1F5F9] mt-auto flex flex-col gap-3">
          {(isOwner || isAssignee) && request.status === 'assigned' && onOpenChat && (
            <button 
              onClick={() => onOpenChat(request)}
              className="w-full py-4 bg-blue-50 text-blue-600 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-100 transition-all font-sans"
            >
              <MessageSquare size={14} /> Xabarlarni ko'rish
            </button>
          )}

          {!isViewOnly && request.status === 'open' && !isOwner && (
            <button 
              onClick={() => onRespond?.(request.id)}
              className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] active:scale-95"
            >
              Yordam Berish <ArrowRight size={14} />
            </button>
          )}
          
          {isOwner && request.status === 'assigned' && (
            <button 
              onClick={handleComplete}
              disabled={completing}
              className="w-full py-5 bg-emerald-500 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] active:scale-95 disabled:opacity-50"
            >
              {completing ? 'Tasdiqlash...' : 'Yordam oldim (+Karma)'}
            </button>
          )}

          {request.status === 'completed' && (
            <div className="w-full py-5 bg-slate-50 text-slate-400 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 border border-slate-100">
              <CheckCircle size={14} className="text-emerald-500" /> Bajarildi
            </div>
          )}

          {isOwner && request.status === 'open' && (
            <div className="w-full py-5 border-2 border-dashed border-slate-100 text-slate-300 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center">
              Kutilmoqda...
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const CreateMahallaModal = ({ onClose, showNotification }: { onClose: () => void; showNotification: (msg: string, type?: 'success' | 'error') => void }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await firebaseService.createMahalla(formData.name, formData.description, auth.currentUser.uid);
      showNotification('Guruh muvaffaqiyatli yaratildi!');
      onClose();
    } catch (err) {
      console.error(err);
      showNotification('Xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[160] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[48px] w-full max-w-md p-6 md:p-10 shadow-2xl border border-slate-100">
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-3xl font-display font-black uppercase tracking-tight">Yangi Guruh</h2>
           <button onClick={onClose} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:rotate-90 transition-transform">
              <Plus className="rotate-45" size={20} />
           </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mahalla Nomi</label>
            <input required className="w-full px-6 py-5 bg-slate-50 rounded-[24px] border-none focus:ring-2 focus:ring-blue-600 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Masalan: Alisher Navoiy ko'chasi" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tavsif (Ixtiyoriy)</label>
            <textarea rows={3} className="w-full px-6 py-5 bg-slate-50 rounded-[24px] border-none focus:ring-2 focus:ring-blue-600 font-bold resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Jamoangiz haqida qisqacha..." />
          </div>
          <button type="submit" disabled={loading} className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-blue-600 disabled:opacity-50 transition-all shadow-xl">
            {loading ? 'Yaratilmoqda...' : 'Guruhni yaratish'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const InviteMemberModal = ({ mahalla, onClose, showNotification }: { mahalla: Mahalla; onClose: () => void; showNotification: (msg: string, type?: 'success' | 'error') => void }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess(false);
    try {
      const targetUser = await firebaseService.findUserByEmail(email);
      if (!targetUser) {
        setError('Foydalanuvchi topilmadi. Avval CivicBridge-ga kirganiga ishonch hosil qiling.');
      } else if (mahalla.members.includes(targetUser.uid)) {
        setError('Bu foydalanuvchi allaqachon a\'zo.');
      } else {
        await firebaseService.addMemberToMahalla(mahalla.id, targetUser.uid);
        showNotification(`${targetUser.displayName} ${mahalla.name} guruhiga qo'shildi`);
        setSuccess(true);
        setEmail('');
      }
    } catch (err) {
      setError('A\'zo qo\'shishda xatolik.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl">
        <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">Qo'shni taklif qilish</h2>
        <p className="text-gray-400 text-sm mb-6 uppercase font-bold tracking-tighter">{mahalla.name} guruhiga</p>
        
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="relative">
            <input 
               type="email" required 
               className="w-full px-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black pr-12" 
               value={email} onChange={e => setEmail(e.target.value)} 
               placeholder="Qo'shnining Google emaili..." 
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"><Plus size={20} /></div>
          </div>
          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
          {success && <p className="text-green-600 text-xs font-bold">Muvaffaqiyatli qo'shildi!</p>}
          <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all">
            {loading ? 'Qidirilmoqda...' : 'Email orqali qo\'shish'}
          </button>
          <button type="button" onClick={onClose} className="w-full py-2 text-gray-400 font-bold text-xs uppercase tracking-widest">Tayyor</button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const CreateRequestModal = ({ onClose, mahallas, showNotification }: { onClose: () => void; mahallas: Mahalla[]; showNotification: (msg: string, type?: 'success' | 'error') => void }) => {
  const [loading, setLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other' as HelpRequest['category'],
    type: 'voluntary' as HelpRequest['type'],
    urgency: 'medium' as HelpRequest['urgency'],
    budget: '',
    location: '',
    mahallaId: ''
  });

  const [isMahallaOpen, setIsMahallaOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  const categoryLabels: Record<string, string> = {
    errands: "Bozorlik / Yumush",
    repairs: "Ta'mirlash",
    tutoring: "O'qitish",
    childcare: "Bolalar parvarishi",
    'elderly care': "Keksalar yordami",
    other: "Boshqa"
  };

  const handleAiSuggest = async () => {
    if (!formData.title || !formData.description) {
      showNotification('Iltimos, avval sarlavha va tavsifni yozing.', 'error');
      return;
    }
    
    setIsAiLoading(true);
    try {
      const response = await fetch('/api/ai/suggest-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formData.title, description: formData.description })
      });
      const data = await response.json();
      if (data.suggestedTitle && data.suggestedDescription) {
        setFormData({
          ...formData,
          title: data.suggestedTitle,
          description: data.suggestedDescription
        });
        showNotification('AI taklifi muvaffaqiyatli qo\'llanildi!', 'success');
      }
    } catch (err) {
      console.error(err);
      showNotification('AI bilan bog\'lanishda xatolik.', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const budgetVal = formData.type === 'paid' ? Number(formData.budget) : undefined;
      await firebaseService.createRequest({
        ...formData,
        mahallaId: formData.mahallaId || undefined,
        requesterId: auth.currentUser.uid,
        budget: isNaN(budgetVal as any) ? undefined : budgetVal
      });
      
      if (formData.mahallaId && auth.currentUser) {
        await firebaseService.logEvent(
          formData.mahallaId, 
          'request_created', 
          `yordam uchun yangi so'rov joyladi: "${formData.title}"`,
          auth.currentUser.uid,
          auth.currentUser.displayName || 'Neighbor'
        );
      }

      showNotification('Muvaffaqiyatli! So\'rovingiz e\'lon qilindi.');
      onClose();
    } catch (err) {
      console.error(err);
      showNotification('Xatolik! E\'lonni joylashda xato yuz berdi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 40 }}
        className="relative bg-white rounded-[56px] w-full max-w-xl overflow-hidden shadow-[0_80px_160px_-40px_rgba(0,0,0,0.4)] border border-slate-100 flex flex-col max-h-[90vh]"
      >
        <div className="p-6 md:p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-4xl font-display font-black tracking-tight uppercase leading-none">YORDAM SO'RASH</h2>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-2">Create a new help request</p>
          </div>
          <button onClick={onClose} className="w-14 h-14 flex items-center justify-center bg-white rounded-full shadow-lg hover:rotate-90 transition-all duration-500 hover:bg-slate-50">
            <Plus className="rotate-45" size={28} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8 overflow-y-auto custom-scrollbar">
             <div className="space-y-4">
               <div className="flex items-center justify-between ml-1">
                 <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Sarlavha</label>
                 <button 
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={isAiLoading}
                  className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors disabled:opacity-50"
                 >
                   <Sparkles size={12} className={isAiLoading ? "animate-spin" : ""} />
                   {isAiLoading ? 'AI taklif qilmoqda...' : 'AI bilan yaxshilash'}
                 </button>
               </div>
               <input 
                 required
                 placeholder="Masalan: Bozorlikka yordam kerak"
                 className="w-full px-8 py-6 bg-slate-50 rounded-[28px] focus:outline-none focus:ring-4 focus:ring-blue-100 border border-transparent focus:border-blue-600 transition-all font-bold text-lg placeholder:text-slate-300"
                 value={formData.title}
                 onChange={(e) => setFormData({...formData, title: e.target.value})}
               />
             </div>
             
             <div className="space-y-2">
               <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Batafsil ma'lumot</label>
               <textarea 
                 required
                 rows={4}
                 placeholder="Vaqt, joy va boshqa tafsilotlar..."
                 className="w-full px-8 py-6 bg-slate-50 rounded-[28px] focus:outline-none focus:ring-4 focus:ring-blue-100 border border-transparent focus:border-blue-600 transition-all resize-none font-bold text-base placeholder:text-slate-300 leading-relaxed"
                 value={formData.description}
                 onChange={(e) => setFormData({...formData, description: e.target.value})}
               />
             </div>

           <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Ko'rinish</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsMahallaOpen(!isMahallaOpen);
                    setIsCategoryOpen(false);
                    setIsTypeOpen(false);
                  }}
                  className="w-full px-6 py-5 bg-slate-50 hover:bg-slate-100 rounded-[24px] border border-transparent hover:border-slate-200 transition-all text-left font-bold text-sm flex items-center justify-between select-none"
                >
                  <span className="truncate">
                    {formData.mahallaId ? (mahallas.find(m => m.id === formData.mahallaId)?.name) : "Umumiy (Hamma uchun)"}
                  </span>
                  <ChevronRight className={cn("text-slate-400 transition-transform duration-200 shrink-0", isMahallaOpen ? "rotate-90 text-slate-900" : "rotate-0")} size={15} />
                </button>
                
                {isMahallaOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsMahallaOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute left-0 right-0 mt-2 bg-white rounded-[24px] border border-slate-100 shadow-[0_20px_40px_rgba(15,23,42,0.12)] p-2 z-50 max-h-[180px] overflow-y-auto scrollbar-none"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, mahallaId: '' });
                          setIsMahallaOpen(false);
                        }}
                        className={cn(
                          "w-full px-4 py-3 rounded-[16px] text-xs font-bold text-left hover:bg-slate-50 transition-all flex items-center justify-between",
                          !formData.mahallaId ? "bg-slate-50 text-blue-600" : "text-slate-600"
                        )}
                      >
                        <span>Umumiy (Hamma uchun)</span>
                        {!formData.mahallaId && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                      </button>
                      {mahallas.map(m => {
                        const isSelected = formData.mahallaId === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, mahallaId: m.id });
                              setIsMahallaOpen(false);
                            }}
                            className={cn(
                              "w-full px-4 py-3 rounded-[16px] text-xs font-bold text-left hover:bg-slate-50 transition-all mt-1 flex items-center justify-between",
                              isSelected ? "bg-slate-50 text-blue-600" : "text-slate-600"
                            )}
                          >
                            <span className="truncate">{m.name}</span>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Kategoriyasi</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryOpen(!isCategoryOpen);
                    setIsMahallaOpen(false);
                    setIsTypeOpen(false);
                  }}
                  className="w-full px-6 py-5 bg-slate-50 hover:bg-slate-100 rounded-[24px] border border-transparent hover:border-slate-200 transition-all text-left font-bold text-sm flex items-center justify-between select-none"
                >
                  <span className="truncate">
                    {categoryLabels[formData.category] || "Boshqa"}
                  </span>
                  <ChevronRight className={cn("text-slate-400 transition-transform duration-200 shrink-0", isCategoryOpen ? "rotate-90 text-slate-900" : "rotate-0")} size={15} />
                </button>
                
                {isCategoryOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute left-0 right-0 mt-2 bg-white rounded-[24px] border border-slate-100 shadow-[0_20px_40px_rgba(15,23,42,0.12)] p-2 z-50 max-h-[180px] overflow-y-auto scrollbar-none"
                    >
                      {Object.entries(categoryLabels).map(([key, label]) => {
                        const isSelected = formData.category === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, category: key as any });
                              setIsCategoryOpen(false);
                            }}
                            className={cn(
                              "w-full px-4 py-3 rounded-[16px] text-xs font-bold text-left hover:bg-slate-50 transition-all mt-1 flex items-center justify-between",
                              isSelected ? "bg-slate-50 text-blue-600" : "text-slate-600"
                            )}
                          >
                            <span>{label}</span>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Turi</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsTypeOpen(!isTypeOpen);
                    setIsMahallaOpen(false);
                    setIsCategoryOpen(false);
                  }}
                  className="w-full px-6 py-5 bg-slate-50 hover:bg-slate-100 rounded-[24px] border border-transparent hover:border-slate-200 transition-all text-left font-bold text-sm flex items-center justify-between select-none"
                >
                  <span className="truncate">
                    {formData.type === 'paid' ? "Pullik (Budjetlik)" : "Ixtiyoriy (Savob)"}
                  </span>
                  <ChevronRight className={cn("text-slate-400 transition-transform duration-200 shrink-0", isTypeOpen ? "rotate-90 text-slate-900" : "rotate-0")} size={15} />
                </button>
                
                {isTypeOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsTypeOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute left-0 right-0 mt-2 bg-white rounded-[24px] border border-slate-100 shadow-[0_20px_40px_rgba(15,23,42,0.12)] p-2 z-50 max-h-[180px] overflow-y-auto scrollbar-none"
                    >
                      {[
                        { key: 'voluntary', label: 'Ixtiyoriy (Savob uchun)' },
                        { key: 'paid', label: 'Pullik xizmat (Budjetlik)' }
                      ].map(t => {
                        const isSelected = formData.type === t.key;
                        return (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, type: t.key as any });
                              setIsTypeOpen(false);
                            }}
                            className={cn(
                              "w-full px-4 py-3 rounded-[16px] text-xs font-bold text-left hover:bg-slate-50 transition-all mt-1 flex items-center justify-between",
                              isSelected ? "bg-slate-50 text-blue-600" : "text-slate-600"
                            )}
                          >
                            <span>{t.label}</span>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-2">
               <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Budjet ($)</label>
               <input 
                 type="number"
                 placeholder="0"
                 disabled={formData.type === 'voluntary'}
                 className="w-full px-8 py-5 bg-slate-50 rounded-[24px] focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed border border-transparent"
                 value={formData.budget}
                 onChange={(e) => setFormData({...formData, budget: e.target.value})}
               />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="group relative w-full py-7 bg-slate-900 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.4em] mt-6 transition-all shadow-[0_30px_60px_-10px_rgba(0,0,0,0.3)] hover:bg-blue-600 active:scale-[0.98] disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px]"></div>
            <span className="relative z-10 flex items-center justify-center gap-3">
              {loading ? 'JOYLANMOQDA...' : 'E\'LONNI JOYLASH'}
              {!loading && <ArrowRight size={18} className="translate-y-[-1px]" />}
            </span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- Custom Confirm Modal ---
const ConfirmModal = ({ 
  title, 
  message, 
  confirmText, 
  cancelText = "Yopish", 
  onConfirm, 
  onClose,
  isDestructive = false
}: { 
  title: string; 
  message: string; 
  confirmText: string; 
  cancelText?: string; 
  onConfirm: () => void; 
  onClose: () => void;
  isDestructive?: boolean;
}) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-100 p-6 md:p-8 text-center"
      >
        <div className={cn(
          "w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-5",
          isDestructive ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-500"
        )}>
          {isDestructive ? <AlertTriangle size={22} /> : <HelpCircle size={22} />}
        </div>
        
        <h3 className="text-slate-900 font-bold text-base mb-2">{title}</h3>
        <p className="text-slate-500 text-xs leading-relaxed mb-6">{message}</p>
        
        <div className="flex gap-3 justify-center">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-50 hover:bg-slate-105 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors border border-slate-100"
          >
            {cancelText}
          </button>
          <button 
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              "flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-[0.98]",
              isDestructive ? "bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/10" : "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/10"
            )}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [myRequests, setMyRequests] = useState<HelpRequest[]>([]);
  const [mahallas, setMahallas] = useState<Mahalla[]>([]);
  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);
  const [activeMahalla, setActiveMahalla] = useState<Mahalla | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Barcha turlar');
  const [isChatOpen, setIsChatOpen] = useState<HelpRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMahallaModalOpen, setIsMahallaModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<Mahalla | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'my-activity'>('browse');
  const [mainTab, setMainTab] = useState<'home' | 'feed' | 'forum' | 'ai' | 'mahallas' | 'rewards'>('home');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isMahallaDropdownOpen, setIsMahallaDropdownOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText?: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  } | null>(null);

  // New features states
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isCreateProposalModalOpen, setIsCreateProposalModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatbotMessages, setChatbotMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: 'Sizga salom! Men "CivicBridge AI Ko\'makdosh"man. Mahalla hayotini obodonlashtirish bo\'yicha yozmoqchi bo\'lgan taklifingiz bormi? Yoki qo\'shnilar bilan biror tushunmovchilikni hal qilishda maslahat kerakmi? Savolingizni bering, sizga jon-dildan ko\'maklashaman! 🤝' }
  ]);
  const [isChatbotLoading, setIsChatbotLoading] = useState(false);
  const [chatbotInput, setChatbotInput] = useState('');
  const [proposalSearchQuery, setProposalSearchQuery] = useState('');
  const [proposalCategory, setProposalCategory] = useState('Barcha turlar');
  const [mapViewActive, setMapViewActive] = useState(false);
  const [activeMapPin, setActiveMapPin] = useState<HelpRequest | null>(null);

  // Proposal Creation states
  const [isCreatingInline, setIsCreatingInline] = useState(false);
  const [newPropTitle, setNewPropTitle] = useState('');
  const [newPropDesc, setNewPropDesc] = useState('');
  const [newPropCat, setNewPropCat] = useState<'ecology' | 'infrastructure' | 'events' | 'charity' | 'other'>('infrastructure');

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         req.description.toLowerCase().includes(searchQuery.toLowerCase());
    const catMap: Record<string, string> = {
      'Barcha turlar': 'all',
      'Yumushlar': 'errands',
      'Ta\'mirlash': 'repairs',
      'Dars tayyorlash': 'tutoring',
      'Bolalar': 'childcare',
      'Qariyalar': 'elderly care',
      'Boshqa': 'other'
    };
    const targetCat = catMap[activeCategory];
    const matchesCategory = targetCat === 'all' || req.category === targetCat;
    return matchesSearch && matchesCategory;
  });

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const copyToClipboard = (mahallaId: string) => {
    const link = `${window.location.origin}/?join=${mahallaId}`;
    navigator.clipboard.writeText(link);
    showNotification('Guruhga qo\'shilish havolasi nusxalandi!');
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error?.code === 'auth/unauthorized-domain' || error?.message?.includes('auth/unauthorized-domain')) {
        showNotification(
          "Ushbu Vercel domeningiz Firebase loyihangizda ruxsat etilgan domenlar (Authorized Domains) ro'yxatiga qo'shilmagan! Iltimos, Firebase Console -> Authentication -> Settings sahifasidan ushbu domenni ruxsat etilgan domenlarga qo'shing.", 
          'error'
        );
      } else if (error?.code === 'auth/popup-blocked') {
        showNotification(
          "Brauzer kutilmaganda login oynasini blokladi (Popup blocked). Iltimos, brauzer sozlamalaridan xabarlarga va popupga ruxsat bering.", 
          'error'
        );
      } else if (error?.code === 'auth/cancelled-popup-request' || error?.code === 'auth/popup-closed-by-user') {
        // user closed popup, no error needed to avoid annoying notifications
        console.warn("User closed or cancelled the google authentication popup.");
      } else {
        showNotification(
          `Tizimga kirishda xatolik yuz berdi: ${error?.message || error}`, 
          'error'
        );
      }
    }
  };

  const handleLeaveMahalla = async (mahallaId: string) => {
    if (!user) return;
    setConfirmModal({
      isOpen: true,
      title: "Guruhdan chiqish",
      message: "Haqiqatan ham ushbu guruhni tark etmoqchimisiz?",
      confirmText: "Chiqish",
      cancelText: "Bekor qilish",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await firebaseService.leaveMahalla(mahallaId, user.uid);
          showNotification('Guruhdan chiqdingiz.');
          if (activeMahalla?.id === mahallaId) {
            setActiveMahalla(null);
          }
        } catch (e: any) {
          let errorMessage = 'Xatolik yuz berdi';
          try {
            if (e.message && e.message.startsWith('{')) {
              const parsed = JSON.parse(e.message);
              errorMessage = parsed.error || errorMessage;
            } else {
              errorMessage = e.message || errorMessage;
            }
          } catch (parseErr) {
            errorMessage = e.message || errorMessage;
          }
          showNotification(errorMessage, 'error');
        }
      }
    });
  };

  const handleDeleteMahalla = async (mahallaId: string) => {
    if (!user) return;
    setConfirmModal({
      isOpen: true,
      title: "Mahallani o'chirish",
      message: "Haqiqatan ham ushbu mahallani (guruhni) va uning barcha e'lonlarini butunlay o'chirib tashlamoqchimisiz? Ushbu amaldan so'ng ma'lumotlarni qayta tiklab bo'lmaydi!",
      confirmText: "O'chirish",
      cancelText: "Bekor qilish",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await firebaseService.deleteMahalla(mahallaId, user.uid);
          showNotification('Guruh muvaffaqiyatli o\'chirildi.');
          if (activeMahalla?.id === mahallaId) {
            setActiveMahalla(null);
          }
        } catch (e: any) {
          let errorMessage = 'Xatolik yuz berdi';
          try {
            if (e.message && e.message.startsWith('{')) {
              const parsed = JSON.parse(e.message);
              if (parsed.error && parsed.error.includes('Missing or insufficient permissions')) {
                errorMessage = 'Ruxsat etilmadi: Faqat guruh yaratuvchisi ushbu guruhni o\'chira oladi.';
              } else {
                errorMessage = parsed.error || errorMessage;
              }
            } else {
              errorMessage = e.message || errorMessage;
            }
          } catch (parseErr) {
            errorMessage = e.message || errorMessage;
          }
          showNotification(errorMessage, 'error');
        }
      }
    });
  };

  const handleUpdateAnnouncement = async (mahallaId: string, announcement: string) => {
    try {
      await firebaseService.updateMahalla(mahallaId, { announcement });
      showNotification('Guruh e\'loni yangilandi.');
    } catch (e: any) {
      showNotification('E\'lonni yangilashda xatolik yuz berdi.', 'error');
    }
  };

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;
    
    // Fail-safe: ensure the app is loaded within 2.5 seconds regardless of Firebase connectivity
    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 2500);
    
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // Real-time profile subscription
        unsubProfile = firebaseService.subscribeToUserProfile(u.uid, (p) => {
          setProfile(p);
        });

        firebaseService.ensureUserProfile(u).then(() => {
          // Check for join mahalla link
          const params = new URLSearchParams(window.location.search);
          const joinId = params.get('join');
          if (joinId) {
            firebaseService.addMemberToMahalla(joinId, u.uid)
              .then(() => {
                showNotification('Guruhga muvaffaqiyatli qo\'shildingiz!');
                window.history.replaceState({}, document.title, "/");
              })
              .catch(console.error);
          }
        }).catch(err => {
          console.error("Profile check failed", err);
        }).finally(() => {
          setIsLoaded(true);
        });
      } else {
        setProfile(null);
        unsubProfile?.();
        setIsLoaded(true);
      }
    });

    return () => {
      clearTimeout(fallbackTimer);
      unsubAuth();
      unsubProfile?.();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    
    let unsubRequests: () => void;
    if (activeMahalla) {
      unsubRequests = firebaseService.subscribeToMahallaRequests(activeMahalla.id, setRequests);
    } else {
      unsubRequests = firebaseService.subscribeToPublicRequests(setRequests);
    }

    const unsubMine = firebaseService.subscribeToUserRequests(user.uid, setMyRequests);
    const unsubMahallas = firebaseService.subscribeToUserMahallas(user.uid, setMahallas);
    const unsubProposals = firebaseService.subscribeToAllProposals(setProposals);

    return () => {
      unsubRequests?.();
      unsubMine();
      unsubMahallas();
      unsubProposals();
    };
  }, [user, activeMahalla]);

  useEffect(() => {
    firebaseService.getTopUsers(5).then(users => {
      if (users) setTopUsers(users);
    });
  }, [requests]);

  const handleRespond = async (requestId: string) => {
    if (!user) {
      handleGoogleLogin();
      return;
    }
    try {
      const request = requests.find(r => r.id === requestId);
      await firebaseService.assignRequest(requestId, user.uid);
      
      if (request?.mahallaId) {
        await firebaseService.logEvent(
          request.mahallaId,
          'help_responded',
          `"${request.title}" so'roviga yordam berishga rozilik bildirdi`,
          user.uid,
          user.displayName || 'Neighbor'
        );
      }

      showNotification('Yordam so\'rovi qabul qilindi! Omad.');
    } catch (e) {
      showNotification('Xatolik yuz berdi.', 'error');
    }
  };

  const handleCompleteRequest = async (request: HelpRequest) => {
    if (!request.assigneeId) return;
    try {
      await firebaseService.completeRequest(request.id, request.assigneeId);
      
      await firebaseService.updateUserKarma(request.assigneeId, 10);
      const msg = "Yordam muvaffaqiyatli topshirildi, +10 XP berildi!";
      showNotification(msg, 'success');
      
      if (request.mahallaId) {
        const logMsg = `"${request.title}" yordamini yakunladi va +10 XP oldi.`;
        
        await firebaseService.logEvent(
          request.mahallaId,
          'help_completed',
          logMsg,
          request.assigneeId,
          'Faol Yordamchi'
        );
      }
    } catch (e) {
      console.error(e);
      showNotification('Xatolik yuz berdi.', 'error');
    }
  };

  const handleVoteProposal = async (proposalId: string, votes: string[]) => {
    if (!user) {
      handleGoogleLogin();
      return;
    }
    const hasVoted = votes.includes(user.uid);
    try {
      await firebaseService.voteProposal(proposalId, user.uid, !hasVoted);
      showNotification(!hasVoted ? 'Tashabbusga ovozingiz muvaffaqiyatli qo\'shildi!' : 'Ovozingiz bekor qilindi.', 'success');
    } catch (e) {
      console.error(e);
      showNotification('Ovoz berishda xatolik yuz berdi.', 'error');
    }
  };

  const handleCreateProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      handleGoogleLogin();
      return;
    }
    if (newPropTitle.trim().length < 5) {
      showNotification('Sarlavha kamida 5 ta harfdan iborat bo\'lishi shart.', 'error');
      return;
    }
    if (newPropDesc.trim().length < 10) {
      showNotification('Tavsif kamida 10 ta harfdan iborat bo\'lishi shart.', 'error');
      return;
    }
    try {
      await firebaseService.createProposal(
        newPropTitle,
        newPropDesc,
        user.uid,
        profile.displayName,
        newPropCat,
        activeMahalla ? activeMahalla.id : null
      );
      showNotification('Tashabbus muvaffaqiyatli forumga joylandi!', 'success');
      setNewPropTitle('');
      setNewPropDesc('');
      setIsCreatingInline(false);
    } catch (e) {
      console.error(e);
      showNotification('Nashr qilishda xatolik yuz berdi.', 'error');
    }
  };

  const handleDeleteProposal = async (proposalId: string) => {
    if (!user) return;
    try {
      await firebaseService.deleteProposal(proposalId, user.uid);
      showNotification('Tashabbus o\'chirildi.', 'success');
    } catch (e) {
      console.error(e);
      showNotification('O\'chirish ruxsat etilmadi.', 'error');
    }
  };

  const handleSendChatbot = async () => {
    if (!chatbotInput.trim()) return;
    const userText = chatbotInput;
    setChatbotInput('');
    
    // Append user message
    const updatedMessages = [...chatbotMessages, { role: 'user' as const, text: userText }];
    setChatbotMessages(updatedMessages);
    setIsChatbotLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: updatedMessages })
      });
      const data = await response.json();
      if (data.reply) {
        setChatbotMessages([...updatedMessages, { role: 'assistant' as const, text: data.reply }]);
      } else {
        setChatbotMessages([...updatedMessages, { role: 'assistant' as const, text: 'Kechirasiz, aqlli ko\'makchidan javob olishda xatolik yuz berdi.' }]);
      }
    } catch (error) {
      console.error(error);
      setChatbotMessages([...updatedMessages, { role: 'assistant' as const, text: 'Kechirasiz, ulanishda xatolik yuz berdi. Iltimos qayta urinib ko\'ring.' }]);
    } finally {
      setIsChatbotLoading(false);
    }
  };

  if (!isLoaded) return (
    <div className="min-h-screen grid place-items-center">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-12 h-12 bg-black rounded-full"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      <Navbar user={user} profile={profile} onProfileClick={() => setIsProfileModalOpen(true)} resetView={() => { setActiveMahalla(null); setMainTab('home'); }} mainTab={mainTab} setMainTab={setMainTab} onLogin={handleGoogleLogin} />

      <main className="pt-28 pb-32 px-4 max-w-7xl mx-auto">
        {!user ? (
          <div className="max-w-6xl mx-auto text-center py-16 relative">
            {/* Soft Glowing Backdrops */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-sky-200/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
            <div className="absolute top-[40%] right-0 w-[400px] h-[400px] bg-blue-100/25 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
            
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-50/80 border border-blue-100/60 px-4 py-1.5 rounded-full text-[11px] font-bold text-blue-700 mb-8 shadow-sm tracking-wide">
                <ShieldCheck size={14} className="text-blue-600" /> Jamoaviy o'zaro ishonch ko'prigi
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-tight mb-8 leading-[1.1] text-slate-900 max-w-4xl mx-auto">
                Mahallangiz bo'ylab ishonchli <br className="hidden md:block" /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 italic font-serif">ko'mak va hamkorlik</span> tarmoqlari
              </h1>
              <p className="text-base md:text-lg text-slate-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                Qo'shnilar muammolarini yechishga mo'ljallangan raqamli tizim. Malakangizni ulashing, yordam bering va jamoaviy birdamlikni mustahkamlang.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-24">
                <button 
                  onClick={handleGoogleLogin}
                  className="group relative bg-slate-900 hover:bg-slate-950 text-white px-8 py-4 rounded-xl text-sm font-bold transition-all flex items-center gap-2.5 shadow-lg shadow-slate-950/10 hover:shadow-xl active:scale-[0.98]"
                >
                  <span>Google orqali tizimga kirish</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <div className="flex -space-x-1.5">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-7 h-7 rounded-full border border-white bg-slate-100 overflow-hidden shadow-sm">
                        <img src={`https://i.pravatar.cc/100?img=${i+12}`} alt="" />
                      </div>
                    ))}
                  </div>
                  <span className="ml-1.5 text-slate-500">+1000 dan ziyod hamyurtlarimiz</span>
                </div>
              </div>
            </motion.div>

            {/* Core Features Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 text-left relative z-10">
              {[
                { 
                  title: 'Ishonchli va Tasdiqlangan', 
                  titleUz: 'Yordam nazorati',
                  icon: <ShieldCheck className="text-blue-600" size={20} />, 
                  desc: 'Har bir profil va mahalla tizim oqsoqoli hamda jamoatchilik ishonch burchagi orqali tekshiruvdan o\'tkaziladi.'
                },
                { 
                  title: 'Karma va Odil Tizim', 
                  titleUz: 'Firgarlikka qarshi mantiq',
                  icon: <Zap className="text-amber-500" size={20} />, 
                  desc: 'XP ballari faqat e\'lon egasi yoki mahalla vakili tomonidan amaliy yordam to\'liq yakunlangach taqdim etiladi.' 
                },
                { 
                  title: 'Haqiqiy Ko\'mak va Mukofot', 
                  titleUz: 'Savob va iqtisodiy foyda',
                  icon: <DollarSign className="text-emerald-500" size={20} />, 
                  desc: 'Ixtiyoriy (savob uchun) yordam bering yoki o\'zaro iqtisodiy foyda bera oluvchi professional xizmatlar taqdim eting.'
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i + 0.3 }}
                  className="p-8 rounded-[24px] bg-white border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-50/50 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                  <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-4">{feature.titleUz}</p>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Bottom Elegant Promotion */}
            <section className="mt-32 max-w-5xl mx-auto bg-slate-900 text-white p-12 md:p-16 rounded-[32px] text-center relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
               <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>
               
               <div className="relative z-10">
                 <h2 className="text-3xl md:text-5xl font-display font-extrabold mb-6 tracking-tight leading-none">Birlashgan Jamoa — <span className="text-blue-400 block sm:inline">Kuchli Mahalla</span></h2>
                 <p className="text-slate-400 text-base md:text-lg mb-8 leading-relaxed max-w-2xl mx-auto font-medium">
                    CivicBridge orqali odamlar bir-birlariga fidoyi yordam bera olishadi hamda birdamlik qadriyatini yuzaga chiqarishadi. Loyihada ishtirok eting va do'stona muhitni yarating.
                 </p>
                 <div className="inline-flex bg-white/5 backdrop-blur-md px-6 py-2.5 rounded-full text-xs font-bold border border-white/10 uppercase tracking-wider text-slate-300 italic">
                    "Yaxshilik qiling, u albatta zoe ketmaydi"
                 </div>
               </div>
            </section>
          </div>
        ) : (
          <div className="space-y-12">
            

            {/* TAB 1: HOME */}
            {mainTab === 'home' && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10 text-left"
              >
                {/* Greeting Hero Block */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">
                  <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-blue-600/15 rounded-full blur-[110px] -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-[90px] -ml-32 -mb-32"></div>
                  
                  <div className="relative z-10 max-w-3xl">
                    <div className="inline-flex items-center gap-2 bg-blue-600/80 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider mb-6">
                      <Sparkles size={11} className="animate-pulse" /> Tizimga muvaffaqiyatli ulandingiz
                    </div>
                    <h1 className="text-3xl md:text-5xl font-display font-black leading-[1.1] tracking-tight mb-5">
                      Mahallangiz bo'yicha o'zaro <br className="hidden md:block"/> 
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-teal-300 italic font-serif">raqamli ko'mak tarmoqlari.</span>
                    </h1>
                    <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed mb-8 max-w-2xl">
                      Xush kelibsiz, <span className="text-white font-semibold">{profile?.displayName || user.displayName}</span>! CivicBridge orqali mahalladoshlaringiz bilan faol bog'lanishingiz, o'zaro yordam ulashishingiz hamda jamoatchilik aloqalarini mustahkamlay olasiz.
                    </p>
                    <div className="flex flex-wrap gap-3.5">
                      <button 
                        onClick={() => setMainTab('feed')}
                        className="bg-white hover:bg-slate-100 text-slate-950 px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md active:scale-98"
                      >
                        Vazifalarni ko'rish <Heart size={13} className="text-rose-500 fill-rose-500" />
                      </button>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white/10 hover:bg-white/15 text-white border border-white/10 px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-98"
                      >
                        Yangi e'lon loyihalash <Plus size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* How it works grid */}
                <div className="space-y-5">
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                    <span>🎯</span> Tizim qanday amallar bilan ishlaydi?
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      {
                        step: '01',
                        title: 'E\'lon joylashtirish',
                        desc: 'Bozorlik, transport, ta\'mirlash, bolalar parvarishi yoki ta\'lim kabi ehtiyojlar uchun bepul yoki ruxsatli pullik e\'lon berasiz.'
                      },
                      {
                        step: '02',
                        title: 'Yordamni qabul qilish',
                        desc: 'Istagan odam ro\'yxatdan birini tanlab, yordam berish majburiyatini oladi va shaxsiy xavfsiz chatda suhbatlashadi.'
                      },
                      {
                        step: '03',
                        title: 'Yakunlash va tasdiqlash',
                        desc: 'Yordam berilgach, e\'lon beruvchi tizimda "Yordam oldim" tugmasini bosib vazifani yakunlaydi. Sizga amaliy ball qo\'shiladi.'
                      },
                      {
                        step: '04',
                        title: '5,000,000 so\'m mukofot',
                        desc: 'Ishonch asosida 1,000 Karma XP to\'plagan har bir foydalanuvchimizga rag\'batlantiruvchi 5 mln so\'m pul mukofotini taqdim etamiz.'
                      }
                    ].map((step, i) => (
                      <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:-translate-y-0.5 transition duration-300">
                        <span className="absolute right-4 top-4 text-3xl font-display font-extrabold text-slate-100 group-hover:text-blue-50 transition-colors leading-none">{step.step}</span>
                        <h3 className="text-sm font-bold text-slate-900 mb-2 mt-2 relative z-10">{step.title}</h3>
                        <p className="text-slate-500 text-xs leading-relaxed relative z-10">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Anti-cheat and trust information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 text-left shadow-sm">
                    <div className="flex items-center gap-2.5 text-blue-700 mb-5 font-bold">
                      <ShieldCheck size={20} />
                      <h3 className="text-base font-bold">Halollik va ishonch kafolati</h3>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-5 font-medium">
                      CivicBridge — bu jamiyat ishonchini tiklash milliy loyihasidir. Hamjamiyatda faollikni oshirish va halollikni ta'minlash uchun quyidagi ko'rsatmalar amal qiladi:
                    </p>
                    <ul className="space-y-3.5 text-xs text-slate-500 font-medium">
                      <li className="flex gap-2.5">
                        <span className="w-4 h-4 bg-blue-50 text-blue-600 rounded flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-extrabold">1</span>
                        <span><strong>Cheksiz yordam va XP:</strong> Xohlagan vaqtingizda, istalgancha qo'shnilarizga yordam bera olasiz va har safar +10 XP olasiz.</span>
                      </li>
                      <li className="flex gap-2.5">
                        <span className="w-4 h-4 bg-blue-50 text-blue-600 rounded flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-extrabold">2</span>
                        <span><strong>Samimiy hamkorlik:</strong> Qo'shnilar bir-birlariga samimiy munosabatda bo'lishlari hamda real hayotdagi ko'makni tasdiqlashlari so'raladi.</span>
                      </li>
                      <li className="flex gap-2.5">
                        <span className="w-4 h-4 bg-blue-50 text-blue-600 rounded flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-extrabold">3</span>
                        <span><strong>Faollar nazorati:</strong> Mahalla faollari tizim rivojlanishini, guruhlar faoliyatini va muammolar hal etilishini kuzatib boradilar.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Quest Highlight Card */}
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 md:p-8 relative overflow-hidden flex flex-col justify-between shadow-xl">
                    <div className="absolute top-0 right-0 w-52 h-52 bg-indigo-505/15 rounded-full blur-[60px]"></div>
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-400 mb-3">
                        <Trophy size={16} />
                        <span className="text-[9px] font-extrabold uppercase tracking-widest">Oliy rag'bat loyihasi</span>
                      </div>
                      <h3 className="text-2xl font-display font-extrabold leading-none tracking-tight mb-3">
                        5,000,000 so'm <br />
                        <span className="text-indigo-300 text-lg">Xayru saxovat mukofoti</span>
                      </h3>
                      <p className="text-slate-400 text-xs leading-relaxed mb-6">
                        Ushbu aksiya mahallarimizni raqamlashtirish, birdamlik muhitini qaytarish hamda haqiqiy jamoat qahramonlarini munosib rag'batlantirish maqsadida tuzildi. Siz to'playdigan har bir XP ball ortida chinakam jamoaviy sa'y-harakatlar turadi.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider mb-0.5">Sizning balingiz</span>
                        <span className="text-lg font-black text-white">{profile?.karma || 0} XP</span>
                      </div>
                      <button 
                        onClick={() => setMainTab('rewards')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
                      >
                        Natijani tekshirish
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: FEED */}
            {mainTab === 'feed' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.99 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Search & Feed Subtabs Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-5 bg-white border border-slate-200/50 rounded-2xl p-5 shadow-sm text-left">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-930 flex items-center gap-2">
                      <Heart size={18} className="text-rose-500" /> O'zaro yordam tarmog'i
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Mahallangizdagi faol e'lonlar, professional yoki ixtiyoriy ko'maklarni kuzatib boring.</p>
                  </div>

                  <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto shrink-0">
                     <button 
                        onClick={() => setActiveTab('browse')}
                        className={cn("px-5 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider whitespace-nowrap", activeTab === 'browse' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                     >
                       Yordam Keraklar (Browse)
                     </button>
                     <button 
                        onClick={() => setActiveTab('my-activity')}
                        className={cn("px-5 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider whitespace-nowrap", activeTab === 'my-activity' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                     >
                       Faol Vazifalarim (My Activity)
                     </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
                  {/* Search and Filters side column */}
                  <div className="lg:col-span-1 space-y-5">
                    <div className="p-5 bg-white border border-slate-200/60 rounded-2xl shadow-sm space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Izlash</span>
                        <div className="relative">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                          <input 
                            type="text" 
                            placeholder="Masalan: bozorlik..." 
                            className="w-full pl-10 pr-3-5 py-2.5 bg-slate-50 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all text-xs font-bold placeholder:text-slate-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="h-px bg-slate-100"></div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Tizimdagi jamoa</span>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsMahallaDropdownOpen(!isMahallaDropdownOpen)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/50 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between hover:bg-slate-100 hover:border-slate-200 transition-all active:scale-[0.99] select-none"
                          >
                            <span className="truncate flex items-center gap-2">
                              {activeMahalla ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                                  <span>{activeMahalla.name}</span>
                                </>
                              ) : (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                  <span>Barcha Mahallalar (Global)</span>
                                </>
                              )}
                            </span>
                            <ChevronRight 
                              className={cn(
                                "text-slate-400 transition-transform duration-200 shrink-0", 
                                isMahallaDropdownOpen ? "rotate-90 text-slate-900" : "rotate-0"
                              )} 
                              size={14} 
                            />
                          </button>

                          {isMahallaDropdownOpen && (
                            <>
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setIsMahallaDropdownOpen(false)} 
                              />
                              <motion.div
                                initial={{ opacity: 0, y: -5, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.12, ease: "easeOut" }}
                                className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-100 shadow-xl p-2 z-50 max-h-[220px] overflow-y-auto scrollbar-none"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMahalla(null);
                                    setIsMahallaDropdownOpen(false);
                                  }}
                                  className={cn(
                                    "w-full px-3 py-2 rounded-lg text-xs font-bold text-left transition-all flex items-center justify-between hover:bg-slate-50",
                                    !activeMahalla ? "bg-slate-50 text-blue-600" : "text-slate-600"
                                  )}
                                >
                                  <span>Barcha Mahallalar (Global)</span>
                                  {!activeMahalla && <span className="w-1 h-1 rounded-full bg-blue-600"></span>}
                                </button>

                                {mahallas.map((m) => {
                                  const isSelected = activeMahalla?.id === m.id;
                                  return (
                                    <button
                                      key={m.id}
                                      type="button"
                                      onClick={() => {
                                        setActiveMahalla(m);
                                        setIsMahallaDropdownOpen(false);
                                      }}
                                      className={cn(
                                        "w-full px-4 py-3 rounded-[16px] text-xs font-bold text-left transition-all mt-1 flex items-center justify-between hover:bg-slate-50",
                                        isSelected ? "bg-slate-50 text-blue-600" : "text-slate-600"
                                      )}
                                    >
                                      <span className="truncate">{m.name}</span>
                                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                                    </button>
                                  );
                                })}
                              </motion.div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Requests Lists Main Area */}
                  <div className="lg:col-span-3 space-y-6">
                    {activeTab === 'browse' ? (
                      <div className="space-y-6">
                        {/* Categories List Slider and Map view switches */}
                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                          <div className="overflow-x-auto pb-1 pt-1 scrollbar-none flex items-center gap-2 select-none touch-pan-x scroll-smooth snap-x flex-1">
                            {[
                              { name: 'Barcha turlar', key: 'all', icon: <Globe size={11} />, bg: 'bg-slate-950 border-slate-950 text-white shadow-lg shadow-slate-950/10', inactive: 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50 hover:text-slate-950' },
                              { name: 'Yumushlar', key: 'errands', icon: <ShoppingBag size={11} />, bg: 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/15', inactive: 'bg-white text-slate-500 border-slate-100 hover:bg-amber-50/50 hover:text-amber-600' },
                              { name: 'Ta\'mirlash', key: 'repairs', icon: <Wrench size={11} />, bg: 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/15', inactive: 'bg-white text-slate-500 border-slate-100 hover:bg-orange-50/50 hover:text-orange-600' },
                              { name: 'Dars tayyorlash', key: 'tutoring', icon: <BookOpen size={11} />, bg: 'bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/15', inactive: 'bg-white text-slate-500 border-slate-100 hover:bg-indigo-50/50 hover:text-indigo-600' },
                              { name: 'Bolalar', key: 'childcare', icon: <Baby size={11} />, bg: 'bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-500/15', inactive: 'bg-white text-slate-500 border-slate-100 hover:bg-pink-50/50 hover:text-pink-600' },
                              { name: 'Qariyalar', key: 'elderly care', icon: <Heart size={11} />, bg: 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/15', inactive: 'bg-white text-slate-500 border-slate-100 hover:bg-rose-50/50 hover:text-rose-600' },
                              { name: 'Boshqa', key: 'other', icon: <Sparkles size={11} />, bg: 'bg-slate-700 border-slate-700 text-white shadow-md shadow-slate-700/15', inactive: 'bg-white text-slate-400 border-slate-100 hover:bg-slate-100/60 hover:text-slate-900' },
                            ].map(cat => {
                              const isCatActive = activeCategory === cat.name;
                              return (
                                <button
                                  key={cat.key}
                                  type="button"
                                  onClick={() => setActiveCategory(cat.name)}
                                  className={cn(
                                    "px-4 py-2.5 rounded-[16px] text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 transition-all shrink-0 active:scale-95 duration-200 cursor-pointer select-none",
                                    isCatActive ? cat.bg : cat.inactive
                                  )}
                                >
                                  {cat.icon}
                                  <span>{cat.name}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Map Toggle switches */}
                          <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-center shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setMapViewActive(false);
                                setActiveMapPin(null);
                              }}
                              className={cn(
                                "px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                                !mapViewActive ? "bg-white text-slate-900 shadow-sm" : "text-slate-450 hover:text-slate-800"
                              )}
                            >
                              Ro'yxat
                            </button>
                            <button
                              type="button"
                              onClick={() => setMapViewActive(true)}
                              className={cn(
                                "px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer",
                                mapViewActive ? "bg-white text-blue-600 shadow-sm" : "text-slate-450 hover:text-blue-500"
                              )}
                            >
                              <Compass size={11} className="animate-pulse" /> Interaktiv Xarita
                            </button>
                          </div>
                        </div>

                        {/* Inner Feed Display */}
                        {mapViewActive ? (
                          <div className="bg-slate-950 rounded-[40px] border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden h-[460px] flex flex-col justify-between">
                            {/* SVG Decorative landmarks background */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none select-none">
                              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                {/* Water element: Bo'zsu kanali */}
                                <path d="M -100,50 C 120,130 180,-30 550,180 C 720,280 950,90 1200,165" fill="none" stroke="#2563eb" strokeWidth="40" opacity="0.3" />
                                <path d="M -100,50 C 120,130 180,-30 550,180 C 720,280 950,90 1200,165" fill="none" stroke="#60a5fa" strokeWidth="10" opacity="0.5" strokeDasharray="4,4" />
                                
                                {/* Park area */}
                                <rect x="35%" y="45%" width="25%" height="25%" rx="16" fill="#10b981" opacity="0.12" />
                                <text x="47%" y="58%" fill="#34d399" fontSize="9" fontWeight="black" letterSpacing="0.15em" textAnchor="middle" opacity="0.4">OBOD MAHALLA BOG'I</text>
                                
                                {/* Main street: Alisher Navoiy ko'chasi */}
                                <line x1="5%" y1="85%" x2="95%" y2="15%" stroke="#334155" strokeWidth="12" />
                                <line x1="5%" y1="85%" x2="95%" y2="15%" stroke="#64748b" strokeWidth="1.5" strokeDasharray="5,6" />
                                <text x="50%" y="46%" fill="#cbd5e1" fontSize="9" transform="rotate(-21 300 210)" fontWeight="black" letterSpacing="0.1em" opacity="0.25">NAVOU KO'CHASI</text>
                                
                                {/* Secondary street: Ziyolilar ko'chasi */}
                                <line x1="25%" y1="5%" x2="50%" y2="95%" stroke="#334155" strokeWidth="10" />
                                <line x1="25%" y1="5%" x2="50%" y2="95%" stroke="#64748b" strokeWidth="1" strokeDasharray="3,5" />
                                <text x="41%" y="60%" fill="#cbd5e1" fontSize="9" transform="rotate(72 250 250)" fontWeight="black" letterSpacing="0.1em" opacity="0.25">ZIYOLILAR KO'CHASI</text>
                                
                                {/* Houses boxes */}
                                <rect x="15%" y="15%" width="32" height="32" rx="6" fill="#475569" opacity="0.12" />
                                <rect x="75%" y="30%" width="30" height="30" rx="6" fill="#475569" opacity="0.12" />
                                <rect x="10%" y="60%" width="38" height="38" rx="6" fill="#475569" opacity="0.12" />
                                <rect x="80%" y="70%" width="32" height="32" rx="6" fill="#475569" opacity="0.12" />
                              </svg>
                            </div>

                            {/* Map header info */}
                            <div className="relative z-10 flex justify-between items-center bg-slate-900/40 backdrop-blur-md p-3.5 rounded-2xl border border-white/5">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-350">Xarita radar tizimi</span>
                              </div>
                              <span className="text-[9px] font-black text-slate-400 bg-slate-800 px-3 py-1.5 rounded-xl uppercase tracking-wider border border-white/5">
                                {filteredRequests.length} ta e'lon faol
                              </span>
                            </div>

                            {/* Pins container area absolute */}
                            <div className="absolute inset-0 top-18 bottom-6 overflow-hidden">
                              {filteredRequests.map((req) => {
                                // Deterministic stable coordinates for any request based on ID
                                let hash = 0;
                                for (let i = 0; i < req.id.length; i++) {
                                  hash = req.id.charCodeAt(i) + ((hash << 5) - hash);
                                }
                                const px = 15 + Math.abs(hash % 70); // 15% to 85%
                                const py = 20 + Math.abs((hash >> 8) % 60); // 20% to 80%

                                const isSelected = activeMapPin?.id === req.id;
                                const categoryColors: Record<string, string> = {
                                  'errands': 'bg-amber-500 hover:bg-amber-600',
                                  'repairs': 'bg-orange-500 hover:bg-orange-600',
                                  'tutoring': 'bg-indigo-505 hover:bg-indigo-610 bg-indigo-500', // support custom values
                                  'childcare': 'bg-pink-500 hover:bg-pink-600',
                                  'elderly care': 'bg-rose-500 hover:bg-rose-600',
                                  'other': 'bg-slate-500 hover:bg-slate-600'
                                };
                                const colClass = categoryColors[req.category] || 'bg-blue-500';

                                return (
                                  <div
                                    key={req.id}
                                    style={{ left: `${px}%`, top: `${py}%` }}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => setActiveMapPin(req)}
                                      className="relative flex items-center justify-center p-2 group cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                                    >
                                      {/* Outer pulse circle */}
                                      <span className={cn("absolute inline-flex h-9 w-9 rounded-full opacity-40 animate-ping", colClass)}></span>
                                      
                                      {/* Inner Category dot indicator */}
                                      <div className={cn(
                                        "w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg transition-transform hover:rotate-6",
                                        colClass,
                                        isSelected ? "scale-115 ring-2 ring-blue-500 border-yellow-350" : ""
                                      )}>
                                        {req.category === 'errands' && <ShoppingBag size={12} />}
                                        {req.category === 'repairs' && <Wrench size={12} />}
                                        {req.category === 'tutoring' && <BookOpen size={12} />}
                                        {req.category === 'childcare' && <Baby size={12} />}
                                        {req.category === 'elderly care' && <Heart size={12} />}
                                        {req.category === 'other' && <Sparkles size={12} />}
                                      </div>
                                    </button>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Floating panel drawer on bottom for selected pin */}
                            <div className="relative z-30 pointer-events-none w-full">
                              <AnimatePresence>
                                {activeMapPin && (
                                  <motion.div
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 30, opacity: 0 }}
                                    className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-white/10 p-4 rounded-3xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-lg mx-auto"
                                  >
                                    <div className="text-left">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className={cn(
                                          "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider text-white",
                                          activeMapPin.urgency === 'high' ? 'bg-red-650 bg-red-600' : 'bg-slate-700'
                                        )}>
                                          {activeMapPin.urgency === 'high' ? 'Muhim' : 'Oddiy'}
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-wider text-blue-400">
                                          {activeMapPin.category.toUpperCase()}
                                        </span>
                                      </div>
                                      <h4 className="text-[11px] font-black text-white uppercase tracking-tight line-clamp-1">{activeMapPin.title}</h4>
                                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 font-semibold">{activeMapPin.description}</p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setIsChatOpen(activeMapPin);
                                          setActiveMapPin(null);
                                        }}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                                      >
                                        Muloqot
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setActiveMapPin(null)}
                                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-all cursor-pointer"
                                      >
                                        Yopish
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        ) : (
                          /* Standard Cards Grid list */
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AnimatePresence mode='popLayout'>
                              {filteredRequests.length > 0 ? (
                                filteredRequests.map((req: HelpRequest) => (
                                  <RequestCard 
                                    key={req.id} 
                                    request={req} 
                                    onRespond={handleRespond} 
                                    showNotification={showNotification} 
                                    onOpenChat={setIsChatOpen} 
                                    onComplete={handleCompleteRequest}
                                    onUserClick={setViewingProfile}
                                  />
                                ))
                              ) : (
                                <motion.div 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="col-span-full py-20 text-center border border-dashed border-slate-200 rounded-[40px] bg-slate-50/50"
                                >
                                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <Search className="text-slate-200" size={32} />
                                  </div>
                                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Natija topilmadi</p>
                                  <p className="text-slate-300 text-xs mt-2 max-w-xs mx-auto font-medium">Qidiruv yoki filtrlarni o'zgartirib ko'ring.</p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {myRequests.map((req: HelpRequest) => (
                            <RequestCard 
                              key={req.id} 
                              request={req} 
                              isViewOnly 
                              showNotification={showNotification} 
                              onOpenChat={setIsChatOpen} 
                              onComplete={handleCompleteRequest}
                              onUserClick={setViewingProfile}
                            />
                          ))}
                          {myRequests.length === 0 && (
                            <div className="col-span-full py-16 text-center text-slate-300 font-black uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-[32px] text-xs">
                              Hali faol vazifalaringiz yo'q.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: MAHALLAS */}
            {mainTab === 'mahallas' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Mahallalar Sidebar */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 bg-white border border-slate-100 rounded-[36px] shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black text-[12px] uppercase tracking-wider text-slate-900 ml-1">Jamoalarim</h3>
                        <button 
                          onClick={() => setIsMahallaModalOpen(true)} 
                          className="w-9 h-9 bg-slate-50 text-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-950 hover:text-white transition-all shadow-sm"
                          title="Yangi mahalla ochish"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {mahallas.map(m => (
                          <div key={m.id} className="relative group/m">
                             <div 
                               className={cn(
                                 "w-full rounded-[24px] overflow-hidden transition-all border min-w-0 cursor-pointer",
                                 activeMahalla?.id === m.id 
                                   ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                                   : "bg-slate-50 border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-200"
                               )}
                               onClick={() => setActiveMahalla(activeMahalla?.id === m.id ? null : m)}
                             >
                              <div className="flex items-center group/h min-w-0 relative">
                                <span className="flex-1 text-left px-4 py-3.5 text-xs font-black uppercase tracking-widest flex items-center justify-between min-w-0">
                                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <Users size={16} className="shrink-0" />
                                    <span className="truncate block font-bold">{m.name}</span>
                                  </div>
                                  <ChevronRight size={14} className={cn("transition-all shrink-0 ml-1.5", activeMahalla?.id === m.id ? "rotate-90 text-white" : "opacity-30")} />
                                </span>
                              </div>
                             </div>
                          </div>
                        ))}
                        {mahallas.length === 0 && (
                          <div className="text-center py-8 px-2 border border-dashed border-slate-200 rounded-[24px]">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] leading-relaxed">Guruhlar topilmadi</p>
                            <button 
                              onClick={() => setIsMahallaModalOpen(true)}
                              className="mt-3 text-[9px] font-black uppercase text-blue-600 tracking-widest hover:underline"
                            >
                              Yaratish
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Main Mahalla Details/Interactive Area */}
                  <div className="lg:col-span-3">
                    {activeMahalla ? (
                      <div className="space-y-8">
                        {/* Selected Mahalla Header Card */}
                        <div className="bg-white border border-slate-100 rounded-[40px] p-8 md:p-10 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div>
                              <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-600 px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-4">
                                <Users size={12} /> JAMOAT GURUHI
                              </div>
                              <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight text-slate-900 leading-none">
                                {activeMahalla.name}
                              </h1>
                              <p className="text-slate-500 text-sm mt-3 font-medium leading-relaxed max-w-xl">
                                {activeMahalla.description}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <button 
                                onClick={() => copyToClipboard(activeMahalla.id)}
                                className="px-5 py-3.5 bg-slate-950 text-white hover:bg-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-sm"
                              >
                                <Share2 size={12} /> Taklif Havolasi
                              </button>
                              
                              {activeMahalla.ownerId === user?.uid ? (
                                <button 
                                  onClick={() => handleDeleteMahalla(activeMahalla.id)}
                                  className="w-12 h-12 flex items-center justify-center bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all border border-red-100/50"
                                  title="Guruhni o'chirish"
                                >
                                  <Trash2 size={16} />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleLeaveMahalla(activeMahalla.id)}
                                  className="w-12 h-12 flex items-center justify-center bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all border border-red-100/50"
                                  title="Guruhdan chiqish"
                                >
                                  <LogOut size={16} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="h-px bg-slate-100 my-8"></div>
                          
                          {/* Active Members inline */}
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Guruh a'zolari:</span>
                            <MahallaMembers mahalla={activeMahalla} currentUid={user?.uid} onUserClick={setViewingProfile} />
                          </div>
                        </div>

                        {/* Announcement log */}
                        <AnnouncementCard 
                          mahalla={activeMahalla} 
                          currentUid={user?.uid} 
                          onUpdate={(announcement) => handleUpdateAnnouncement(activeMahalla.id, announcement)} 
                        />

                        {/* Leaderboard and Wall */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <PremiumLeaderboard mahalla={activeMahalla} onUserClick={setViewingProfile} />
                          <MahallaWall mahallaId={activeMahalla.id} />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-100 rounded-[43px] p-12 text-center py-24 relative overflow-hidden shadow-sm">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/20 rounded-full blur-[80px]"></div>
                        <div className="relative z-10">
                          <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Users size={32} className="text-slate-400" />
                          </div>
                          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-3">Mahallangizni Tanlang</h2>
                          <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed mb-8 font-medium">
                            Chap tarafdagi guruhlar ro'yxatidan birini bosing yoki yangi mahalla oching va hamkorlikdagi ishonch devori hamda chatlarga kiring!
                          </p>
                          <div className="flex justify-center gap-4">
                            <button 
                              onClick={() => setIsMahallaModalOpen(true)}
                              className="px-6 py-4 bg-slate-950 hover:bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-2xl shadow-sm transition-all"
                            >
                              Yangi guruh yaratish
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: REWARDS */}
            {mainTab === 'rewards' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                {/* Intro Headers */}
                <div>
                  <h1 className="text-3xl font-display font-black text-slate-900 uppercase tracking-tight">🏆 Global Reyting va Sovrin</h1>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Barcha o'zaro ishonch ko'magi tizimi foydalanuvchilarining global natijalari va quest progressi.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Big Area: Quest Progression and Safe Guard details */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Big Quest progression */}
                    {profile && (
                      <div className="p-10 bg-slate-900 rounded-[48px] text-white premium-shadow relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px]"></div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-6">
                            <Zap size={20} className="text-yellow-400 fill-yellow-400 animate-pulse" />
                            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-400">FAOL YORDAMCHI QUEST</span>
                          </div>
                          
                          <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter mb-4 leading-none text-white">5,000,000 UZS</h2>
                          <p className="text-slate-400 font-medium text-base mb-10 max-w-xl leading-relaxed">
                            1000 Karma XP to'plagan har bir verified foydalanuvchiga mahalladagi faolligi uchun mukofot beriladi.
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                            <div>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-black">Joriy to'plangan Karma</p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-display font-black text-white">{profile.karma || 0}</span>
                                <span className="text-lg font-bold text-slate-500">/ 1000 XP</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                                <span className="text-slate-505">QUEST PROGRESS</span>
                                <span className="text-blue-400">{Math.round(Math.min(((profile.karma || 0) / 1000) * 100, 100))}%</span>
                              </div>
                              <div className="h-4 bg-slate-800 rounded-full p-[3px] border border-slate-700">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(((profile.karma || 0) / 1000) * 100, 100)}%` }}
                                  className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-600 rounded-full"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Anti-cheat safeguard rules info */}
                    <div className="bg-white border border-slate-100 rounded-[40px] p-8 md:p-10 shadow-sm space-y-6 text-left">
                      <div className="flex items-center gap-3 text-slate-950 mb-2 font-black uppercase tracking-tight">
                        <ShieldAlert size={26} className="text-red-500 animate-bounce" />
                        <h3 className="text-lg">Adolat va Ishonch Protokollari</h3>
                      </div>
                      
                      <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                        Sayt mukofot tizimi haqiqiy va ijtimoiy yordamni amalga oshiradigan qo'shnilarimizga taqsimlanishini ta'minlash maqsadida xavfsizlik audit parametrlari avtomatik tarzda ishlaydi:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                          <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 block mb-2">Erkin yordam</span>
                          <p className="text-xs text-slate-500 leading-relaxed font-semibold">Hech qanday kunlik limit yoki cheklovlarsiz, istalgan vaqtda istalgancha yordam berishingiz va XP yig'ishingiz mumkin.</p>
                        </div>
                        <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block mb-2">Do'stona ko'mak</span>
                          <p className="text-xs text-slate-500 leading-relaxed font-semibold">Qo'shnilaringizga yordam berib ularni hayotini osonlashtiring, hamma bir-biriga xohlagancha erkin yordam bera oladi.</p>
                        </div>
                        <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block mb-2">Hamjamiyat Nazorati</span>
                          <p className="text-xs text-slate-500 leading-relaxed font-semibold">Mahalla oqsoqollari hamda faollar tizim rivojlanishini kuzatib, ezgu ishlarni qo'llab-quvvatlaydilar.</p>
                        </div>
                      </div>

                      <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-[11px] font-extrabold text-orange-850 uppercase tracking-wider text-center">
                        🚨 Diqqat: Tizimda soxtalik aniqlansa, barcha to'plangan XP bekor qilinadi va akkaunt bloklanadi!
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Global Leaderboard Users */}
                  <div className="lg:col-span-1">
                    <div className="p-8 bg-slate-950 rounded-[44px] text-white premium-shadow relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                      
                      <h3 className="font-black text-[12px] uppercase tracking-wider text-blue-400 mb-8 flex items-center gap-2.5">
                        <Trophy size={18} /> Global Peshqadamlar
                      </h3>
                      
                      <div className="space-y-4">
                        {topUsers.map((u, i) => (
                          <div 
                            key={u.uid} 
                            onClick={() => setViewingProfile(u)}
                            className="flex items-center justify-between group/user cursor-pointer p-2 hover:bg-white/5 rounded-2xl transition-all"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="relative">
                                <img src={u.photoURL} alt="" className="w-10 h-10 rounded-2xl border border-white/10 grayscale group-hover/user:grayscale-0 transition-all" />
                                <div className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-white text-slate-900 rounded-lg flex items-center justify-center text-[10px] font-black shadow-lg">
                                  {i + 1}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-black uppercase tracking-tight text-white/90 truncate max-w-[125px]">{u.displayName}</p>
                                <p className="text-[8px] font-black uppercase tracking-widest text-blue-400/80 mt-0.5">{u.karma} Karma XP</p>
                              </div>
                            </div>
                            
                            <div className="h-0.5 w-6 bg-white/5 group-hover/user:w-10 group-hover/user:bg-blue-500 transition-all"></div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                          Sizning o'rningiz doimiy ravishda real vaqtda yangilanadi.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5: FORUM / TAKLIFLAR */}
            {mainTab === 'forum' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Header info */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm text-left">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-930 flex items-center gap-2 uppercase">
                      <MessageSquare size={18} className="text-blue-500" /> Mahalla Jamoat Forum / Takliflari
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-semibold font-sans">Qo'shnilarimiz tomonidan ekologiya, infratuzilma va tadbirlarni rivojlantirish bo'yicha berilgan takliflar.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreatingInline(!isCreatingInline)}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-[16px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-500/10 active:scale-95 shrink-0"
                  >
                    {isCreatingInline ? "Bekor qilish" : "Tashabbus qo'shish"}
                  </button>
                </div>

                {/* Inline Creation Form */}
                {isCreatingInline && (
                  <motion.form
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    onSubmit={handleCreateProposalSubmit}
                    className="p-6 bg-white border border-slate-200 rounded-[28px] shadow-sm text-left space-y-4 max-w-xl mx-auto"
                  >
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Yangi Jamoat Tashabbusi</h3>
                    
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Tashabbus turi (Mavzu)</label>
                      <select
                        value={newPropCat}
                        onChange={(e) => setNewPropCat(e.target.value as any)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-sans"
                      >
                        <option value="infrastructure">Yo'llar & Infratuzilma</option>
                        <option value="ecology font-sans">Yashil ekologiya & Daraxtlar</option>
                        <option value="events font-sans">Bayramlar, Sport & To'ylar</option>
                        <option value="charity font-sans">Mehr-shafqat & Xayriyalar</option>
                        <option value="other font-sans">Boshqa loyihalar</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Tashabbus sarlavhasi</label>
                      <input
                        type="text"
                        placeholder="Masalan: Domimiz podyezdiga toza filter o'rnatish..."
                        value={newPropTitle}
                        onChange={(e) => setNewPropTitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">To'liq batafsil bayoni</label>
                      <textarea
                        rows={3}
                        placeholder="Ushbu tashabbus nega mahallamizga kerakligi, qanchalik foydali bo'lishi va uni qanday tashkil etmoqchi ekanligingiz haqida yozing..."
                        value={newPropDesc}
                        onChange={(e) => setNewPropDesc(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-slate-950 hover:bg-slate-900 text-white rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer font-sans"
                    >
                      Forumga e'lon qilish
                    </button>
                  </motion.form>
                )}

                {/* Proposals Search & Filter bar representation */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between text-left">
                  <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-350" size={14} />
                    <input
                      type="text"
                      placeholder="Takliflarni qidirish..."
                      value={proposalSearchQuery}
                      onChange={(e) => setProposalSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/60 rounded-xl text-xs font-bold text-slate-850 placeholder:text-slate-350 focus:outline-none focus:ring-1 focus:ring-blue-550 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto scrollbar-none">
                    {['Barcha turlar', 'infrastructure', 'ecology', 'events', 'charity', 'other'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setProposalCategory(cat)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
                          proposalCategory === cat ? "bg-white text-slate-900 shadow-sm" : "text-slate-450 hover:text-slate-75"
                        )}
                      >
                        {cat === 'Barcha turlar' ? 'Barchasi' : cat === 'infrastructure' ? 'Infratuzilma' : cat === 'ecology' ? 'Ekologiya' : cat === 'events' ? 'Tadbirlar' : cat === 'charity' ? 'Xayriya' : 'Boshqa'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Proposals cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  {proposals
                    .filter(p => proposalCategory === 'Barcha turlar' || p.category === proposalCategory)
                    .filter(p => p.title.toLowerCase().includes(proposalSearchQuery.toLowerCase()) || p.description.toLowerCase().includes(proposalSearchQuery.toLowerCase()))
                    .length > 0 ? (
                      proposals
                        .filter(p => proposalCategory === 'Barcha turlar' || p.category === proposalCategory)
                        .filter(p => p.title.toLowerCase().includes(proposalSearchQuery.toLowerCase()) || p.description.toLowerCase().includes(proposalSearchQuery.toLowerCase()))
                        .map(p => {
                          const hasVoted = p.votes?.includes(user?.uid || '');
                          const isAuthor = p.creatorId === user?.uid;
                          return (
                            <motion.div
                              layout
                              key={p.id}
                              className="bg-white border border-slate-200/60 p-6 rounded-[32px] shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all group"
                            >
                              <div>
                                <div className="flex justify-between items-start gap-3 mb-4">
                                  <div className="flex items-center gap-2">
                                    <span className={cn(
                                      "px-3 py-1 rounded-full text-[8.5px] font-black uppercase tracking-wider",
                                      p.category === 'ecology' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                      p.category === 'infrastructure' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                      p.category === 'events' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                      p.category === 'charity' ? 'bg-red-50 text-red-650 border border-red-100 font-sans' :
                                      'bg-slate-50 text-slate-600 border border-slate-100 font-sans'
                                    )}>
                                      {p.category === 'ecology' ? 'Ekologiya' : p.category === 'infrastructure' ? 'Infratuzilma' : p.category === 'events' ? 'Tadbirlar' : p.category === 'charity' ? 'Xayriya' : 'Boshqa'}
                                    </span>
                                    <span className="text-[7.5px] font-black uppercase tracking-widest text-[#B5B5B5]">STATUS: {p.status?.toUpperCase() || 'YANGI'}</span>
                                  </div>

                                  {isAuthor && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteProposal(p.id)}
                                      className="p-1 px-2.5 bg-red-50 hover:bg-red-600 text-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer font-sans"
                                      title="Taklifni o'chirish"
                                    >
                                      O'chirish
                                    </button>
                                  )}
                                </div>

                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight line-clamp-2 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{p.title}</h3>
                                <p className="text-xs text-slate-550 text-slate-500 leading-relaxed font-semibold mb-6">{p.description}</p>
                              </div>

                              <div className="flex justify-between items-center border-t border-slate-50 pt-4 mt-auto">
                                <div className="text-left">
                                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Muallif</p>
                                  <p className="text-[10px] font-bold text-slate-800 lowercase truncate max-w-[130px] mt-0.5">@{p.creatorName?.split(' ')[0]}</p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleVoteProposal(p.id, p.votes || [])}
                                  className={cn(
                                    "px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wide flex items-center gap-1.5 transition-all select-none cursor-pointer font-sans",
                                    hasVoted 
                                      ? "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-550/10" 
                                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                                  )}
                                >
                                  <span>{hasVoted ? 'Qo\'llab-quvvatlandi' : 'Qo\'llab-quvvatlash'}</span>
                                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-30"></span>
                                  <span className="font-extrabold text-[10px]">{p.votes?.length || 0}</span>
                                </button>
                              </div>
                            </motion.div>
                          );
                        })
                    ) : (
                      <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200/70 rounded-[40px] bg-slate-50/20">
                        <p className="text-slate-400 font-black uppercase tracking-wider text-xs">Ushbu turkumda takliflar topilmadi.</p>
                        <p className="text-slate-300 text-[10px] mt-1 font-semibold">Birinchi bo'lib o'z tashabbusingizni forumda joylashtiring!</p>
                      </div>
                    )}
                </div>
              </motion.div>
            )}

            {/* TAB 6: AI ASSISTANT CHAT */}
            {mainTab === 'ai' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                {/* Header intro info */}
                <div className="bg-white border border-slate-200/50 p-6 rounded-2xl shadow-sm text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-930 flex items-center gap-2 uppercase">
                      <Sparkles size={18} className="text-amber-500 animate-pulse fill-amber-500" /> Aqlli Mahalla AI Ko'makchisi
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-semibold">Mahalla jamoat qoidalari, ezgu yordam ishlari, yoki nizolarni yumshatish buyicha AI yordamchining professional ko'magi.</p>
                  </div>
                  <span className="text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl uppercase tracking-widest shrink-0 animate-pulse font-sans">
                    Gemini v3.5 Faol
                  </span>
                </div>

                {/* Chat window body */}
                <div className="bg-white border border-slate-200 rounded-[35px] shadow-sm overflow-hidden flex flex-col h-[520px]">
                  {/* Message stack scroll */}
                  <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-none flex flex-col">
                    {chatbotMessages.map((msg, i) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={i}
                        className={cn(
                          "max-w-[75%] p-4 rounded-3xl text-xs leading-relaxed font-semibold self-start text-left",
                          msg.role === 'user'
                            ? "bg-slate-950 text-white rounded-tr-none self-end ml-auto"
                            : "bg-slate-100 text-slate-800 rounded-tl-none whitespace-pre-wrap"
                        )}
                      >
                        {msg.text}
                      </motion.div>
                    ))}

                    {isChatbotLoading && (
                      <div className="self-start text-[10px] font-black text-amber-550 text-amber-500 bg-amber-50 uppercase tracking-widest px-4 py-2 rounded-xl animate-pulse">
                        AIdosh yozmoqda...
                      </div>
                    )}
                  </div>

                  {/* Quick suggest tags toolbar */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2 overflow-x-auto scrollbar-none select-none">
                    {[
                      "Mahallada Karma ballarini qanday tez yig'aman?",
                      "Qo'shnilar bilan birdamlik tadbiri e'lonini yozib ber",
                      "Keksalar xizmatini tashkil etishda AI maslahatlari"
                    ].map((promptText) => (
                      <button
                        key={promptText}
                        type="button"
                        onClick={() => setChatbotInput(promptText)}
                        className="px-3.5 py-2 bg-white border border-slate-200/50 rounded-xl text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:border-slate-350 transition-all cursor-pointer shrink-0"
                      >
                        {promptText}
                      </button>
                    ))}
                  </div>

                  {/* Input container */}
                  <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="AI ko'makchidan so'rang..."
                      value={chatbotInput}
                      onChange={(e) => setChatbotInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendChatbot()}
                      className="flex-1 px-4 py-3.5 bg-slate-50 border border-slate-100/60 rounded-2xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-slate-850 placeholder:text-slate-300"
                    />
                    <button
                      type="button"
                      onClick={handleSendChatbot}
                      className="px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-500/10 active:scale-95"
                    >
                      So'rash
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Tab Switcher - Fixed Floating Bottom Dock */}
      {user && (
        <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-[420px] bg-slate-900/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-[22px] shadow-[0_24px_50px_rgba(0,0,0,0.4)] z-[100] flex justify-between items-center select-none">
          {[
            { id: 'home', label: 'Asosiy', icon: <Compass size={15} /> },
            { id: 'feed', label: 'Yordam', icon: <Heart size={15} /> },
            { id: 'forum', label: 'Forum', icon: <MessageSquare size={15} /> },
            { id: 'ai', label: 'AI', icon: <Sparkles size={15} className="text-amber-400" /> },
            { id: 'mahallas', label: 'Koort', icon: <Users size={15} /> }, // Note 'Koort' can be 'Guruh', let's use 'Mahalla' or 'Guruhlar' for perfect clarity
            { id: 'rewards', label: 'Reyting', icon: <Trophy size={15} /> },
          ].map(tab => {
            const labelMap: Record<string, string> = {
              'Asosiy': 'Asosiy',
              'Yordam': 'Yordam',
              'Forum': 'Forum',
              'AI': 'AI',
              'Koort': 'Mahallalar', // Correct word display label dynamically
              'Reyting': 'Reyting'
            };
            const label = labelMap[tab.label] || tab.label;
            const isActive = mainTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMainTab(tab.id as any)}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center py-2 rounded-[18px] transition-all relative z-10",
                  isActive 
                    ? "text-blue-400 font-extrabold scale-105" 
                    : "text-slate-400 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeMobileTabPill"
                    className="absolute inset-0 bg-white/10 rounded-[16px] -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                {tab.icon}
                <span className="text-[8px] font-bold uppercase tracking-wider mt-1">{label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Action Buttons */}
      {user && (
        <div className="fixed sm:bottom-10 bottom-24 left-1/2 -translate-x-1/2 z-50">
          <motion.button 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="group relative bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-4 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <Plus size={16} />
              </div>
              <span>Yordam so'rash</span>
            </div>
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && <CreateRequestModal mahallas={mahallas} showNotification={showNotification} onClose={() => setIsModalOpen(false)} />}
        {isMahallaModalOpen && <CreateMahallaModal showNotification={showNotification} onClose={() => setIsMahallaModalOpen(false)} />}
        {isInviteModalOpen && <InviteMemberModal mahalla={isInviteModalOpen} showNotification={showNotification} onClose={() => setIsInviteModalOpen(null)} />}
        {isChatOpen && <ChatModal request={isChatOpen} onClose={() => setIsChatOpen(null)} />}
        {isProfileModalOpen && profile && <ProfileModal profile={profile} showNotification={showNotification} onClose={() => setIsProfileModalOpen(false)} />}
        {viewingProfile && (
          <ProfileModal 
            profile={viewingProfile} 
            showNotification={showNotification} 
            onClose={() => setViewingProfile(null)} 
            isReadOnly={viewingProfile.uid !== user?.uid} 
          />
        )}
      </AnimatePresence>

      {confirmModal && (
        <ConfirmModal 
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          isDestructive={confirmModal.isDestructive}
          onConfirm={confirmModal.onConfirm}
          onClose={() => setConfirmModal(null)}
        />
      )}

      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 100, x: '-50%', scale: 0.8 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className={cn(
              "fixed bottom-12 left-1/2 z-[200] px-8 py-4 rounded-[24px] font-black text-white premium-shadow flex items-center gap-4 border-2 border-white/20 backdrop-blur-3xl",
              notification.type === 'success' ? "bg-slate-900/90" : "bg-rose-600/90"
            )}
          >
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shadow-inner", notification.type === 'success' ? "bg-blue-600" : "bg-white/20")}>
               {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            </div>
            <span className="uppercase text-xs tracking-widest leading-none">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

