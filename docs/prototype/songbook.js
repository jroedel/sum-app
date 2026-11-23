// The songs, as pages (doc 07). Only texts in the public domain are here:
// the repository is public, and most of what the branch sings is under
// copyright, so the branch's own songbook goes into the app's database, never
// into this repository.
//
// Each song is its title and its verses; a verse is its lines.
export const SONGS = [
  {
    id: "amazing-grace",
    title: "Amazing Grace",
    by: "John Newton, 1779",
    verses: [
      ["Amazing grace! how sweet the sound", "That saved a wretch like me!", "I once was lost, but now am found,", "Was blind, but now I see."],
      ["'Twas grace that taught my heart to fear,", "And grace my fears relieved;", "How precious did that grace appear", "The hour I first believed!"],
    ],
  },
  {
    id: "hail-holy-queen",
    title: "Hail, Holy Queen Enthroned Above",
    by: "Salve Regina Coelitum, 1884",
    verses: [
      ["Hail, holy Queen enthroned above,", "O Maria!", "Hail, Mother of mercy and of love,", "O Maria!", "Triumph, all ye cherubim,", "Sing with us, ye seraphim!", "Heav'n and earth resound the hymn:", "Salve, salve, salve, Regina!"],
    ],
  },
  {
    id: "holy-god",
    title: "Holy God, We Praise Thy Name",
    by: "Te Deum, tr. Clarence Walworth, 1858",
    verses: [
      ["Holy God, we praise thy name;", "Lord of all, we bow before thee!", "All on earth thy scepter claim,", "All in heaven above adore thee;", "Infinite thy vast domain,", "Everlasting is thy reign."],
    ],
  },
  {
    id: "salve-regina",
    title: "Salve Regina",
    by: "Chant, 11th century",
    verses: [
      ["Salve, Regina, mater misericordiae,", "vita, dulcedo, et spes nostra, salve.", "Ad te clamamus, exsules filii Hevae,", "ad te suspiramus, gementes et flentes", "in hac lacrimarum valle."],
      ["Eia, ergo, advocata nostra,", "illos tuos misericordes oculos ad nos converte;", "et Iesum, benedictum fructum ventris tui,", "nobis post hoc exsilium ostende.", "O clemens, O pia, O dulcis Virgo Maria."],
    ],
  },
];

export const song = (id) => SONGS.find((s) => s.id === id);
