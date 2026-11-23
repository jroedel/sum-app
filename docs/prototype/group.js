// One life group, and Request to join (doc 14, flow 2).
//
// A newcomer with no request asks, and lands on Home with Pending. One with a
// request out to another group is asked to withdraw it first (doc 04: one at
// a time). The mentors and the secretary see the group without the button.
import { apply, member, request, role, setRequest, withdraw } from "./app.js";
import { contact, group, mentors } from "./data.js";
import { askToJoin, withRole } from "./model.js";

const g = group(new URLSearchParams(window.location.search).get("g"));
const root = document.getElementById("group");

if (!g) {
  document.getElementById("no-group").hidden = false;
} else {
  root.hidden = false;
  document.title = `${g.name} · SUM mock-up`;
  root.querySelector('[data-slot="kind"]').textContent = g.open ? "Open life group" : "Life group";
  root.querySelector('[data-slot="name"]').textContent = g.name;
  root.querySelector('[data-slot="meets"]').textContent = `${g.meets} · ${g.place}`;
  root.querySelector('[data-slot="mentors"]').textContent = g.mentors.join(" and ");

  // Contact details are for members, and for a mentor in the groups he
  // mentors (doc 04). A newcomer sees first names, years and majors.
  const contacts = member || (role === "mentor" && mentors(g));

  const rows = root.querySelector('[data-slot="members"]');
  const tpl = document.getElementById("member-row");
  for (const m of g.members) {
    const row = tpl.content.firstElementChild.cloneNode(true);
    row.querySelector('[data-slot="initial"]').textContent = m.name[0];
    row.querySelector('[data-slot="name"]').textContent = m.name;
    row.querySelector('[data-slot="meta"]').textContent = `Class of ${m.year} · ${m.major}`;
    if (contacts) {
      const c = contact(m.name);
      const line = document.createElement("p");
      line.className = "muted contact";
      const mail = document.createElement("a");
      mail.href = `mailto:${c.email}`;
      mail.textContent = c.email;
      const tel = document.createElement("a");
      tel.href = `tel:${c.phone.replace(/[^\d+]/g, "")}`;
      tel.textContent = c.phone;
      line.append(mail, " · ", tel);
      row.querySelector(".grow").append(line);
    }
    rows.append(row);
  }

  // Only an open group takes requests, and only a newcomer makes them
  // (data-for on #ask).
  const ask = document.getElementById("ask");
  if (!g.open) ask.remove();

  if (g.open) {
    const show = (id) => {
      for (const panel of ["request", "requested", "withdraw-first", "in-group"]) {
        document.getElementById(panel).hidden = panel !== id;
      }
    };

    if (request?.status === "approved") {
      show("in-group");
    } else if (request?.group === g.id) {
      show("requested");
    } else {
      show("request");
    }

    document.getElementById("request").addEventListener("click", () => {
      const answer = askToJoin(request, g.id);
      if (answer.ok) {
        setRequest(answer.request);
      } else if (answer.reason === "withdraw-first") {
        show("withdraw-first");
      }
    });

    document.getElementById("keep").addEventListener("click", () => show("request"));

    // Withdrawing the request to this group goes Home, as Withdraw does
    // there. Withdrawing one to another group stays here, as the newcomer
    // with no request, so the next tap asks this group.
    for (const b of root.querySelectorAll("[data-withdraw]")) {
      b.addEventListener("click", () => {
        if (request?.group === g.id) {
          withdraw();
        } else {
          withdraw(withRole(`group.html?g=${g.id}`, "newcomer"));
        }
      });
    }
  }

  apply(root);
}
