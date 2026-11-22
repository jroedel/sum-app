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
