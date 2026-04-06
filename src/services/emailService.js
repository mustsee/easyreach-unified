/**
 * Email Service using Firebase Cloud Functions Proxy (HTTPS)
 */
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const region = 'us-central1';
const SEND_EMAIL_URL = `https://${region}-${projectId}.cloudfunctions.net/sendEmail`;

/**
 * Sends an email to a guest via Cloud Functions.
 * @param {string} hostelId - The ID of the current hostel (for selecting credentials)
 * @param {string} hostelName - The Name of the current hostel (for the subject / from name)
 * @param {string} to - The recipient email address
 * @param {string} text - The content of the email
 * @param {string} phone - The hostel phone number
 * @param {string} website - The hostel website
 * @returns {Promise<Object>}
 */
export const sendGuestEmail = async (hostelId, hostelName, to, text, phone, website) => {
  if (!hostelId || !to || !text) {
    throw new Error('hostelId, to, and text are required to send an email');
  }

  try {
    const response = await fetch(SEND_EMAIL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hostelId,
        hostelName,
        to,
        text,
        phone,
        website
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('sendEmail Proxy Error:', data);
      throw new Error(data.error || `sendEmail API Proxy error: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
