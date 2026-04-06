import { db } from '../firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query
} from 'firebase/firestore';

/**
 * Creates a new document in the specified collection.
 * @param {string} collectionName - The name of the collection
 * @param {Object} data - The document data
 * @returns {Promise<Object>} The created document with its new ID
 */
export const createDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Retrieves a single document by its ID.
 * @param {string} collectionName - The name of the collection
 * @param {string} id - The document ID
 * @returns {Promise<Object|null>} The document data or null if it doesn't exist
 */
export const getDocument = async (collectionName, id) => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting document ${id} from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Retrieves all documents from a collection, optionally filtered by constraints.
 * @param {string} collectionName - The name of the collection
 * @param {Array} queryConstraints - Optional query constraints (e.g., where, orderBy)
 * @returns {Promise<Array>} An array of documents
 */
export const getDocuments = async (collectionName, queryConstraints = []) => {
  try {
    const q = query(collection(db, collectionName), ...queryConstraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Updates an existing document.
 * @param {string} collectionName - The name of the collection
 * @param {string} id - The document ID
 * @param {Object} data - The data to update
 * @returns {Promise<Object>} The updated document data with its ID
 */
export const updateDocument = async (collectionName, id, data) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
    return { id, ...data };
  } catch (error) {
    console.error(`Error updating document ${id} in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Deletes a document by its ID.
 * @param {string} collectionName - The name of the collection
 * @param {string} id - The document ID
 * @returns {Promise<boolean>} Returns true if deletion was successful
 */
export const deleteDocument = async (collectionName, id) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
    return true;
  } catch (error) {
    console.error(`Error deleting document ${id} from ${collectionName}:`, error);
    throw error;
  }
};
