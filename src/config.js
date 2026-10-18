// ───────────────────────────────────────────────────────────────
//  EDIT EVERYTHING ABOUT THE INVITATION HERE.
//  Names, dates, venues, photos, RSVP number — all in one place.
//  Dates use ISO format with the timezone offset (+05:30 = India).
// ───────────────────────────────────────────────────────────────

export const invite = {
  bride: {
    first: 'Zara',
    full: 'Zara Fatima',
    relation: 'Daughter of',
    parents: 'Mr. Imran Sheikh & Mrs. Nusrat Sheikh',
  },
  groom: {
    first: 'Haseeb',
    full: 'Abdul Haseeb',
    relation: 'Son of',
    parents: 'Mr. Farhan Qureshi & Mrs. Sana Qureshi',
  },

  // Shown on the closing card and used for sharing
  hashtag: '#ZaraWedsAyaan',

  // Timezone used to display every date/time below
  timeZone: 'Asia/Karachi',

  // The main ceremony — drives the countdown & scratch card
  ceremony: {
    title: 'Nikah Ceremony',
    start: '2026-12-03T19:00:00+05:00',
    durationHours: 3,
    venue: 'Hyatt Regency',
    address: 'Heaven Palace, Rawalpindi',
    // Text Google Maps should search for (also used for the embedded map)
    mapQuery: 'Rawalpindi',
  },

  welcome:
    'With hearts full of gratitude, we warmly invite you to join us as we celebrate this beautiful beginning with the love, prayers, and blessings of our families.',

  // Order of the day for the ceremony
  program: [
    { time: '06:30 PM', title: 'Guest Arrival', note: 'Welcome drinks & attar', icon: 'door' },
    { time: '07:00 PM', title: 'Nikah Ceremony', note: 'Solemnisation & duas', icon: 'rings' },
    { time: '07:30 PM', title: 'Blessings', note: 'Family greetings & photographs', icon: 'moon' },
    { time: '08:00 PM', title: 'Dinner', note: 'A feast shared with love', icon: 'dinner' },
  ],

  // Our story — put photos in /public/photos and set `src` (e.g. '/photos/1.jpg').
  // Leave `src` empty to show an ornamental placeholder.
  story: [
    { src: '', caption: 'Where it all began', date: '2021' },
    { src: '', caption: 'The yes that changed everything', date: '2025' },
    { src: '', caption: 'Families became one', date: '2026' },
    { src: '', caption: 'Forever, in sha Allah', date: 'Dec 2026' },
  ],

  dressCode: {
    title: 'Festive Formal',
    text: 'Traditional or formal attire is encouraged — sarees, lehengas, anarkalis, sherwanis, kurtas, suits and formal dresses are all welcome. We kindly ask guests to avoid overly casual attire, and white or ivory.',
    palette: [
      { name: 'Oxblood', hex: '#4a0d14' },
      { name: 'Velvet Red', hex: '#7a1220' },
      { name: 'Rose', hex: '#b0283a' },
      { name: 'Antique Gold', hex: '#c99a4b' },
      { name: 'Champagne', hex: '#ecd9b8' },
    ],
  },

  // Other functions around the wedding
  events: [
    {
      title: 'Mehendi',
      start: '2026-12-17T16:00:00+05:30',
      durationHours: 4,
      venue: "Bride's Residence",
      mapQuery: 'Rawalpindi',
      note: 'Colours, songs & henna',
      icon: 'henna',
    },
    {
      title: 'Qawwali Evening',
      start: '2026-12-19T19:00:00+05:30',
      durationHours: 3,
      venue: "Groom's Residence",
      mapQuery: 'Rawalpindi',
      note: 'An evening of soulful music',
      icon: 'music',
    },
    {
      title: 'Walima',
      start: '2026-12-21T19:30:00+05:30',
      durationHours: 3,
      venue: 'Rawalpindi',
      mapQuery: 'Rawalpindi',
      note: 'Reception dinner',
      icon: 'dinner',
    },
  ],

  rsvp: {
    // WhatsApp number with country code, digits only. Leave '' to hide the RSVP section.
    whatsapp: '923335659368',
    deadline: 'Kindly respond by December 1, 2026',
  },

  closing: {
    title: 'Your presence is our present',
    text: 'Your love, blessings and presence are the greatest gifts we could ever ask for. We can’t wait to celebrate with you.',
  },

  // Background music — drop an mp3 at /public/music.mp3 (the button hides if missing)
  music: '/music.mp3',
}
