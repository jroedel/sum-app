// The shell every mock-up page loads: it decides who is looking, shows and
// hides what is marked for them, carries the role on every link, and wires
// the role switcher in the banner. The rules are in model.js; this file only
// applies them to the page.
//
// A screen with more to do (a button that changes something) has a script of
// its own, which imports `role` and `saved` from here. Module scripts run in
// the order the page lists them, so this one has run by then.
import { isMember, memory, roleFrom, shownFor, withRole } from "./model.js";

export const saved = memory(window);
export const role = roleFrom(window.location.search, saved.get("role"));
saved.set("role", role);

// apply shows or hides everything marked data-for, and marks the document
// with the role and whether it is a member's, which the stylesheet does not
// need today but a screen's script may.
export function apply(root = document) {
  document.documentElement.dataset.role = role;
  document.documentElement.dataset.member = String(isMember(role));

  for (const el of root.querySelectorAll("[data-for]")) {
    el.hidden = !shownFor(el.dataset.for, role);
  }

  // The Apartment tab is a member's (doc 10, "The app's layout").
  for (const el of root.querySelectorAll("[data-members]")) {
    el.hidden = !isMember(role);
  }

  for (const a of root.querySelectorAll("a[href]")) {
    const href = a.getAttribute("href");
    const carried = withRole(href, role);
    if (carried !== href) {
      a.setAttribute("href", carried);
    }
  }
}

// The switcher reloads the same screen as the chosen role, keeping the rest
// of the address (a group's ?g=, for example).
const select = document.getElementById("as");
if (select) {
  select.value = role;
  select.addEventListener("change", () => {
    const url = new URL(window.location.href);
    url.searchParams.set("as", select.value);
    window.location.assign(url);
  });
}

apply();
