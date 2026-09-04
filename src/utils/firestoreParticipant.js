/**
 * firestoreParticipant.js
 * All Firestore read/write operations for the participants collection.
 */

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase.js";

const COL = "participants";

/** Save a new participant document. passId is the document ID. */
export async function saveParticipant(data) {
  const ref = doc(db, COL, data.passId);
  await setDoc(ref, {
    ...data,
    registeredAt: serverTimestamp(),
  });
}

/** Fetch a single participant by passId. Returns null if not found. */
export async function getParticipant(passId) {
  const ref  = doc(db, COL, passId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Mark an on-spot payment as PAID. */
export async function markOnSpotPaid(passId) {
  const ref = doc(db, COL, passId);
  await updateDoc(ref, {
    "payment.status": "PAID",
  });
}

/** Mark a participant as checked-in. */
export async function markCheckIn(passId) {
  const ref = doc(db, COL, passId);
  await updateDoc(ref, {
    "checkIn.status":      "CHECKED_IN",
    "checkIn.checkedInAt": serverTimestamp(),
  });
}

/**
 * Admin: search participants by various fields.
 * Firestore doesn't support OR queries across fields natively,
 * so we do three separate queries and merge unique results.
 */
export async function searchParticipants(term) {
  const upper  = term.trim().toUpperCase();
  const lower  = term.trim().toLowerCase();
  const normal = term.trim();

  const results = new Map();

  const addSnap = (snap) => {
    snap.forEach((d) => results.set(d.id, { id: d.id, ...d.data() }));
  };

  const col = collection(db, COL);

  // Search by passId (exact)
  if (upper.startsWith("NXT26-")) {
    const snap = await getDocs(query(col, where("passId", "==", upper)));
    addSnap(snap);
  }

  // Search by phone number (exact)
  if (/^\d{10}$/.test(normal)) {
    const snap = await getDocs(query(col, where("phoneNumber", "==", normal)));
    addSnap(snap);
  }

  // Search by register number (exact)
  const snapReg = await getDocs(query(col, where("registerNumber", "==", normal)));
  addSnap(snapReg);

  // Search by email (exact)
  const snapEmail = await getDocs(query(col, where("email", "==", lower)));
  addSnap(snapEmail);

  return Array.from(results.values());
}

/**
 * Admin: get all participants, ordered by registration time desc.
 * Falls back to unordered if the index doesn't exist yet.
 */
export async function getAllParticipants(limitCount = 100) {
  const col = collection(db, COL);
  try {
    const q    = query(col, orderBy("registeredAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.slice(0, limitCount).map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    // orderBy fails if index not built yet — fall back to unordered fetch
    const snap = await getDocs(col);
    return snap.docs.slice(0, limitCount).map((d) => ({ id: d.id, ...d.data() }));
  }
}
