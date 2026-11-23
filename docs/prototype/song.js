// One song: its words, first, at a size that reads across a room, which he
// can make larger and which is remembered (doc 14, flow 4).
import { apply, saved } from "./app.js";
import { song } from "./songbook.js";

const s = song(new URLSearchParams(window.location.search).get("s"));
const root = document.getElementById("song");

if (!s) {
  document.getElementById("no-song").hidden = false;
} else {
  root.hidden = false;
  document.title = `${s.title} · SUM mock-up`;
  root.querySelector('[data-slot="title"]').textContent = s.title;
  root.querySelector('[data-slot="by"]').textContent = s.by;

  const verses = root.querySelector('[data-slot="verses"]');
  for (const v of s.verses) {
    const p = document.createElement("p");
    p.className = "verse";
    v.forEach((line, i) => {
      if (i > 0) p.append(document.createElement("br"));
      p.append(line);
    });
    verses.append(p);
  }

  const setSize = (px) => {
    verses.dataset.size = px;
    for (const b of root.querySelectorAll("[data-size]")) {
      b.setAttribute("aria-pressed", String(b.dataset.size === px));
    }
    saved.set("song-size", px);
  };
  for (const b of root.querySelectorAll("[data-size]")) {
    b.addEventListener("click", () => setSize(b.dataset.size));
  }
  setSize(saved.get("song-size") ?? "17");
  apply(root);
}
