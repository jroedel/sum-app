// Requests to join, as a mentor or the secretary sees them (doc 04): approve,
// or leave it. There is no decline. A mentor sees his own groups' requests;
// the secretary sees every one, and which nobody answered in 3 days.
import { apply, request, role, saved } from "./app.js";
import { NEWCOMER, OTHER_REQUESTS, group, mentors } from "./data.js";

const list = document.getElementById("requests");
const tpl = document.getElementById("request-row");

const all = [
  ...(request ? [{ id: "lucas", ...NEWCOMER, group: request.group, sent: request.sent, approved: request.status === "approved" }] : []),
  ...OTHER_REQUESTS.filter((r) => r.for.includes(role)).map((r) => ({ ...r, approved: saved.get(`approved:${r.id}`) === true })),
].filter((r) => role === "secretary" || mentors(group(r.group)));

for (const r of all) {
  const el = tpl.content.firstElementChild.cloneNode(true);
  el.id = `request-${r.id}`;
  el.querySelector('[data-slot="initial"]').textContent = r.name[0];
  el.querySelector('[data-slot="title"]').textContent = `${r.name} wants to join ${group(r.group).name}`;
  el.querySelector('[data-slot="meta"]').textContent = `Class of ${r.year} · ${r.major} · ${r.sent}`;
  el.querySelector('[data-slot="late"]').hidden = !r.unanswered || r.approved;

  const approve = el.querySelector('[data-slot="approve"]');
  const done = el.querySelector('[data-slot="approved"]');
  const mark = () => {
    approve.hidden = true;
    done.hidden = false;
    el.querySelector('[data-slot="late"]').hidden = true;
  };
  if (r.approved) mark();

  approve.addEventListener("click", () => {
    if (r.id === "lucas") {
      saved.set("request", { ...request, status: "approved" });
    } else {
      saved.set(`approved:${r.id}`, true);
    }
    mark();
  });

  list.append(el);
}

document.getElementById("none").hidden = all.length > 0;
apply(list);
