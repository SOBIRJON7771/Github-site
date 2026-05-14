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
  Search as SearchIcon,
  ChevronRight,
  Globe
} from 'lucide-react';
import { auth, loginWithGoogle, logout } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { firebaseService, UserProfile, HelpRequest, Message, Mahalla } from './services/firebaseService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow } from 'date-fns';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Navbar = ({ user, profile }: { user: User | null; profile: UserProfile | null }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/10">
            <Heart size={20} fill="white" />
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-tighter block leading-none">CivicBridge</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 block">Neighbor to Neighbor</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block border-r border-gray-100 pr-4">
                <p className="text-sm font-bold tracking-tight">{profile?.displayName}</p>
                <div className="flex items-center gap-2 mt-0.5 justify-end">
                  <span className="text-[9px] font-black bg-blue-500 text-white px-1.5 py-0.5 rounded-sm uppercase">Member</span>
                  <p className="text-xs text-blue-600 font-bold">{profile?.karma} XP</p>
                </div>
              </div>
              <img 
                src={user.photoURL || ''} 
                className="w-10 h-10 rounded-2xl border-2 border-white shadow-md transition-transform hover:scale-110" 
                alt="Profile" 
              />
              <button 
                onClick={logout}
                className="p-2.5 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                title="Log out"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={loginWithGoogle}
              className="bg-black text-white px-6 py-2.5 rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-xl shadow-black/10"
            >
              Start Helping
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
  showNotification?: (msg: string) => void;
}

const RequestCard = (props: RequestCardProps) => {
  const { request, onRespond, isViewOnly = false, showNotification } = props;
  const isOwner = auth.currentUser?.uid === request.requesterId;
  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    if (!request.assigneeId) return;
    setCompleting(true);
    try {
      await firebaseService.completeRequest(request.id, request.assigneeId);
      showNotification?.('Karma awarded successfully!');
    } catch (e) {
      console.error(e);
      showNotification?.('Error confirming help.');
    } finally {
      setCompleting(false);
    }
  };

  const urgencyColors = {
    low: 'bg-green-50 text-green-700',
    medium: 'bg-orange-50 text-orange-700',
    high: 'bg-red-50 text-red-700'
  };

  const statusTags = {
    open: 'bg-blue-50 text-blue-700',
    assigned: 'bg-purple-50 text-purple-700',
    completed: 'bg-black text-white',
    cancelled: 'bg-gray-100 text-gray-500'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-[32px] p-6 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1 transition-all group overflow-hidden flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-wrap gap-2">
          <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", urgencyColors[request.urgency])}>
            {request.urgency}
          </div>
          <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", statusTags[request.status])}>
            {request.status}
          </div>
          {request.mahallaId && (
            <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white flex items-center gap-1.5">
               <Users size={10} /> Local Group
            </div>
          )}
        </div>
        <div className="flex items-center text-[10px] font-bold text-gray-400 gap-1.5 uppercase tracking-tighter">
          <Clock size={12} />
          {formatDistanceToNow(request.createdAt?.toDate() || new Date())}
        </div>
      </div>

      <h3 className="text-xl font-black mb-3 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{request.title}</h3>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed font-medium line-clamp-3 break-words">{request.description}</p>

      <div className="flex flex-wrap gap-2 mb-auto pb-8">
        <div className="flex items-center gap-2 text-[10px] font-bold bg-gray-50 px-3 py-1.5 rounded-xl text-gray-500 uppercase">
           <MapPin size={12} className="text-black" />
           {request.location || 'Local Neighbors'}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold bg-gray-50 px-3 py-1.5 rounded-xl text-gray-500 uppercase">
           {request.type === 'paid' ? <DollarSign size={12} className="text-green-600" /> : <Zap size={12} className="text-yellow-500" />}
           {request.type === 'paid' ? `Budget: $${request.budget}` : 'Volunteer Basis'}
        </div>
      </div>

      <div className="pt-6 border-t border-gray-50 mt-auto">
        {!isViewOnly && request.status === 'open' && !isOwner && (
          <button 
            onClick={() => onRespond?.(request.id)}
            className="w-full py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-black/10 active:scale-95"
          >
            I Can Help <ArrowRight size={14} />
          </button>
        )}
        
        {isOwner && request.status === 'assigned' && (
          <button 
            onClick={handleComplete}
            disabled={completing}
            className="w-full py-4 bg-green-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-green-600 transition-all shadow-xl shadow-green-500/20 active:scale-95 disabled:opacity-50"
          >
            {completing ? 'Confirming...' : 'Yordam oldim (+Karma)'}
          </button>
        )}

        {request.status === 'completed' && (
          <div className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3">
            <CheckCircle size={14} /> Yordam ko'rsatildi
          </div>
        )}

        {isOwner && request.status === 'open' && (
          <div className="w-full py-4 border-2 border-dashed border-gray-100 text-gray-300 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center">
            Yordam kutilyapti...
          </div>
        )}
      </div>
    </motion.div>
  );
};

const CreateMahallaModal = ({ onClose, showNotification }: { onClose: () => void; showNotification: (msg: string) => void }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await firebaseService.createMahalla(formData.name, formData.description, auth.currentUser.uid);
      showNotification('Mahalla created successfully!');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl">
        <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Create New Mahalla Group</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Mahalla Name</label>
            <input required className="w-full px-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Alisher Navoiy Mahallasdi" />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Description</label>
            <textarea className="w-full px-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Community description..." />
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-800 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Mahalla'}
          </button>
          <button type="button" onClick={onClose} className="w-full py-2 text-gray-400 font-bold text-xs uppercase tracking-widest">Cancel</button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const InviteMemberModal = ({ mahalla, onClose, showNotification }: { mahalla: Mahalla; onClose: () => void; showNotification: (msg: string) => void }) => {
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
        setError('User not found. Ask them to sign in to CivicBridge first.');
      } else if (mahalla.members.includes(targetUser.uid)) {
        setError('Already a member.');
      } else {
        await firebaseService.addMemberToMahalla(mahalla.id, targetUser.uid);
        showNotification(`${targetUser.displayName} added to ${mahalla.name}`);
        setSuccess(true);
        setEmail('');
      }
    } catch (err) {
      setError('Error adding member.');
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
        <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">Invite neighbor</h2>
        <p className="text-gray-400 text-sm mb-6 uppercase font-bold tracking-tighter">to {mahalla.name}</p>
        
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="relative">
            <input 
               type="email" required 
               className="w-full px-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black pr-12" 
               value={email} onChange={e => setEmail(e.target.value)} 
               placeholder="Neighbor's google email..." 
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"><Plus size={20} /></div>
          </div>
          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
          {success && <p className="text-green-600 text-xs font-bold">Successfully added!</p>}
          <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Searching...' : 'Invite by Email'}
          </button>
          <button type="button" onClick={onClose} className="w-full py-2 text-gray-400 font-bold text-xs uppercase tracking-widest">Done</button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const CreateRequestModal = ({ onClose, mahallas, showNotification }: { onClose: () => void; mahallas: Mahalla[]; showNotification: (msg: string) => void }) => {
  const [loading, setLoading] = useState(false);
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
      showNotification('Your request is live!');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold">Ask for Community Help</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <Plus className="rotate-45" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">What do you need?</label>
            <input 
              required
              placeholder="e.g., Need help moving groceries for elderly neighbor"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">Tell us more</label>
            <textarea 
              required
              rows={3}
              placeholder="Describe details, time, and specific requirements..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all resize-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">Visible To</label>
              <select 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black appearance-none"
                value={formData.mahallaId}
                onChange={(e) => setFormData({...formData, mahallaId: e.target.value})}
              >
                <option value="">Public Group (Everyone)</option>
                {mahallas.map(m => (
                  <option key={m.id} value={m.id}>Mahalla: {m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">Urgency</label>
              <select 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black appearance-none"
                value={formData.urgency}
                onChange={(e) => setFormData({...formData, urgency: e.target.value as any})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">Type</label>
              <select 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black appearance-none"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
              >
                <option value="voluntary">Voluntary Aid</option>
                <option value="paid">Paid Service</option>
              </select>
            </div>
            {formData.type === 'paid' && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">Budget ($)</label>
                <input 
                  type="number"
                  placeholder="20"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                />
              </div>
            )}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white rounded-2xl font-bold mt-2 hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Request'}
          </button>
        </form>
      </motion.div>
    </motion.div>
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMahallaModalOpen, setIsMahallaModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<Mahalla | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'my-activity'>('browse');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const p = await firebaseService.ensureUserProfile(u);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setIsLoaded(true);
    });
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

    return () => {
      unsubRequests?.();
      unsubMine();
      unsubMahallas();
    };
  }, [user, activeMahalla]);

  useEffect(() => {
    firebaseService.getTopUsers(5).then(users => {
      if (users) setTopUsers(users);
    });
  }, [requests]);

  const handleRespond = async (requestId: string) => {
    if (!user) {
      loginWithGoogle();
      return;
    }
    try {
      await firebaseService.assignRequest(requestId, user.uid);
      showNotification('Help request accepted! Good luck.');
    } catch (e) {
      showNotification('Error accepting request.', 'error');
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
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 font-sans selection:bg-black selection:text-white">
      <Navbar user={user} profile={profile} />

      <main className="pt-24 pb-32 px-4 max-w-7xl mx-auto">
        {!user ? (
          <div className="max-w-4xl mx-auto text-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center gap-2 bg-black/5 px-4 py-2 rounded-full text-sm font-medium text-black mb-8">
                <ShieldCheck size={16} /> Community-First Platform
              </div>
              <h1 className="text-6xl sm:text-7xl font-bold tracking-tight mb-8 leading-[0.9]">
                Bridging the Gap in <br /> 
                <span className="text-gray-400 italic">Local Communities.</span>
              </h1>
              <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto font-medium">
                A mutual aid network where neighbors help neighbors. Join a verified system to share skills, fulfill needs, and rebuild community trust.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={loginWithGoogle}
                  className="bg-black text-white px-8 py-4 rounded-full text-lg font-bold hover:scale-105 transition-transform flex items-center gap-3 shadow-xl"
                >
                  Join CivicBridge Today <ArrowRight size={20} />
                </button>
                <div className="flex items-center gap-2 text-gray-400 font-medium">
                  <Zap size={18} fill="currentColor" /> Over 10k actions completed
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 text-left">
              {[
                { 
                  title: 'Verified Trust', 
                  titleUz: 'Tasdiqlangan Ishonch',
                  icon: <ShieldCheck className="text-black" />, 
                  desc: 'Every member is verified through our community trust system.',
                  descUz: 'Har bir a\'zo jamoaviy ishonch tizimi orqali tekshiriladi.'
                },
                { 
                  title: 'Karma Logic', 
                  titleUz: 'Karma Mantiqi',
                  icon: <Zap className="text-black" />, 
                  desc: 'Karma is added only after the requester confirms help was received.',
                  descUz: 'Karma faqat yordam qabul qilingandan so\'ng qo\'shiladi.' 
                },
                { 
                  title: 'Earn & Grow', 
                  titleUz: 'Ishlang va Osing',
                  icon: <DollarSign className="text-black" />, 
                  desc: 'Help neighbors voluntarily or list professional paid services.',
                  descUz: 'Ixtiyoriy yordam bering yoki professional xizmatlarni pullik korsating.'
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="p-8 rounded-[32px] bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-black mb-1 uppercase tracking-tight">{feature.title}</h3>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">{feature.titleUz}</p>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{feature.desc}</p>
                  <p className="text-gray-400 text-xs italic">{feature.descUz}</p>
                </motion.div>
              ))}
            </div>

            <section className="mt-32 max-w-3xl mx-auto bg-black text-white p-12 rounded-[48px] text-center shadow-2xl">
               <h2 className="text-4xl font-black mb-6 uppercase tracking-tighter">Birlashgan Mahalla — Kuchli Jamiyat</h2>
               <p className="text-gray-400 text-lg mb-10 leading-relaxed font-medium">
                  CivicBridge orqali odamlar bir-biriga yordam berib, ishonchli jamoaga aylanadi. Yordam bering, Karma to\'plang va mahallangiz rivojiga hissa qo\'shing.
               </p>
               <div className="flex flex-wrap justify-center gap-4">
                  <div className="bg-white/10 px-6 py-3 rounded-2xl text-sm font-bold border border-white/10 italic">
                     "Yaxshilik qiling, u albatta qaytadi"
                  </div>
               </div>
            </section>
          </div>
        ) : (
          <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Community Feed</h1>
                <p className="text-gray-500 mt-2 font-medium">Find people who need your help or skills today.</p>
              </div>
              <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                 <button 
                    onClick={() => setActiveTab('browse')}
                    className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", activeTab === 'browse' ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black")}
                 >
                   Browse Needs
                 </button>
                 <button 
                    onClick={() => setActiveTab('my-activity')}
                    className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", activeTab === 'my-activity' ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black")}
                 >
                   My Activity
                 </button>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar Filters */}
              <div className="lg:col-span-1 space-y-6">
                <div className="p-6 bg-white border border-gray-100 rounded-[32px] shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-xs uppercase tracking-widest text-gray-400">My Neighborhoods</h3>
                    <button onClick={() => setIsMahallaModalOpen(true)} className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-all">
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <button 
                      onClick={() => setActiveMahalla(null)}
                      className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all", !activeMahalla ? "bg-black text-white" : "hover:bg-gray-50 text-gray-500")}
                    >
                      <Globe size={16} /> Global Feed
                    </button>
                    {mahallas.map(m => (
                      <div key={m.id} className="relative group/m">
                        <button 
                          onClick={() => setActiveMahalla(m)}
                          className={cn("w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all", activeMahalla?.id === m.id ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "hover:bg-gray-50 text-gray-500")}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <Users size={16} /> 
                            <span className="truncate">{m.name}</span>
                          </div>
                          <ChevronRight size={14} className={cn("transition-transform", activeMahalla?.id === m.id ? "rotate-90" : "")} />
                        </button>
                        {m.ownerId === user.uid && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setIsInviteModalOpen(m); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/m:opacity-100 bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-all"
                          >
                             <Plus size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                    {mahallas.length === 0 && (
                      <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest text-center py-4 px-2">No Mahallas joined. <br/> Create one to invite neighbors!</p>
                    )}
                  </div>
                </div>

                <div className="p-6 bg-white border border-gray-100 rounded-3xl">
                  <h3 className="font-bold flex items-center gap-2 mb-4 text-sm uppercase tracking-wider text-gray-400">
                    <Filter size={14} /> Filter by Category
                  </h3>
                  <div className="space-y-2">
                    {['All Categories', 'Errands', 'Repairs', 'Tutoring', 'Childcare', 'Elderly Care', 'Other'].map(cat => (
                      <button key={cat} className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-between group">
                        {cat}
                        <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-white border border-gray-100 rounded-3xl">
                  <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                    <Zap size={14} className="text-yellow-500" /> Top Mahalla Helpers
                  </h3>
                  <div className="space-y-4">
                    {topUsers.map((u, i) => (
                      <div key={u.uid} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center font-black text-xs">
                          {i + 1}
                        </div>
                        {u.photoURL && <img src={u.photoURL} alt="" className="w-8 h-8 rounded-lg" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{u.displayName}</p>
                          <p className="text-[10px] text-blue-600 font-black uppercase">{u.karma} XP</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3 space-y-8">
                {activeTab === 'browse' ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                        <Zap size={20} className="text-yellow-500" /> Need Help Today
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AnimatePresence mode='popLayout'>
                        {requests.length > 0 ? (
                          requests.map((req: HelpRequest) => (
                            <RequestCard key={req.id} request={req} onRespond={handleRespond} showNotification={showNotification} />
                          ))
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl"
                          >
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Search className="text-gray-300" />
                            </div>
                            <p className="text-gray-400 font-medium">No open requests in your area right now.</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-12">
                    <div>
                      <h2 className="text-xl font-black mb-6 flex items-center gap-2 uppercase tracking-tight">
                        <Clock size={20} className="text-blue-500" /> Active Tasks & Posted Needs
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myRequests.map((req: HelpRequest) => (
                          <RequestCard key={req.id} request={req} isViewOnly showNotification={showNotification} />
                        ))}
                        {myRequests.length === 0 && (
                          <div className="col-span-full py-12 text-center text-gray-400 font-medium border-2 border-dashed border-gray-100 rounded-3xl">
                            You haven't posted or accepted any tasks yet.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-600 rounded-[40px] p-8 text-white relative overflow-hidden">
                      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                          <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">Karma Logic Explained</h3>
                          <p className="text-blue-100 font-medium leading-relaxed max-w-xl">
                            Karma is awarded (+10 XP) only after the person who asked for help confirms it was received. 
                            This prevents fake points and ensures a fair community.
                          </p>
                          <p className="text-blue-200 text-xs italic mt-4">
                            Karma yordam qabul qiluvchi yordamni tasdiqlagandan keyingina qo'shiladi. Bu tizim adolatli ekanini ta'minlaydi.
                          </p>
                        </div>
                        <div className="flex gap-4">
                           <div className="bg-white/10 p-6 rounded-3xl border border-white/10 text-center">
                              <span className="block text-4xl font-black mb-1">10</span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">XP per task</span>
                           </div>
                           <div className="bg-white/10 p-6 rounded-3xl border border-white/10 text-center">
                              <span className="block text-4xl font-black mb-1">0</span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Fake Score</span>
                           </div>
                        </div>
                      </div>
                      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-50" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Action Buttons */}
      {user && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white px-8 py-4 rounded-full font-bold shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <Plus size={20} /> Ask for Help
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && <CreateRequestModal mahallas={mahallas} showNotification={showNotification} onClose={() => setIsModalOpen(false)} />}
        {isMahallaModalOpen && <CreateMahallaModal showNotification={showNotification} onClose={() => setIsMahallaModalOpen(false)} />}
        {isInviteModalOpen && <InviteMemberModal mahalla={isInviteModalOpen} showNotification={showNotification} onClose={() => setIsInviteModalOpen(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={cn(
              "fixed bottom-24 left-1/2 z-[200] px-6 py-3 rounded-2xl font-bold text-white shadow-2xl flex items-center gap-3",
              notification.type === 'success' ? "bg-green-600" : "bg-red-600"
            )}
          >
            {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

