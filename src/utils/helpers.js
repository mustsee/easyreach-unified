/**
 * Helper functions for Arrivals page
 */

export const messageTypes = {
  defaultWelcomeMessage: "defaultWelcomeMessage",
  withArrivalTime: "withArrivalTime",
  earlyCheckin: "earlyCheckin",
  lateCheckin: "lateCheckin",
  emailMessage: "emailMessage"
};

/**
 * Parses the check-in time from guest comments, specifically for Booking.com.
 * 
 * @param {string} guestComments - Comments from the guest
 * @param {string} referer - Booking source (e.g., "Booking.com")
 * @returns {string|null} - Parsed check-in time or null
 */
export const getCheckinTime = (guestComments, referer) => {
  if (!guestComments) return null;

  if (referer === "Booking.com") {
    if (guestComments.includes("Approximate time of arrival")) {
      // 'Approximate time of arrival: between 21:00 and 22:00'
      const time = guestComments.split("between");
      if (time[1]) {
        return "between" + time[1].slice(0, 16);
      }
      return null;
    }
  }
  return null;
};

/**
 * Determines the message type based on guest information and arrival time.
 * 
 * @param {string} guestComments - Comments from the guest
 * @param {string} referer - Booking source
 * @param {string} guestPhone - Guest phone number
 * @param {string} guestEmail - Guest email address
 * @returns {string} - The message type key
 */
export const getMessageType = (guestComments, referer, guestPhone, guestEmail) => {
  const hasPhone = !!(guestPhone && guestPhone != "0");

  if (!hasPhone) {
    return guestEmail ? messageTypes.emailMessage : messageTypes.defaultWelcomeMessage;
  }

  const hasArrivalTime = getCheckinTime(guestComments, referer);
  if (!hasArrivalTime) return messageTypes.defaultWelcomeMessage;

  // 'Approximate time of arrival: between 21:00 and 22:00'
  // -> 21
  try {
    const from = parseInt(hasArrivalTime.split(" and ")[0].slice(-5, -3));

    if (!isNaN(from) && from >= 8 && from < 15) {
      return messageTypes.earlyCheckin;
    } else if (!isNaN(from) && from >= 15 && from < 23) {
      return messageTypes.withArrivalTime;
    } else if (!isNaN(from) && (from === 23 || (from >= 0 && from < 8))) {
      return messageTypes.lateCheckin;
    } else {
      return messageTypes.defaultWelcomeMessage;
    }
  } catch (error) {
    console.error('Error parsing arrival time for message type:', error);
    return messageTypes.defaultWelcomeMessage;
  }
};

/**
 * Returns the name of the day of the week.
 * 
 * @param {number} day - Day index (0-6)
 * @returns {string} - Day name in English
 */
export const nameDayOfWeek = (day) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[day];
};

/**
 * Gets the day of the week for a given date string.
 * 
 * @param {string} dateInString - Date string (YYYY-MM-DD)
 * @returns {string} - Day name
 */
export const getDayOfWeek = (dateInString) => {
  if (!dateInString) return "";
  
  let dateStr = String(dateInString);
  
  // Handle YYYYMMDD format (no hyphens)
  if (dateStr.length === 8 && !dateStr.includes('-')) {
    const y = dateStr.slice(0, 4);
    const m = dateStr.slice(4, 6);
    const d = dateStr.slice(6, 8);
    dateStr = `${y}-${m}-${d}`;
  }
  
  const date = new Date(dateStr);
  
  // Check for invalid date
  if (isNaN(date.getTime())) return "";
  
  const dayOfWeek = date.getDay();
  return nameDayOfWeek(dayOfWeek);
};
