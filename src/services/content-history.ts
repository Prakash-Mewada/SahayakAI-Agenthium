import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';

const HISTORY_COLLECTION = 'contentHistory';

export interface HistoryItem {
  id: string;
  content: string;
  date: string;
}

export async function saveContentToHistory(content: string): Promise<string> {
  const docRef = await addDoc(collection(db, HISTORY_COLLECTION), {
    content,
    date: new Date().toISOString(),
  });
  return docRef.id;
}

export async function getContentHistory(): Promise<HistoryItem[]> {
  const q = query(collection(db, HISTORY_COLLECTION), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  const history: HistoryItem[] = [];
  querySnapshot.forEach((doc) => {
    history.push({ id: doc.id, ...doc.data() } as HistoryItem);
  });
  return history;
}

export async function getRecentContentHistory(count: number): Promise<HistoryItem[]> {
    const q = query(collection(db, HISTORY_COLLECTION), orderBy('date', 'desc'), limit(count));
    const querySnapshot = await getDocs(q);
    const history: HistoryItem[] = [];
    querySnapshot.forEach((doc) => {
      history.push({ id: doc.id, ...doc.data() } as HistoryItem);
    });
    return history;
  }

export async function deleteContentFromHistory(id: string): Promise<void> {
  await deleteDoc(doc(db, HISTORY_COLLECTION, id));
}
