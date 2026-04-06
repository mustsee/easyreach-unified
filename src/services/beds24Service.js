/**
 * Beds24 Service using Firebase Cloud Functions Proxy (HTTPS)
 * Uses standard fetch with explicit CORS handling on the backend.
 */

// Construct the URL dynamically based on the project ID
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const region = 'us-central1';
const GET_ROOMS_URL = `https://${region}-${projectId}.cloudfunctions.net/getBeds24Rooms`;
const GET_BOOKINGS_URL = `https://${region}-${projectId}.cloudfunctions.net/getBeds24Bookings`;
const UPDATE_BOOKING_URL = `https://${region}-${projectId}.cloudfunctions.net/updateBeds24Booking`;

/**
 * Fetches all rooms for a property via a Firebase Cloud Function (HTTPS).
 * @param {string} apiKey - Beds24 Account API Key
 * @param {string} propKey - Beds24 Property Key
 * @param {string} propId - Beds24 Property ID (e.g., 131407)
 * @returns {Promise<Array>} - List of room objects
 */
export const fetchRooms = async (apiKey, propKey, propId) => {
  if (!apiKey || !propKey) {
    throw new Error('API Key and PropKey are required');
  }

  try {
    const response = await fetch(GET_ROOMS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        propKey,
        propId
      })
    });

    const data = await response.json();

    console.log('Beds24 Rooms Data:', data);

    if (!response.ok) {
      console.error('Beds24 Proxy Detailed Error:', data);
      throw new Error(data.error || `Beds24 API Proxy error: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching rooms from Beds24 via HTTPS Cloud Function:', error);
    throw error;
  }
};

/**
 * Fetches bookings for a specific period via a Firebase Cloud Function.
 * @param {string} apiKey - Beds24 Account API Key
 * @param {string} propKey - Beds24 Property Key
 * @param {string} arrivalFrom - Date string YYYYMMDD
 * @param {string} arrivalTo - Date string YYYYMMDD
 * @returns {Promise<Array>} - List of booking objects
 */
export const fetchBookings = async (apiKey, propKey, arrivalFrom, arrivalTo) => {
  if (!apiKey || !propKey) {
    throw new Error('API Key and PropKey are required');
  }

  try {
    const response = await fetch(GET_BOOKINGS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        propKey,
        arrivalFrom,
        arrivalTo
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Beds24 Bookings Proxy Detailed Error:', data);
      throw new Error(data.error || `Beds24 API Proxy error: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching bookings from Beds24 via HTTPS Cloud Function:', error);
    throw error;
  }
};

/**
 * Updates a booking in Beds24 via a Firebase Cloud Function proxy.
 * @param {string} apiKey - Beds24 Account API Key
 * @param {string} propKey - Beds24 Property Key
 * @param {string|number} bookId - The booking ID to update
 * @param {Object} updateFields - Fields to update (e.g., { guestArrivalTime: "..." })
 * @returns {Promise<Object>} - Beds24 response
 */
export const updateBooking = async (apiKey, propKey, bookId, updateFields) => {
  if (!apiKey || !propKey || !bookId) {
    throw new Error('API Key, PropKey, and bookId are required');
  }

  try {
    const response = await fetch(UPDATE_BOOKING_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        propKey,
        bookId: String(bookId),
        updateFields
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Beds24 updateBooking Proxy Error:', data);
      throw new Error(data.error || `Beds24 API Proxy error: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Error updating booking in Beds24:', error);
    throw error;
  }
};
