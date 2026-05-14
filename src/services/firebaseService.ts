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
  category: 'errands' | 'repairs' | 'tutoring' | 'childcare' | 'elderly' | 'other';
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

const USERS_COL = 'users';
const REQUESTS_COL = 'requests';
const MAHALLAS_COL = 'mahallas';

export const firebaseService = {
  // User Profile
  async ensureUserProfile(user: any) {
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

  subscribeToUserMahallas(uid: string, callback: (mahallas: Mahalla[]) => void) {
    const q = query(
      collection(db, MAHALLAS_COL),
      where('members', 'array-contains', uid),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snap) => {
      const mahallas = snap.docs.map(d => ({ id: d.id, ...d.data() } as Mahalla));
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
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    return onSnapshot(q, (snap) => {
      // Filter out requests that belong to mahallas if needed (logic can be complex in FireStore rules vs client)
      // For now, we fetch all open and rely on rules to permit/deny reads
      // Better strategy: separately fetch public ones and mahalla-specific ones.
      const requests = snap.docs.map(d => ({ id: d.id, ...d.data() } as HelpRequest));
      callback(requests);
    }, (e) => handleFirestoreError(e, OperationType.LIST, REQUESTS_COL));
  },

  subscribeToMahallaRequests(mahallaId: string, callback: (requests: HelpRequest[]) => void) {
    const q = query(
      collection(db, REQUESTS_COL),
      where('mahallaId', '==', mahallaId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const requests = snap.docs.map(d => ({ id: d.id, ...d.data() } as HelpRequest));
      callback(requests);
    }, (e) => handleFirestoreError(e, OperationType.LIST, REQUESTS_COL));
  },

  subscribeToPublicRequests(callback: (requests: HelpRequest[]) => void) {
    const q = query(
      collection(db, REQUESTS_COL),
      where('status', '==', 'open'),
      where('mahallaId', '==', null),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snap) => {
      const requests = snap.docs.map(d => ({ id: d.id, ...d.data() } as HelpRequest));
      callback(requests);
    }, (e) => handleFirestoreError(e, OperationType.LIST, REQUESTS_COL));
  },

  subscribeToUserRequests(uid: string, callback: (requests: HelpRequest[]) => void) {
    const q = query(
      collection(db, REQUESTS_COL),
      where('requesterId', '==', uid),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snap) => {
      const requests = snap.docs.map(d => ({ id: d.id, ...d.data() } as HelpRequest));
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

      // Increment helper's karma
      const helperSnap = await getDoc(helperRef);
      if (helperSnap.exists()) {
        const currentKarma = helperSnap.data().karma || 0;
        await updateDoc(helperRef, {
          karma: currentKarma + 10
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `${REQUESTS_COL}/${requestId}`);
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
  }
};
