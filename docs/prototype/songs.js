// Songs (doc 07; doc 14, flow 4): the list A to Z, and a search over titles
// and words that narrows it as he types. A song found by its words shows the
// line it was found in.
import { apply } from "./app.js";
import { findSongs } from "./model.js";
import { SONGS } from "./songbook.js";

const list = document.getElementById("songs");
const tpl = document.getElementById("song-row");
const q = document.getElementById("q");

function render() {
  const hits = findSongs(SONGS, q.value);
  list.replaceChildren();
  for (const h of hits) {
    const row = tpl.content.firstElementChild.cloneNode(true);
    row.href = `song.html?s=${h.song.id}`;
    row.id = `song-${h.song.id}`;
    row.querySelector('[data-slot="title"]').textContent = h.song.title;
    row.querySelector('[data-slot="meta"]').textContent = h.in === "words" ? `“${h.line}”` : h.song.by;
    list.append(row);
  }
  list.hidden = hits.length === 0;
  document.getElementById("no-songs").hidden = hits.length > 0;
  apply(list);
}

q.addEventListener("input", render);
render();
