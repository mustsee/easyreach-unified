import { db } from '../firebase';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  deleteDoc,
  addDoc
} from 'firebase/firestore';

export const DEFAULT_MESSAGES = [
  {
    messageType: "defaultWelcomeMessage",
    name: "Default welcome message",
    variables: ["guestFirstName", "senderName", "dayOfWeek", "hostelName", "doorCode", "wifiPassword"],
    text: `Hi --guestFirstName--, this is --senderName-- from --hostelName--, I hope you are well and thanks again for booking with us. Could you please let us know what time you will be arriving on --dayOfWeek--?\nPlease bear in mind we are at the very top of our building and there are a quite a few steps to reach reception level. The door code is --doorCode--, the Wifi password: --wifiPassword--.\nSee you soon!`,
    channel: "whatsapp",
    isDefault: true
  },
  {
    messageType: "withArrivalTime",
    name: "With arrival time",
    variables: ["guestFirstName", "senderName", "dayOfWeek", "checkinTime", "hostelName", "doorCode", "wifiPassword"],
    text: `Hi --guestFirstName--, this is --senderName-- from --hostelName--, I hope you are well and thanks again for booking with us. We look forward to welcoming you on --dayOfWeek-- --checkinTime--.\nPlease bear in mind we are at the very top of our building and there are a quite a few steps to reach reception level. The door code is --doorCode--, the Wifi password: --wifiPassword--.\nSee you soon!`,
    channel: "whatsapp",
    isDefault: true
  },
  {
    messageType: "earlyCheckin",
    name: "Early Checkin",
    variables: ["guestFirstName", "senderName", "dayOfWeek", "checkinTime", "hostelName", "doorCode", "wifiPassword", "officialCheckInTime"],
    text: `Hi --guestFirstName--, this is --senderName-- from --hostelName--, I hope you are well and thanks again for booking with us. We look forward to welcoming you on --dayOfWeek-- --checkinTime--.\nOur official check-in time is at --officialCheckInTime--, however you are very welcome to leave your luggage here at reception, then you are free to explore Edinburgh!\nPlease bear in mind we are at the very top of our building and there are a quite a few steps to reach reception level. The door code is --doorCode--, the Wifi password: --wifiPassword--.\nSee you soon!`,
    channel: "whatsapp",
    isDefault: true
  },
  {
    messageType: "lateCheckin",
    name: "Late Checkin",
    variables: ["guestFirstName", "senderName", "roomNumber", "hostelName", "doorCode", "wifiPassword", "receptionOpeningTime"],
    text: `Hello --guestFirstName--, this is --senderName-- from --hostelName--.\nAs you are checking in at a time when the reception will be closed, I have put your key in an envelope with your name on it, next to the check out box which is located directly on your right as you walk through the front door.\nThe door code to enter the hostel is --doorCode-- and the WIFI password is --wifiPassword--. Your room number is --roomNumber--. Turn to your left as you walk in, go down the corridor and there you will find signs to your room.\nThere are bathrooms and showers on your floor as well as next to reception if yours are busy in the morning.\nAnd please switch off any lights you switch on.\nThere is no one at reception just now (although staff is on site in case of emergency) until tomorrow morning --receptionOpeningTime-- so just pop by to say hi!`,
    channel: "whatsapp",
    isDefault: true
  },
  {
    messageType: "emailMessage",
    name: "Email Message",
    variables: ["guestFirstName", "senderName", "dayOfWeek", "hostelName", "doorCode", "wifiPassword", "whatsappNumber"],
    text: `Hi --guestFirstName--, this is --senderName-- from --hostelName--, I hope you are well and thanks again for booking with us.\nCould you please let us know what time you will be arriving on --dayOfWeek-- and also if you have a WhatsApp number? Our WhatsApp number is --whatsappNumber--.\nPlease bear in mind we are at the very top of our building and there are a quite a few steps to reach reception level. The door code is --doorCode--, the Wifi password: --wifiPassword--.\nSee you soon!`,
    channel: "email",
    isDefault: true
  }
];

export const AVAILABLE_VARIABLES = [
  "guestFirstName",
  "senderName",
  "dayOfWeek",
  "checkinTime",
  "roomNumber",
  "hostelName",
  "doorCode",
  "wifiPassword",
  "officialCheckInTime",
  "receptionOpeningTime",
  "whatsappNumber"
];

/**
 * Loads messages for a specific hostel. If no messages found in Firestore, returns defaults.
 */
export const loadMessages = async (hostelId) => {
  try {
    const q = query(collection(db, 'messages'), where('hostelId', '==', hostelId));
    const querySnapshot = await getDocs(q);

    const firestoreMessages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Start with default messages
    const finalMessages = DEFAULT_MESSAGES.map(msg => {
      const customVersion = firestoreMessages.find(fm => fm.messageType === msg.messageType);
      return customVersion ? { ...customVersion, isDefault: false } : msg;
    });

    // Add any completely new messages that aren't in defaults
    firestoreMessages.forEach(fm => {
      if (!DEFAULT_MESSAGES.some(dm => dm.messageType === fm.messageType)) {
        finalMessages.push({ ...fm, isDefault: false });
      }
    });

    return finalMessages;
  } catch (error) {
    console.error('Error loading messages:', error);
    return DEFAULT_MESSAGES;
  }
};

/**
 * Saves a message to Firestore.
 */
export const saveMessage = async (hostelId, message) => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('hostelId', '==', hostelId),
      where('messageType', '==', message.messageType)
    );
    const querySnapshot = await getDocs(q);

    const dataToSave = {
      ...message,
      hostelId,
      updatedAt: new Date().toISOString()
    };

    // Remove 'id' and 'isDefault' from data if they exist
    delete dataToSave.id;
    delete dataToSave.isDefault;

    if (!querySnapshot.empty) {
      // Update existing
      const docId = querySnapshot.docs[0].id;
      const docRef = doc(db, 'messages', docId);
      await setDoc(docRef, dataToSave, { merge: true });
      return { id: docId, ...dataToSave, isDefault: false };
    } else {
      // Create new with random ID
      const docRef = await addDoc(collection(db, 'messages'), dataToSave);
      return { id: docRef.id, ...dataToSave, isDefault: false };
    }
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

/**
 * Deletes a custom message from Firestore.
 */
export const deleteMessage = async (messageId) => {
  try {
    await deleteDoc(doc(db, 'messages', messageId));
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

/**
 * Loads hostel settings (wifi, door code) for a specific hostel.
 */
export const loadHostelSettings = async (hostelId) => {
  try {
    const q = query(collection(db, 'hostelSettings'), where('hostelId', '==', hostelId));
    const querySnapshot = await getDocs(q);

    const defaultSettings = {
      doorCode: '3578',
      wifiPassword: '5westregister',
      officialCheckInTime: '3pm',
      receptionOpeningTime: '8.00am',
      whatsappNumber: '+44 7553 137828',
      senderName: 'Sophie',
      autoHandleHostelworld: true
    };

    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      return {
        ...defaultSettings,
        ...data,
        id: querySnapshot.docs[0].id
      };
    } else {
      return defaultSettings;
    }
  } catch (error) {
    console.error('Error loading hostel settings:', error);
    return {
      doorCode: '3578',
      wifiPassword: '5westregister',
      officialCheckInTime: '3pm',
      receptionOpeningTime: '8.00am',
      whatsappNumber: '+44 7553 137828',
      senderName: 'Sophie',
      autoHandleHostelworld: true
    };
  }
};

/**
 * Saves hostel settings to Firestore.
 */
export const saveHostelSettings = async (hostelId, settings) => {
  try {
    const q = query(collection(db, 'hostelSettings'), where('hostelId', '==', hostelId));
    const querySnapshot = await getDocs(q);

    const dataToSave = {
      ...settings,
      hostelId,
      updatedAt: new Date().toISOString()
    };

    // Remove temporary 'id' if it exists in settings object
    delete dataToSave.id;

    if (!querySnapshot.empty) {
      const docId = querySnapshot.docs[0].id;
      const docRef = doc(db, 'hostelSettings', docId);
      await setDoc(docRef, dataToSave, { merge: true });
      return { id: docId, ...dataToSave };
    } else {
      const docRef = await addDoc(collection(db, 'hostelSettings'), dataToSave);
      return { id: docRef.id, ...dataToSave };
    }
  } catch (error) {
    console.error('Error saving hostel settings:', error);
    throw error;
  }
};

/**
 * Loads room mappings for a specific hostel.
 */
export const loadRoomMappings = async (hostelId) => {
  try {
    const q = query(collection(db, 'roomMappings'), where('hostelId', '==', hostelId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error loading room mappings:', error);
    return [];
  }
};

/**
 * Saves or updates a room mapping in Firestore.
 */
export const saveRoomMapping = async (hostelId, mapping) => {
  try {
    const q = query(
      collection(db, 'roomMappings'),
      where('hostelId', '==', hostelId),
      where('roomId', '==', mapping.roomId)
    );
    const querySnapshot = await getDocs(q);

    const dataToSave = {
      ...mapping,
      hostelId,
      updatedAt: new Date().toISOString()
    };

    delete dataToSave.id;

    if (!querySnapshot.empty) {
      const docId = querySnapshot.docs[0].id;
      const docRef = doc(db, 'roomMappings', docId);
      await setDoc(docRef, dataToSave, { merge: true });
      return { id: docId, ...dataToSave };
    } else {
      const docRef = await addDoc(collection(db, 'roomMappings'), dataToSave);
      return { id: docRef.id, ...dataToSave };
    }
  } catch (error) {
    console.error('Error saving room mapping:', error);
    throw error;
  }
};

/**
 * Calculates the room number based on dynamic mappings.
 * Replaces the hardcoded logic with a per-hostel lookup.
 */
export const getRoomNumber = (roomId, unitId, mappings = []) => {
  if (!mappings || !Array.isArray(mappings)) return 'N/A';
  const roomType = mappings.find(m => m.roomId === String(roomId));

  if (!roomType) return 'N/A';

  let result = 'N/A';
  // Use the original calculation logic provided by the user
  if (!roomType.isPrivate && !roomType.isUnique) {
    // Dorm room logic
    const beds = Number(roomType.beds) || 1;
    const roomKey = Math.ceil(unitId / beds);
    result = roomType.unitMappings?.[roomKey] || 'N/A';
  } else if (roomType.isUnique) {
    // All units map to the same room number
    result = roomType.unitMappings?.['1'] || 'N/A';
  } else {
    // Private room logic (usually 1:1 unitId mapping)
    result = roomType.unitMappings?.[unitId] || 'N/A';
  }

  // Format: "37-1" -> "37"
  if (result && typeof result === 'string' && result.includes('-')) {
    return result.split('-')[0].trim();
  }

  return result;
};
