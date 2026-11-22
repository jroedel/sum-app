// The mock-ups' invented people and groups. None of them is real, and none
// may be: the repository is public (CLAUDE.md, "This repository is public").
// Names are first names only, as an open group shows them (doc 14, flow 2).

// GROUPS are the life groups. The first three are open, forming this
// semester, with deliberately different mixes of graduation years: doc 04
// shows composition because a group of mixed years comes apart, but leaves
// the choice to the newcomer. Tabor is closed; it is Mateo's.
export const GROUPS = [
  {
    id: "emmaus",
    name: "Emmaus",
    open: true,
    meets: "Tue · 7:00–9:00 PM",
    place: "The apartment",
    mentors: ["Andrew (alum)", "Fr. Thomas"],
    members: [
      { name: "Owen", year: 2029, major: "Mechanical engineering" },
      { name: "Luke", year: 2029, major: "Chemistry" },
      { name: "Gabriel", year: 2029, major: "History" },
      { name: "Henry", year: 2028, major: "Government" },
    ],
  },
  {
    id: "cana",
    name: "Cana",
    open: true,
    meets: "Wed · 8:00–10:00 PM",
    place: "The apartment",
    mentors: ["James"],
    members: [
      { name: "Isaac", year: 2027, major: "Finance" },
      { name: "Simon", year: 2027, major: "Nursing" },
      { name: "Jude", year: 2027, major: "Architecture" },
      { name: "Peter", year: 2028, major: "Computer science" },
      { name: "Miles", year: 2027, major: "Biology" },
    ],
  },
  {
    id: "nazareth",
    name: "Nazareth",
    open: true,
    meets: "Sun · 4:30–6:30 PM",
    place: "The apartment",
    mentors: ["Fr. Thomas"],
    members: [
      { name: "Elias", year: 2030, major: "Undeclared" },
      { name: "Leo", year: 2029, major: "Music" },
      { name: "Marco", year: 2030, major: "Physics" },
    ],
  },
  {
    id: "tabor",
    name: "Tabor",
    open: false,
    meets: "Thu · 8:00–10:00 PM",
    place: "The apartment",
    mentors: ["Andrew (alum)", "Fr. Thomas"],
    members: [
      { name: "Mateo", year: 2027, major: "Electrical engineering" },
      { name: "Daniel", year: 2027, major: "Accounting" },
      { name: "Adrian", year: 2027, major: "Spanish" },
      { name: "Paul", year: 2026, major: "Philosophy" },
    ],
  },
];

export const group = (id) => GROUPS.find((g) => g.id === id);

// MENTOR is the mock-up's mentor, Andrew, and the groups he mentors: a
// request to any other group is not his to see (the secretary sees them all).
export const MENTOR = "Andrew (alum)";
export const mentors = (g) => g.mentors.includes(MENTOR);

// The newcomer the mock-up follows through flow 2, and the requests the
// other people in it are waiting on. Lucas's request is whatever he has done
// in this browser; the other two are fixed.
export const NEWCOMER = { name: "Lucas", year: 2029, major: "Mechanical engineering" };

export const OTHER_REQUESTS = [
  { id: "noah", name: "Noah", year: 2028, major: "Economics", group: "emmaus", sent: "today", for: ["mentor", "secretary"] },
  { id: "caleb", name: "Caleb", year: 2027, major: "Finance", group: "cana", sent: "3 days ago", unanswered: true, for: ["secretary"] },
];

// The apartment (doc 05): two rooms and the dining and living area, which is
// one space. What the two rooms are called is open; "Study room" and "Second
// room" are the mock-up's names for them.
export const SPACES = [
  { id: "dining", name: "Dining and living area" },
  { id: "study", name: "Study room" },
  { id: "second", name: "Second room" },
];

export const space = (id) => SPACES.find((s) => s.id === id);

// DAYS are the week the mock-up shows, starting on the Monday Home names.
export const DAYS = [
  { iso: "2026-11-23", label: "Monday, November 23", weekday: 1 },
  { iso: "2026-11-24", label: "Tuesday, November 24", weekday: 2 },
  { iso: "2026-11-25", label: "Wednesday, November 25", weekday: 3 },
  { iso: "2026-11-26", label: "Thursday, November 26", weekday: 4 },
  { iso: "2026-11-27", label: "Friday, November 27", weekday: 5 },
  { iso: "2026-11-28", label: "Saturday, November 28", weekday: 6 },
  { iso: "2026-11-29", label: "Sunday, November 29", weekday: 0 },
];

// MEETINGS are each life group's weekly meeting on the schedule, put there
// without anyone entering it (doc 05): the dining room for the first hour,
// then one of the two rooms for the second. Which room is open in doc 05;
// here each group has one.
export const MEETINGS = [
  { group: "emmaus", weekday: 2, start: "19:00", middle: "20:00", end: "21:00", room: "second" },
  { group: "cana", weekday: 3, start: "20:00", middle: "21:00", end: "22:00", room: "study" },
  { group: "tabor", weekday: 4, start: "20:00", middle: "21:00", end: "22:00", room: "second" },
  { group: "nazareth", weekday: 0, start: "16:30", middle: "17:30", end: "18:30", room: "second" },
];

// BOOKINGS are what members have put on the schedule themselves. Mateo's
// study booking on Wednesday is overlapped by Cana's second hour, so the
// member has a displacement waiting on Home (doc 05: a single member who is
// displaced is told himself).
export const BOOKINGS = [
  { id: "isaac-mon", who: "Isaac", kind: "study", space: "study", day: "2026-11-23", start: "15:00", end: "18:00" },
  { id: "mateo-tue", who: "Mateo", kind: "here", space: "dining", day: "2026-11-24", start: "17:00", end: "19:00" },
  { id: "mateo-wed", who: "Mateo", kind: "study", space: "study", day: "2026-11-25", start: "20:30", end: "22:00" },
  { id: "peter-fri", who: "Peter", kind: "here", space: "dining", day: "2026-11-27", start: "18:00", end: "21:00" },
  { id: "daniel-sat", who: "Daniel", kind: "study", space: "study", day: "2026-11-28", start: "10:00", end: "13:00" },
];

// ME is who "Remove me" and a new booking belong to, by role.
export const ME = { member: "Mateo", secretary: "Daniel" };
