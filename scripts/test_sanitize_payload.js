// Test script for sanitizePayload (copied logic from Availabilities.jsx)

function sanitizePayload(data) {
  const payload = { ...data };

  // Normalize types
  payload.is_recurring = Boolean(payload.is_recurring);

  // Convert empty date string to null (but prefer deleting for recurring)
  if (payload.date === "") payload.date = null;

  // Ensure times include seconds (HH:MM -> HH:MM:00)
  const ensureSeconds = (t) => {
    if (t === null || t === undefined) return t;
    if (typeof t !== "string") return t;
    if (/^\d{2}:\d{2}$/.test(t)) return `${t}:00`;
    return t;
  };

  if (payload.start_time)
    payload.start_time = ensureSeconds(payload.start_time);
  if (payload.end_time) payload.end_time = ensureSeconds(payload.end_time);

  if (payload.is_recurring) {
    // recurring: day_of_week required, date must not be sent
    if (payload.day_of_week !== undefined && payload.day_of_week !== null) {
      payload.day_of_week = Number(payload.day_of_week);
    } else {
      // ensure it's absent instead of empty
      delete payload.day_of_week;
    }
    // remove date entirely for recurring payloads
    if (Object.prototype.hasOwnProperty.call(payload, "date")) {
      delete payload.date;
    }
  } else {
    // one-off: date required, remove day_of_week
    if (
      payload.date === null ||
      payload.date === undefined ||
      payload.date === ""
    ) {
      // keep null so backend validation can return 422 if missing
      payload.date = payload.date === "" ? null : payload.date;
    }
    if (Object.prototype.hasOwnProperty.call(payload, "day_of_week")) {
      delete payload.day_of_week;
    }
  }

  return payload;
}

const tests = [
  {
    name: "Recurring with empty date string and HH:MM times",
    input: {
      is_recurring: true,
      day_of_week: "5",
      date: "",
      start_time: "09:00",
      end_time: "17:00",
    },
  },
  {
    name: "One-off with date string and HH:MM:SS end_time",
    input: {
      is_recurring: false,
      day_of_week: 2,
      date: "2025-12-01",
      start_time: "08:30",
      end_time: "12:30:00",
    },
  },
  {
    name: "One-off with empty date string (should become null)",
    input: {
      is_recurring: false,
      date: "",
      start_time: "10:00",
      end_time: "11:00",
    },
  },
  {
    name: "Recurring without day_of_week (should remove day_of_week and date)",
    input: {
      is_recurring: true,
      date: "",
      start_time: "14:00",
      end_time: "15:00",
    },
  },
  {
    name: "Times already HH:MM:SS remain unchanged",
    input: {
      is_recurring: true,
      day_of_week: 3,
      start_time: "09:00:30",
      end_time: "17:00:45",
    },
  },
];

for (const t of tests) {
  console.log("---");
  console.log("Test:", t.name);
  console.log("Input:", JSON.stringify(t.input));
  console.log("Sanitized:", JSON.stringify(sanitizePayload(t.input)));
}

console.log("--- Test complete");
