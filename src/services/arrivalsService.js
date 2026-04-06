import { db } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Builds the Firestore document ID for an arrivals day.
 * Format: {hostelId}_{YYYYMMDD}
 */
const buildArrivalsDocId = (hostelId, date) => `${hostelId}_${date}`;

/**
 * Checks if an arrivals document already exists in Firestore for this hostel+date.
 * @param {string} hostelId
 * @param {string} date - YYYYMMDD format
 * @returns {Promise<Object|null>} The document data or null
 */
export const getArrivalsDoc = async (hostelId, date) => {
  try {
    const docId = buildArrivalsDocId(hostelId, date);
    const docRef = doc(db, 'arrivals', docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error checking arrivals doc:', error);
    throw error;
  }
};

/**
 * Saves a fresh list of bookings from Beds24 into Firestore.
 * Creates the parent arrivals doc + all booking sub-documents.
 * All bookings get messagingStatus = "todo" by default.
 *
 * @param {string} hostelId
 * @param {string} date - YYYYMMDD format
 * @param {Array} bookings - Raw bookings from Beds24
 * @returns {Promise<Array>} The saved bookings with messaging fields
 */
export const saveArrivals = async (hostelId, date, bookings, autoHandleHW = true) => {
  try {
    const docId = buildArrivalsDocId(hostelId, date);
    const arrivalsDocRef = doc(db, 'arrivals', docId);

    // Create the parent arrivals document
    await setDoc(arrivalsDocRef, {
      hostelId,
      date,
      fetchedAt: new Date().toISOString(),
      bookingCount: bookings.length
    });

    // Batch write all bookings as sub-documents
    const batch = writeBatch(db);
    const savedBookings = [];

    for (const booking of bookings) {
      const bookId = String(booking.bookId);
      const bookingRef = doc(db, 'arrivals', docId, 'bookings', bookId);

      const isHW = autoHandleHW && booking.referer === 'Hostelworld.com';

      const bookingData = {
        ...booking,
        messagingStatus: isHW ? 'done' : 'todo',
        messagingChannel: isHW ? 'email' : null,
        messagingUpdatedAt: isHW ? new Date().toISOString() : null
      };

      batch.set(bookingRef, bookingData);
      savedBookings.push(bookingData);
    }

    await batch.commit();
    console.log(`Saved ${bookings.length} bookings to Firestore for ${docId}`);

    return savedBookings;
  } catch (error) {
    console.error('Error saving arrivals:', error);
    throw error;
  }
};

/**
 * Loads all cached bookings from Firestore for a hostel+date.
 *
 * @param {string} hostelId
 * @param {string} date - YYYYMMDD format
 * @returns {Promise<Array>} Array of booking objects with messaging fields
 */
export const loadArrivalsFromFirestore = async (hostelId, date) => {
  try {
    const docId = buildArrivalsDocId(hostelId, date);
    const bookingsRef = collection(db, 'arrivals', docId, 'bookings');
    const querySnapshot = await getDocs(bookingsRef);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error loading arrivals from Firestore:', error);
    throw error;
  }
};

/**
 * Syncs fresh Beds24 data with existing Firestore data.
 * - New bookings → added with messagingStatus = "todo"
 * - Cancelled bookings (in Firestore but not in Beds24) → removed
 * - Existing bookings → Beds24 fields updated, messaging fields preserved
 *
 * @param {string} hostelId
 * @param {string} date - YYYYMMDD format
 * @param {Array} freshBookings - Fresh bookings from Beds24
 * @returns {Promise<{added: number, removed: number, updated: number}>} Sync stats
 */
export const syncArrivals = async (hostelId, date, freshBookings, autoHandleHW = true) => {
  try {
    const docId = buildArrivalsDocId(hostelId, date);

    // Load existing bookings from Firestore
    const existingBookings = await loadArrivalsFromFirestore(hostelId, date);
    const existingMap = new Map(existingBookings.map(b => [String(b.bookId), b]));
    const freshMap = new Map(freshBookings.map(b => [String(b.bookId), b]));

    const batch = writeBatch(db);
    let added = 0;
    let removed = 0;
    let updated = 0;

    // Add new bookings & update existing
    for (const [bookId, freshBooking] of freshMap) {
      const bookingRef = doc(db, 'arrivals', docId, 'bookings', bookId);
      const existing = existingMap.get(bookId);
      const isHW = autoHandleHW && freshBooking.referer === 'Hostelworld.com';

      if (!existing) {
        // New booking — apply HW logic if needed
        batch.set(bookingRef, {
          ...freshBooking,
          messagingStatus: isHW ? 'done' : 'todo',
          messagingChannel: isHW ? 'email' : null,
          messagingUpdatedAt: isHW ? new Date().toISOString() : null
        });
        added++;
      } else {
        // Existing booking — update Beds24 fields, preserve messaging fields
        // Default HW to 'done' if it's somehow left as 'todo'
        const newStatus = (isHW && existing.messagingStatus === 'todo') ? 'done' : (existing.messagingStatus || 'todo');
        const newChannel = (isHW && existing.messagingStatus === 'todo') ? 'email' : (existing.messagingChannel || null);
        const newUpdatedAt = (isHW && existing.messagingStatus === 'todo') ? new Date().toISOString() : (existing.messagingUpdatedAt || null);

        batch.set(bookingRef, {
          ...freshBooking,
          messagingStatus: newStatus,
          messagingChannel: newChannel,
          messagingUpdatedAt: newUpdatedAt
        });
        updated++;
      }
    }

    // Remove cancelled bookings (in Firestore but not in fresh Beds24 data)
    for (const [bookId] of existingMap) {
      if (!freshMap.has(bookId)) {
        const bookingRef = doc(db, 'arrivals', docId, 'bookings', bookId);
        batch.delete(bookingRef);
        removed++;
      }
    }

    // Update the parent document
    const arrivalsDocRef = doc(db, 'arrivals', docId);
    batch.set(arrivalsDocRef, {
      hostelId,
      date,
      fetchedAt: new Date().toISOString(),
      bookingCount: freshBookings.length
    }, { merge: true });

    await batch.commit();

    console.log(`Sync complete for ${docId}: +${added} new, -${removed} removed, ~${updated} updated`);
    return { added, removed, updated };
  } catch (error) {
    console.error('Error syncing arrivals:', error);
    throw error;
  }
};

/**
 * Updates the messaging status for a single booking.
 *
 * @param {string} hostelId
 * @param {string} date - YYYYMMDD format
 * @param {string|number} bookId - The booking ID
 * @param {string} status - "todo", "done", or "error"
 * @param {string|null} channel - "whatsapp" or "email"
 * @returns {Promise<void>}
 */
export const updateBookingMessagingStatus = async (hostelId, date, bookId, status, channel = null) => {
  try {
    const docId = buildArrivalsDocId(hostelId, date);
    const bookingRef = doc(db, 'arrivals', docId, 'bookings', String(bookId));

    await setDoc(bookingRef, {
      messagingStatus: status,
      messagingChannel: channel,
      messagingUpdatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`Updated booking ${bookId} messaging status to "${status}" (${channel})`);
  } catch (error) {
    console.error('Error updating booking messaging status:', error);
    throw error;
  }
};

/**
 * Updates a single field on a booking document in Firestore.
 *
 * @param {string} hostelId
 * @param {string} date - YYYYMMDD format
 * @param {string|number} bookId - The booking ID
 * @param {string} field - The field name to update
 * @param {*} value - The new value
 * @returns {Promise<void>}
 */
export const updateBookingField = async (hostelId, date, bookId, field, value) => {
  try {
    const docId = buildArrivalsDocId(hostelId, date);
    const bookingRef = doc(db, 'arrivals', docId, 'bookings', String(bookId));

    await setDoc(bookingRef, {
      [field]: value
    }, { merge: true });

    console.log(`Updated booking ${bookId} field "${field}"`);
  } catch (error) {
    console.error(`Error updating booking field "${field}":`, error);
    throw error;
  }
};
