import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAeTm_tbApGJM7Q8tvJ7Cet-tFkUrM5qJg",
  authDomain: "songkhla-thai-innovation.firebaseapp.com",
  databaseURL:
    "https://songkhla-thai-innovation-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "songkhla-thai-innovation",
  storageBucket: "songkhla-thai-innovation.firebasestorage.app",
  messagingSenderId: "168470512175",
  appId: "1:168470512175:web:440639e644d975b5543cda",
  measurementId: "G-R5HPKSE9N1",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
