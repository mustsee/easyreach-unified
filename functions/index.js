const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const nodemailer = require('nodemailer');
const path = require('path');
const cors = require('cors')({ origin: true });

admin.initializeApp();

/**
 * Cloud Function to proxy Beds24 API v1 requests (HTTPS version).
 * Uses extreme CORS handling and diagnostic logging.
 */
exports.getBeds24Rooms = functions.https.onRequest((req, res) => {
  console.log('Function triggered:', req.method, req.headers.origin);

  // Manually set CORS headers for maximum compatibility
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS preflight immediately
  if (req.method === 'OPTIONS') {
    console.log('Preflight OPTIONS handled.');
    return res.status(204).send('');
  }

  return cors(req, res, async () => {
    // Only allow POST for the actual logic
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { apiKey, propKey, propId } = req.body;
    console.log('Parameters received for PropKey:', propKey ? 'YES' : 'NO');

    if (!apiKey || !propKey) {
      return res.status(400).json({ error: 'API Key and PropKey are required' });
    }

    try {
      const response = await axios.post('https://api.beds24.com/json/getProperties', {
        authentication: {
          apiKey,
          propKey
        }
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.error) {
        console.error('Beds24 Error:', response.data.error);
        return res.status(400).json({ error: `Beds24 API Error: ${response.data.error}` });
      }

      // Based on user feedback, data is an object with a getProperties key
      // and getProperties is an array of property objects.
      let propList = [];
      const data = response.data;

      if (data && data.getProperties) {
        propList = data.getProperties;
      } else if (Array.isArray(data)) {
        propList = data;
      } else if (data && typeof data === 'object') {
        propList = [data]; // Fallback
      }

      // Find the specific property matching the propId (e.g., 131407)
      const property = propList.find(p => String(p.propId) === String(propId)) || propList[0] || {};
      const rooms = property.roomTypes || property.rooms || [];

      console.log('Property Filtered:', property.propId);
      console.log('Rooms (raw count):', rooms.length);

      return res.status(200).json(rooms);
    } catch (error) {
      console.error('Proxy Error:', error.message);

      const errorMessage = error.response?.data?.error || error.message;
      const statusCode = error.response?.status || 500;

      return res.status(statusCode).json({
        error: `Beds24 Proxy Error: ${errorMessage}`,
        details: error.response?.data || null
      });
    }
  });
});

/**
 * Cloud Function to proxy Beds24 API v1 getBookings.
 */
exports.getBeds24Bookings = functions.https.onRequest((req, res) => {
  console.log('getBookings triggered:', req.method);

  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  return cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { apiKey, propKey, arrivalFrom, arrivalTo, roomId } = req.body;

    if (!apiKey || !propKey) {
      return res.status(400).json({ error: 'API Key and PropKey are required' });
    }

    try {
      const response = await axios.post('https://api.beds24.com/json/getBookings', {
        authentication: {
          apiKey,
          propKey
        },
        arrivalFrom,
        arrivalTo,
        roomId,
        includeNotes: true,
        includeBookingNotes: true,
        includeInfoItems: true
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.error) {
        console.error('Beds24 Error:', response.data.error);
        return res.status(400).json({ error: `Beds24 API Error: ${response.data.error}` });
      }

      return res.status(200).json(response.data);
    } catch (error) {
      console.error('Proxy Error:', error.message);
      const errorMessage = error.response?.data?.error || error.message;
      const statusCode = error.response?.status || 500;

      return res.status(statusCode).json({
        error: `Beds24 Proxy Error: ${errorMessage}`,
        details: error.response?.data || null
      });
    }
  });
});

/**
 * Cloud Function to proxy Beds24 API v1 setBooking.
 * Used to update booking fields (e.g., guestArrivalTime).
 */
exports.updateBeds24Booking = functions.https.onRequest((req, res) => {
  console.log('updateBooking triggered:', req.method);

  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  return cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { apiKey, propKey, bookId, updateFields } = req.body;

    if (!apiKey || !propKey || !bookId) {
      return res.status(400).json({ error: 'API Key, PropKey, and bookId are required' });
    }

    try {
      const response = await axios.post('https://api.beds24.com/json/setBooking', {
        authentication: {
          apiKey,
          propKey
        },
        bookId: String(bookId),
        ...updateFields
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.error) {
        console.error('Beds24 setBooking Error:', response.data.error);
        return res.status(400).json({ error: `Beds24 API Error: ${response.data.error}` });
      }

      console.log('Beds24 setBooking response:', response.data);
      return res.status(200).json(response.data);
    } catch (error) {
      console.error('Proxy Error:', error.message);
      const errorMessage = error.response?.data?.error || error.message;
      const statusCode = error.response?.status || 500;

      return res.status(statusCode).json({
        error: `Beds24 Proxy Error: ${errorMessage}`,
        details: error.response?.data || null
      });
    }
  });
});

/**
 * Cloud Function to send emails via NodeMailer (Gmail).
 */
exports.sendEmail = functions.https.onRequest((req, res) => {
  console.log('sendEmail triggered:', req.method);

  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  return cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { hostelId, hostelName, to, text, phone, website } = req.body;

    if (!hostelId || !to || !text) {
      return res.status(400).json({ error: 'Missing required fields: hostelId, to, text' });
    }

    let user, pass;
    if (hostelId === 'princesstreethostel') {
      user = process.env.PRINCESSTREET_EMAIL;
      pass = process.env.PRINCESSTREET_PASSWORD;
    } else if (hostelId === 'haystackhostel') {
      user = process.env.HAYSTACK_EMAIL;
      pass = process.env.HAYSTACK_PASSWORD;
    }

    if (!user || !pass) {
      console.error(`Email credentials not configured for hostel: ${hostelId}`);
      return res.status(500).json({ error: 'Email credentials not configured on server.' });
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: user,
          pass: pass
        }
      });

      const logoFileName = hostelId === 'princesstreethostel' ? 'psh_logo.png' : 'hh_logo.png';
      const logoPath = path.join(__dirname, logoFileName);
      
      const subject = hostelName ? `Your upcoming stay at ${hostelName}` : 'Your upcoming stay';
      const htmlText = text.replace(/\n/g, '<br>');

      const mailOptions = {
        from: `"${hostelName}" <${user}>`,
        to: to,
        subject: subject,
        text: text,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <p>${htmlText}</p>
            <br>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px;">
              <tr>
                <td width="120" valign="top">
                  <img src="cid:hostellogo" alt="${hostelName} Logo" width="100" style="display: block; max-width: 100px;">
                </td>
                <td valign="top" style="font-family: Arial, sans-serif; font-size: 14px; color: #666; line-height: 1.5;">
                  <strong style="color: #333; font-size: 16px;">${hostelName}</strong><br>
                  5 West Register Street<br>
                  ${phone || ''}<br>
                  <a href="https://${website}" style="color: #0056b3; text-decoration: none;">${website}</a>
                </td>
              </tr>
            </table>
          </div>
        `,
        attachments: [{
          filename: logoFileName,
          path: logoPath,
          cid: 'hostellogo'
        }]
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);

      return res.status(200).json({ success: true, messageId: info.messageId });
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ error: `Error sending email: ${error.message}` });
    }
  });
});
