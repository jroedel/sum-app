// The shell every mock-up page loads: it decides who is looking, shows and
// hides what is marked for them, carries the role on every link, and wires
// the role switcher in the banner. The rules are in model.js; this file only
// applies them to the page.
//
// A screen with more to do (a button that changes something) has a script of
// its own, which imports `role` and `saved` from here. Module scripts run in
// the order the page lists them, so this one has run by then.
import { group } from "./data.js";
import { firstDues, memberNow, memory, requestFor, roleFrom, shownFor, withRole } from "./model.js";

export const saved = memory(window);
export const role = roleFrom(window.location.search, saved.get("role"));
saved.set("role", role);

// request is Lucas's request to join, as this role has it (model.js,
// requestFor). Withdrawn, or forgotten by choosing "Newcomer, no request", it
// is remembered as null, so the example does not come back on its own.
export const request = requestFor(role, saved.get("request"));
saved.set("request", request ?? null);

// firstPaid is whether Lucas has paid his first dues, and member whether the
// person looked at is a member now: Lucas becomes one by paying (doc 03), so
// the Apartment tab and the roster's contacts open to him then.
export const firstPaid = saved.get("first-dues") === true && request?.status === "approved";
export const member = memberNow(role, request, firstPaid);
export const firstDuesState = firstDues(request, firstPaid);

// setRequest and withdraw change it, and go where the flow goes next: Home,
// as the newcomer with or without a request, unless the page says otherwise.
export function setRequest(next) {
  saved.set("request", next);
  window.location.assign(withRole("./", "pending"));
}

export function withdraw(then = withRole("./", "newcomer")) {
  saved.set("request", null);
  window.location.assign(then);
}

// apply shows or hides everything marked data-for, and marks the document
// with the role and whether it is a member's, which the stylesheet does not
// need today but a screen's script may.
export function apply(root = document) {
  document.documentElement.dataset.role = role;
  document.documentElement.dataset.member = String(member);

  // data-for is who sees an element; data-request, which state of the
  // newcomer's request it belongs to (pending or approved). Both must hold.
  // data-first-dues, which state of his first dues (doc 06).
  for (const el of root.querySelectorAll("[data-for], [data-request], [data-first-dues]")) {
    const forRole = !("for" in el.dataset) || shownFor(el.dataset.for, role);
    const forRequest = !("request" in el.dataset) || el.dataset.request === request?.status;
    const forDues = !("firstDues" in el.dataset) || el.dataset.firstDues === firstDuesState;
    el.hidden = !(forRole && forRequest && forDues);
  }

  // The request's group, wherever a page names it.
  const asked = request && group(request.group);
  if (asked) {
    for (const el of root.querySelectorAll("[data-fill]")) {
      const value = { "group-name": asked.name, "group-meets": `${asked.meets} · ${asked.place}`, sent: request.sent }[el.dataset.fill];
      if (value !== undefined) el.textContent = value;
    }
    for (const a of root.querySelectorAll("a[data-group-link]")) {
      a.setAttribute("href", `group.html?g=${asked.id}`);
    }
  }

  // The Apartment tab is a member's (doc 10, "The app's layout").
  for (const el of root.querySelectorAll("[data-members]")) {
    el.hidden = !member;
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

// notHere answers a tap on something the mock-up does not draw (marked
// data-not-here) with a short note, rather than a dead button or a 404.
let toast;
export function notHere(message = "Not in this mock-up yet") {
  toast?.remove();
  toast = document.createElement("p");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  document.body.append(toast);
  const shown = toast;
  setTimeout(() => shown.remove(), 2500);
}

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-not-here]");
  if (el) {
    e.preventDefault();
    notHere(el.dataset.notHere || undefined);
  }
});

apply();
