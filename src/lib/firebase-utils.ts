import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db, COLLECTIONS, type ThumbnailData } from './firebase';
import { auth } from './firebase';

const ensureAuth = () => {
  if (!auth.currentUser) {
    throw new Error('Authentication required');
  }
  return auth.currentUser;
};

// Thumbnail operations
export const saveThumbnail = async (data: Omit<ThumbnailData, 'createdAt' | 'updatedAt'>) => {
  try {
    ensureAuth();
    const thumbnailRef = collection(db, COLLECTIONS.THUMBNAILS);
    const timestamp = serverTimestamp();
    const docRef = await addDoc(thumbnailRef, {
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving thumbnail:', error);
    throw new Error('Failed to save thumbnail data');
  }
};

export const getUserThumbnails = async (userId: string) => {
  try {
    ensureAuth();
    const thumbnailsRef = collection(db, COLLECTIONS.THUMBNAILS);
    
    // Create a basic query first
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId)
    ];

    try {
      // Try with ordering by createdAt
      constraints.push(orderBy('createdAt', 'desc'));
      const q = query(thumbnailsRef, ...constraints);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (indexError: any) {
      if (indexError?.code === 'failed-precondition') {
        // If the composite index doesn't exist, fall back to a simpler query
        console.warn('Composite index missing - falling back to basic query');
        const q = query(thumbnailsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        // Sort in memory as fallback
        return querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .sort((a: any, b: any) => b.createdAt?.seconds - a.createdAt?.seconds);
      }
      throw indexError;
    }
  } catch (error) {
    console.error('Error fetching thumbnails:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch user thumbnails: ${error.message}`);
    }
    throw new Error('Failed to fetch user thumbnails');
  }
};

export const deleteThumbnail = async (thumbnailId: string) => {
  try {
    ensureAuth();
    const thumbnailRef = doc(db, COLLECTIONS.THUMBNAILS, thumbnailId);
    await deleteDoc(thumbnailRef);
  } catch (error) {
    console.error('Error deleting thumbnail:', error);
    throw new Error('Failed to delete thumbnail');
  }
};