// The open life groups, each with its members' graduation years (doc 04).
import { apply, request } from "./app.js";
import { GROUPS } from "./data.js";
import { years } from "./model.js";

const list = document.getElementById("open-groups");
const card = document.getElementById("group-card");

for (const g of GROUPS.filter((g) => g.open)) {
  const el = card.content.firstElementChild.cloneNode(true);
  el.href = `group.html?g=${g.id}`;
  el.querySelector('[data-slot="name"]').textContent = g.name;
  el.querySelector('[data-slot="meets"]').textContent = `${g.meets} · ${g.place} · ${g.members.length} members`;

  const chips = el.querySelector('[data-slot="years"]');
  chips.setAttribute("aria-label", `Members' graduation years: ${years(g.members).join(", ")}`);
  for (const y of years(g.members)) {
    const chip = document.createElement("span");
    chip.className = "sum-chip sum-chip--track sum-num";
    chip.textContent = String(y);
    chips.append(chip);
  }

  const mine = request?.group === g.id;
  el.querySelector('[data-slot="requested"]').hidden = !(mine && request.status === "pending");
  el.querySelector('[data-slot="joined"]').hidden = !(mine && request.status === "approved");
  list.append(el);
}

apply(list);
