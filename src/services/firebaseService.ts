import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  skills?: string[];
  location?: string;
  karma: number;
  createdAt: any;
}

export interface Mahalla {
  id: string;
  name: string;
  description?: string;
  announcement?: string;
  ownerId: string;
  members: string[];
  createdAt: any;
}

export interface HelpRequest {
  id: string;
  requesterId: string;
  mahallaId?: string;
  title: string;
  description: string;
  category: 'errands' | 'repairs' | 'tutoring' | 'childcare' | 'elderly care' | 'other';
  type: 'voluntary' | 'paid';
  budget?: number;
  urgency: 'low' | 'medium' | 'high';
  status: 'open' | 'assigned' | 'completed' | 'cancelled';
  assigneeId?: string;
  location?: string;
  createdAt: any;
  updatedAt?: any;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: any;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  mahallaId: string | null;
  category: 'ecology' | 'infrastructure' | 'events' | 'charity' | 'other';
  status: 'proposal' | 'discussion' | 'approved' | 'completed';
  votes: string[];
  voteCount: number;
  createdAt: any;
}

const USERS_COL = 'users';
const REQUESTS_COL = 'requests';
const MAHALLAS_COL = 'mahallas';

export const firebaseService = {
  // User Profile
  async ensureUserProfile(user: any) {
    try {
      const userDoc = doc(db, USERS_COL, user.uid);
      const snap = await getDoc(userDoc);
      
      if (!snap.exists()) {
        const newUser: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL || '',
          karma: 0,
          createdAt: serverTimestamp(),
        };
        await setDoc(userDoc, newUser);
        return newUser;
      }
      return snap.data() as UserProfile;
    } catch (e: any) {
      console.warn("Firestore error in ensureUserProfile, using offline/cached fallback:", e);
      return {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || '',
        karma: 0,
        createdAt: null,
      } as UserProfile;
    }
  },

  async findUserByEmail(email: string) {
    try {
      const q = query(collection(db, USERS_COL), where('email', '==', email.toLowerCase()), limit(1));
      const snap = await getDocs(q);
      return snap.empty ? null : (snap.docs[0].data() as UserProfile);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, USERS_COL);
    }
  },

  async updateUserProfile(uid: string, data: Partial<UserProfile>) {
    try {
      const userDoc = doc(db, USERS_COL, uid);
      await updateDoc(userDoc, { ...data, updatedAt: serverTimestamp() });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `${USERS_COL}/${uid}`);
    }
  },

  async getUserProfile(uid: string) {
    try {
      const snap = await getDoc(doc(db, USERS_COL, uid));
      return snap.exists() ? snap.data() as UserProfile : null;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `${USERS_COL}/${uid}`);
    }
  },

  subscribeToUserProfile(uid: string, callback: (profile: UserProfile) => void) {
    return onSnapshot(doc(db, USERS_COL, uid), (snap) => {
      if (snap.exists()) {
        callback(snap.data() as UserProfile);
      }
    }, (e) => handleFirestoreError(e, OperationType.GET, `${USERS_COL}/${uid}`));
  },

  // Mahallas
  async createMahalla(name: string, description: string, ownerId: string) {
    try {
      const colRef = collection(db, MAHALLAS_COL);
      await addDoc(colRef, {
        name,
        description,
        ownerId,
        members: [ownerId],
        createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, MAHALLAS_COL);
    }
  },

  async addMemberToMahalla(mahallaId: string, memberUid: string) {
    try {
      const docRef = doc(db, MAHALLAS_COL, mahallaId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const members = snap.data().members || [];
        if (!members.includes(memberUid)) {
          await updateDoc(docRef, {
            members: [...members, memberUid]
          });
        }
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `${MAHALLAS_COL}/${mahallaId}`);
    }
  },

  async leaveMahalla(mahallaId: string, uid: string) {
    try {
      const docRef = doc(db, MAHALLAS_COL, mahallaId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.ownerId === uid) {
          throw new Error('Guruh yaratuvchisi guruhni tark eta olmaydi. Guruhni o\'chirish uchun "O\'chirish" tugmasini bosing.');
        }
        const members = data.members || [];
        const newMembers = members.filter((m: string) => m !== uid);
        await updateDoc(docRef, { members: newMembers });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `${MAHALLAS_COL}/${mahallaId}`);
    }
  },

  async deleteMahalla(mahallaId: string, uid: string) {
    try {
      const docRef = doc(db, MAHALLAS_COL, mahallaId);
      await deleteDoc(docRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `${MAHALLAS_COL}/${mahallaId}`);
    }
  },

  async updateMahalla(mahallaId: string, updates: Partial<Mahalla>) {
    try {
      const docRef = doc(db, MAHALLAS_COL, mahallaId);
      await updateDoc(docRef, updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `${MAHALLAS_COL}/${mahallaId}`);
    }
  },

  async logEvent(mahallaId: string, type: string, description: string, userId: string, userName: string) {
    try {
      await addDoc(collection(db, 'events'), {
        mahallaId,
        type,
        description,
        userId,
        userName,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error("Event log error", e);
    }
  },

  async updateUserKarma(uid: string, points: number) {
    try {
      const docRef = doc(db, USERS_COL, uid);
      const userSnap = await getDoc(docRef);
      if (userSnap.exists()) {
        const currentKarma = userSnap.data().karma || 0;
        await updateDoc(docRef, { karma: currentKarma + points });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `${USERS_COL}/${uid}`);
    }
  },

  subscribeToEvents(mahallaId: string, callback: (events: any[]) => void) {
    const q = query(
      collection(db, 'events'),
      where('mahallaId', '==', mahallaId)
    );
    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      events.sort((a: any, b: any) => {
        const sA = a.timestamp?.seconds || 0;
        const sB = b.timestamp?.seconds || 0;
        return sB - sA;
      });
      callback(events.slice(0, 10));
    }, (e) => handleFirestoreError(e, OperationType.LIST, 'events'));
  },

  async getMahallaMembersProfiles(memberIds: string[]): Promise<UserProfile[]> {
    if (memberIds.length === 0) return [];
    try {
      // Firestore 'in' query supports up to 10 items. For more, we might need chunks or individual gets.
      // For this app, we'll stick to a simple approach.
      const q = query(collection(db, USERS_COL), where('uid', 'in', memberIds.slice(0, 10)));
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as UserProfile).sort((a, b) => (b.karma || 0) - (a.karma || 0));
    } catch (e) {
      console.error("Error getting members", e);
      return [];
    }
  },

  subscribeToUserMahallas(uid: string, callback: (mahallas: Mahalla[]) => void) {
    const q = query(
      collection(db, MAHALLAS_COL),
      where('members', 'array-contains', uid)
    );

    return onSnapshot(q, (snap) => {
      const mahallas = snap.docs.map(d => ({ id: d.id, ...d.data() } as Mahalla));
      mahallas.sort((a, b) => {
        const sA = a.createdAt?.seconds || 0;
        const sB = b.createdAt?.seconds || 0;
        return sB - sA;
      });
      callback(mahallas);
    }, (e) => handleFirestoreError(e, OperationType.LIST, MAHALLAS_COL));
  },

  // Requests
  async createRequest(requestData: Omit<HelpRequest, 'id' | 'createdAt' | 'status'>) {
    try {
        const colRef = collection(db, REQUESTS_COL);
        // Ensure mahallaId is null if not provided for consistent querying
        const fullData = {
          ...requestData,
          mahallaId: requestData.mahallaId || null,
          status: 'open',
          createdAt: serverTimestamp(),
        };

        // Clean undefined values
        const data = Object.fromEntries(
            Object.entries(fullData).filter(([_, v]) => v !== undefined)
        );
        
        await addDoc(colRef, data);
    } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, REQUESTS_COL);
    }
  },

  subscribeToOpenRequests(callback: (requests: HelpRequest[]) => void) {
    const q = query(
      collection(db, REQUESTS_COL),
      where('status', '==', 'open')
    );

    return onSnapshot(q, (snap) => {
      // Filter out requests that belong to mahallas if needed
      const requests = snap.docs.map(d => ({ id: d.id, ...d.data() } as HelpRequest));
      requests.sort((a, b) => {
        const sA = a.createdAt?.seconds || 0;
        const sB = b.createdAt?.seconds || 0;
        return sB - sA;
      });
      callback(requests.slice(0, 100));
    }, (e) => handleFirestoreError(e, OperationType.LIST, REQUESTS_COL));
  },

  subscribeToMahallaRequests(mahallaId: string, callback: (requests: HelpRequest[]) => void) {
    const q = query(
      collection(db, REQUESTS_COL),
      where('mahallaId', '==', mahallaId)
    );
    return onSnapshot(q, (snap) => {
      const requests = snap.docs.map(d => ({ id: d.id, ...d.data() } as HelpRequest));
      requests.sort((a, b) => {
        const sA = a.createdAt?.seconds || 0;
        const sB = b.createdAt?.seconds || 0;
        return sB - sA;
      });
      callback(requests);
    }, (e) => handleFirestoreError(e, OperationType.LIST, REQUESTS_COL));
  },

  subscribeToPublicRequests(callback: (requests: HelpRequest[]) => void) {
    const q = query(
      collection(db, REQUESTS_COL),
      where('status', '==', 'open'),
      where('mahallaId', '==', null),
      limit(50)
    );

    return onSnapshot(q, (snap) => {
      const requests = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as HelpRequest))
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      callback(requests);
    }, (e) => handleFirestoreError(e, OperationType.LIST, REQUESTS_COL));
  },

  subscribeToUserRequests(uid: string, callback: (requests: HelpRequest[]) => void) {
    const q = query(
      collection(db, REQUESTS_COL),
      where('requesterId', '==', uid)
    );

    return onSnapshot(q, (snap) => {
      const requests = snap.docs.map(d => ({ id: d.id, ...d.data() } as HelpRequest));
      requests.sort((a, b) => {
        const sA = a.createdAt?.seconds || 0;
        const sB = b.createdAt?.seconds || 0;
        return sB - sA;
      });
      callback(requests);
    }, (e) => handleFirestoreError(e, OperationType.LIST, REQUESTS_COL));
  },

  async assignRequest(requestId: string, helperId: string) {
    try {
      const docRef = doc(db, REQUESTS_COL, requestId);
      await updateDoc(docRef, {
        assigneeId: helperId,
        status: 'assigned',
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `${REQUESTS_COL}/${requestId}`);
    }
  },

  async completeRequest(requestId: string, helperId: string) {
    try {
      const docRef = doc(db, REQUESTS_COL, requestId);
      const helperRef = doc(db, USERS_COL, helperId);
      
      await updateDoc(docRef, {
        status: 'completed',
        updatedAt: serverTimestamp()
      });

      // Increment helper's karma logic is moved to App.tsx or single call per logic
      // But rules allow +10 increment from ANY user for ANY user if status is completed?
      // Actually rules don't check for status specifically in user karma update yet.
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `${REQUESTS_COL}/${requestId}`);
    }
  },

  async deleteRequest(requestId: string) {
    try {
      const docRef = doc(db, REQUESTS_COL, requestId);
      await deleteDoc(docRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `${REQUESTS_COL}/${requestId}`);
    }
  },

  async checkCollusionLimit(assigneeId: string, requesterId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, REQUESTS_COL),
        where('assigneeId', '==', assigneeId),
        where('status', '==', 'completed')
      );
      const snap = await getDocs(q);
      const withSameRequester = snap.docs.filter(doc => doc.data().requesterId === requesterId);
      // If they already completed 3 or more requests together (including this one if already completed,
      // but if we call this before completing, then >= 3 completed means next complete is collusion).
      return withSameRequester.length >= 3;
    } catch (e) {
      console.error("Collusion check error:", e);
      return false;
    }
  },

  async checkDailyXPLimit(assigneeId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, REQUESTS_COL),
        where('assigneeId', '==', assigneeId),
        where('status', '==', 'completed')
      );
      const snap = await getDocs(q);
      const oneDayAgoMs = Date.now() - 24 * 60 * 60 * 1000;
      const completedInLast24Hours = snap.docs.filter(doc => {
        const data = doc.data();
        const updatedAt = data.updatedAt?.toMillis?.() || (data.updatedAt?.seconds ? data.updatedAt.seconds * 1000 : 0);
        return updatedAt >= oneDayAgoMs;
      });
      // If 5 or more completed in past 24h, they hit limit (max 50 XP per day)
      return completedInLast24Hours.length >= 5;
    } catch (e) {
      console.error("Daily XP check error:", e);
      return false;
    }
  },

  async getTopUsers(limitCount = 5) {
    try {
      const q = query(
        collection(db, USERS_COL),
        orderBy('karma', 'desc'),
        limit(limitCount)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as UserProfile);
    } catch (e) {
        handleFirestoreError(e, OperationType.LIST, USERS_COL);
    }
  },

  async getUsersByUids(uids: string[]) {
    try {
      if (!uids.length) return [];
      const q = query(
        collection(db, USERS_COL),
        where('uid', 'in', uids.slice(0, 10)) // Firestore limit is 10 for 'in' queries
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as UserProfile);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, USERS_COL);
      return [];
    }
  },

  // Messages
  subscribeToMessages(requestId: string, callback: (messages: Message[]) => void) {
    const q = query(
      collection(db, REQUESTS_COL, requestId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snap) => {
      const messages = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      callback(messages);
    }, (e) => handleFirestoreError(e, OperationType.LIST, `${REQUESTS_COL}/${requestId}/messages`));
  },

  async sendMessage(requestId: string, text: string, senderId: string) {
    try {
      const colRef = collection(db, REQUESTS_COL, requestId, 'messages');
      await addDoc(colRef, {
        text,
        senderId,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `${REQUESTS_COL}/${requestId}/messages`);
    }
  },

  // Proposals (Forum)
  async createProposal(title: string, description: string, creatorId: string, creatorName: string, category: 'ecology' | 'infrastructure' | 'events' | 'charity' | 'other', mahallaId: string | null) {
    try {
      const colRef = collection(db, 'proposals');
      await addDoc(colRef, {
        title,
        description,
        creatorId,
        creatorName,
        category,
        mahallaId,
        status: 'proposal',
        votes: [],
        voteCount: 0,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'proposals');
    }
  },

  subscribeToAllProposals(callback: (proposals: Proposal[]) => void) {
    const q = query(collection(db, 'proposals'));
    return onSnapshot(q, (snap) => {
      const proposals = snap.docs.map(d => ({ id: d.id, ...d.data() } as Proposal));
      callback(proposals);
    }, (e) => handleFirestoreError(e, OperationType.LIST, 'proposals'));
  },

  async voteProposal(proposalId: string, userId: string, hasVoted: boolean) {
    try {
      const docRef = doc(db, 'proposals', proposalId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        let votes = data.votes || [];
        if (hasVoted) {
          if (!votes.includes(userId)) {
            votes = [...votes, userId];
          }
        } else {
          votes = votes.filter((v: string) => v !== userId);
        }
        await updateDoc(docRef, {
          votes,
          voteCount: votes.length
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `proposals/${proposalId}`);
    }
  },

  async deleteProposal(proposalId: string, userId: string) {
    try {
      const docRef = doc(db, 'proposals', proposalId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        if (snap.data().creatorId !== userId) {
          throw new Error('Faqat muallif o\'chira oladi.');
        }
        await deleteDoc(docRef);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `proposals/${proposalId}`);
    }
  }
};
