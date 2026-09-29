import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import {
  UserProfile,
  MasjidTenant,
  PengaturanMasjid,
  TransaksiPemasukan,
  TransaksiPengeluaran,
  Pengurus,
  KategoriPemasukan,
  KategoriPengeluaran,
} from '../types';
import { dbService } from './db';

const googleProvider = new GoogleAuthProvider();

export class CloudService {
  private currentMasjidId: string | null = null;
  private unsubscribeListeners: (() => void)[] = [];

  public setMasjidId(masjidId: string | null) {
    this.currentMasjidId = masjidId;
  }

  public getMasjidId(): string | null {
    return this.currentMasjidId;
  }

  // --- AUTHENTICATION ---

  public onAuthChange(callback: (user: FirebaseUser | null, profile: UserProfile | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        this.currentMasjidId = null;
        callback(null, null);
        return;
      }

      // Fetch or auto-create UserProfile
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDocPath = `users/${firebaseUser.uid}`;
      try {
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const profile = snap.data() as UserProfile;
          this.currentMasjidId = profile.masjidId;
          callback(firebaseUser, profile);
        } else {
          // Default profile if just signed up
          const defaultMasjidId = `MSJ-${firebaseUser.uid.substring(0, 6).toUpperCase()}`;
          const newProfile: UserProfile = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Pengurus',
            masjidId: defaultMasjidId,
            role: 'bendahara',
            createdAt: new Date().toISOString(),
          };

          await setDoc(userRef, newProfile);

          // Also ensure initial masjid document exists
          try {
            const masjidRef = doc(db, 'masjids', defaultMasjidId);
            const mSnap = await getDoc(masjidRef);
            if (!mSnap.exists()) {
              const initialMasjid: MasjidTenant = {
                id: defaultMasjidId,
                namaMasjid: 'Masjid Jami',
                ownerId: firebaseUser.uid,
                ownerEmail: firebaseUser.email || '',
                createdAt: new Date().toISOString(),
              };
              await setDoc(masjidRef, initialMasjid);
            }
          } catch (mErr) {
            console.warn('Init masjid on auth notice:', mErr);
          }

          this.currentMasjidId = defaultMasjidId;
          callback(firebaseUser, newProfile);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, userDocPath);
        callback(firebaseUser, null);
      }
    });
  }

  // Register with Email & Password (User explicitly requested!)
  public async registerWithEmail(
    email: string,
    pass: string,
    displayName: string,
    namaMasjid: string
  ): Promise<{ user: FirebaseUser; profile: UserProfile }> {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }

    const masjidId = `MSJ-${cred.user.uid.substring(0, 6).toUpperCase()}`;
    const newProfile: UserProfile = {
      id: cred.user.uid,
      email: cred.user.email || email,
      displayName: displayName || email.split('@')[0],
      masjidId: masjidId,
      role: 'ketua',
      createdAt: new Date().toISOString(),
    };

    // Save user profile
    const userPath = `users/${cred.user.uid}`;
    try {
      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, userPath);
    }

    // Save initial masjid record
    const masjidPath = `masjids/${masjidId}`;
    try {
      const initialMasjid: MasjidTenant = {
        id: masjidId,
        namaMasjid: namaMasjid || 'Masjid Jami',
        ownerId: cred.user.uid,
        ownerEmail: cred.user.email || email,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'masjids', masjidId), initialMasjid);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, masjidPath);
    }

    this.currentMasjidId = masjidId;
    return { user: cred.user, profile: newProfile };
  }

  // Login with Email & Password
  public async loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  }

  // Send Password Reset Email (Lupa Password)
  public async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  // Login with Google (1-Click Popup)
  public async loginWithGoogle(): Promise<FirebaseUser> {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  }

  // Logout
  public async logoutUser(): Promise<void> {
    this.unsubscribeAllListeners();
    this.currentMasjidId = null;
    await signOut(auth);
  }

  // Join existing Mosque using Masjid ID Code
  public async switchOrJoinMasjid(userId: string, newMasjidId: string): Promise<void> {
    const cleanId = newMasjidId.trim().toUpperCase();
    const userPath = `users/${userId}`;
    try {
      await updateDoc(doc(db, 'users', userId), {
        masjidId: cleanId,
      });
      this.currentMasjidId = cleanId;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, userPath);
    }
  }

  // --- FIRESTORE REAL-TIME SYNC FOR MASJID ---

  public unsubscribeAllListeners() {
    this.unsubscribeListeners.forEach((unsub) => unsub());
    this.unsubscribeListeners = [];
  }

  // Real-time listener for Settings / Profile
  public subscribePengaturan(
    masjidId: string,
    callback: (data: PengaturanMasjid) => void
  ): () => void {
    const path = `masjids/${masjidId}`;
    const unsub = onSnapshot(
      doc(db, 'masjids', masjidId),
      (snap) => {
        if (snap.exists()) {
          const tenant = snap.data() as MasjidTenant;
          if (tenant.pengaturan) {
            callback(tenant.pengaturan);
          } else {
            callback({
              namaMasjid: tenant.namaMasjid || '',
              alamat: '',
              telepon: '',
              email: tenant.ownerEmail || '',
              website: '',
              namaKetua: '',
              namaBendahara: '',
              rekeningBank: '',
              namaBank: '',
              atasNamaRekening: '',
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    this.unsubscribeListeners.push(unsub);
    return unsub;
  }

  // Real-time listener for Pemasukan
  public subscribePemasukan(
    masjidId: string,
    callback: (items: TransaksiPemasukan[]) => void
  ): () => void {
    const path = `masjids/${masjidId}/pemasukan`;
    const colRef = collection(db, 'masjids', masjidId, 'pemasukan');
    const q = query(colRef);
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items: TransaksiPemasukan[] = [];
        snapshot.forEach((d) => items.push(d.data() as TransaksiPemasukan));
        // Sort newest first
        items.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    this.unsubscribeListeners.push(unsub);
    return unsub;
  }

  // Real-time listener for Pengeluaran
  public subscribePengeluaran(
    masjidId: string,
    callback: (items: TransaksiPengeluaran[]) => void
  ): () => void {
    const path = `masjids/${masjidId}/pengeluaran`;
    const colRef = collection(db, 'masjids', masjidId, 'pengeluaran');
    const q = query(colRef);
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items: TransaksiPengeluaran[] = [];
        snapshot.forEach((d) => items.push(d.data() as TransaksiPengeluaran));
        // Sort newest first
        items.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    this.unsubscribeListeners.push(unsub);
    return unsub;
  }

  // Real-time listener for Pengurus
  public subscribePengurus(
    masjidId: string,
    callback: (items: Pengurus[]) => void
  ): () => void {
    const path = `masjids/${masjidId}/pengurus`;
    const colRef = collection(db, 'masjids', masjidId, 'pengurus');
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        const items: Pengurus[] = [];
        snapshot.forEach((d) => items.push(d.data() as Pengurus));
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    this.unsubscribeListeners.push(unsub);
    return unsub;
  }

  // --- CRUD OPERATIONS IN FIRESTORE ---

  public async savePengaturan(masjidId: string, settings: PengaturanMasjid): Promise<void> {
    const path = `masjids/${masjidId}`;
    try {
      await updateDoc(doc(db, 'masjids', masjidId), {
        namaMasjid: settings.namaMasjid,
        pengaturan: settings,
        updatedAt: new Date().toISOString(),
      });
      // also sync to local storage for offline resilience
      await dbService.savePengaturan(settings);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  public async addOrUpdatePemasukan(masjidId: string, item: TransaksiPemasukan): Promise<void> {
    const path = `masjids/${masjidId}/pemasukan/${item.id}`;
    try {
      await setDoc(doc(db, 'masjids', masjidId, 'pemasukan', item.id), item);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  public async deletePemasukan(masjidId: string, itemId: string): Promise<void> {
    const path = `masjids/${masjidId}/pemasukan/${itemId}`;
    try {
      await deleteDoc(doc(db, 'masjids', masjidId, 'pemasukan', itemId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  public async addOrUpdatePengeluaran(masjidId: string, item: TransaksiPengeluaran): Promise<void> {
    const path = `masjids/${masjidId}/pengeluaran/${item.id}`;
    try {
      await setDoc(doc(db, 'masjids', masjidId, 'pengeluaran', item.id), item);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  public async deletePengeluaran(masjidId: string, itemId: string): Promise<void> {
    const path = `masjids/${masjidId}/pengeluaran/${itemId}`;
    try {
      await deleteDoc(doc(db, 'masjids', masjidId, 'pengeluaran', itemId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  public async addOrUpdatePengurus(masjidId: string, item: Pengurus): Promise<void> {
    const path = `masjids/${masjidId}/pengurus/${item.id}`;
    try {
      await setDoc(doc(db, 'masjids', masjidId, 'pengurus', item.id), item);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  public async deletePengurus(masjidId: string, itemId: string): Promise<void> {
    const path = `masjids/${masjidId}/pengurus/${itemId}`;
    try {
      await deleteDoc(doc(db, 'masjids', masjidId, 'pengurus', itemId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
}

export const cloudService = new CloudService();
