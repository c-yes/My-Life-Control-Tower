import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyATzZDJieh-DIrXaTM_NvRcJFkzDpit13I",
  authDomain: "my-life-s-control-tower.firebaseapp.com",
  projectId: "my-life-s-control-tower",
  storageBucket: "my-life-s-control-tower.firebasestorage.app",
  messagingSenderId: "127075248445",
  appId: "1:127075248445:web:03b7445dbc8a7299a33d54",
  measurementId: "G-74YTHRZF8H"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
