// Signing in, and signing up, which are the same steps (doc 03; doc 14, flow
// 1): an email address, a 6-digit code, and the first time only, the profile.
// The rules, and the mock-up's stand-in for the server, are in model.js.
import { saved } from "./app.js";
import { MAX_SENDS, looksLikeEmail, sendCode, tryCode, withRole } from "./model.js";

const steps = ["step-email", "step-code", "step-profile"];
const show = (id) => {
  for (const s of steps) document.getElementById(s).hidden = s !== id;
  document.getElementById("mock-note").hidden = id === "step-profile";
  document.querySelector(`#${id} input`)?.focus();
};

const say = (id, text) => {
  const el = document.getElementById(id);
  el.textContent = text ?? "";
  el.hidden = !text;
};

// The sign-in in progress, kept for the length of the visit: a new code
// replaces the old one, and the count of codes asked for is per address.
let state = saved.get("sign-in");

function ask(email) {
  const r = sendCode(state, email);
  if (!r.ok) {
    return `You've asked for ${MAX_SENDS} codes. Wait a little, then try again.`;
  }
  state = r.state;
  saved.set("sign-in", state);
  document.getElementById("sent-to").textContent = state.email;
  return undefined;
}

document.getElementById("step-email").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  if (!looksLikeEmail(email)) {
    say("email-error", "Enter your email address, like name@example.com.");
    return;
  }
  const refused = ask(email);
  say("email-error", refused);
  if (!refused) {
    say("code-error");
    document.getElementById("step-code").code.value = "";
    show("step-code");
  }
});

document.getElementById("step-code").addEventListener("submit", (e) => {
  e.preventDefault();
  const r = tryCode(state, e.target.code.value);
  state = r.state;
  saved.set("sign-in", state);

  switch (r.result) {
    case "ok":
      saved.remove("sign-in");
      if (r.account) {
        // He has an account: Home, as who he is.
        window.location.assign(withRole("./", r.account));
      } else {
        say("code-error");
        show("step-profile");
      }
      return;
    case "malformed":
      say("code-error", "Enter the 6 digits from the email.");
      return;
    case "wrong":
      say("code-error", `That code isn't right. ${r.left === 1 ? "1 try" : `${r.left} tries`} left.`);
      return;
    case "used-up":
      say("code-error", "That code has stopped working after 5 tries. Send a new code.");
      return;
    case "expired":
      say("code-error", "That code is more than 10 minutes old. Send a new code.");
      return;
  }
});

document.getElementById("resend").addEventListener("click", () => {
  const refused = ask(state.email);
  say("code-error", refused ?? "");
  if (!refused) {
    document.getElementById("step-code").code.value = "";
    say("code-error");
    document.getElementById("resent")?.remove();
    const note = document.createElement("p");
    note.id = "resent";
    note.className = "muted";
    note.setAttribute("role", "status");
    note.textContent = "A new code is on its way. The old one no longer works.";
    document.getElementById("sign-in").before(note);
  }
});

document.getElementById("other-email").addEventListener("click", () => show("step-email"));

document.getElementById("expire").addEventListener("click", () => {
  state = { ...state, expired: true };
  saved.set("sign-in", state);
});

document.getElementById("step-profile").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target;
  if (!f.first.value.trim()) {
    say("profile-error", "Enter your first name, so the branch knows who you are.");
    return;
  }
  saved.set("profile", { first: f.first.value.trim() });
  // A new man lands on Home as a newcomer with no request (doc 14, flow 1).
  window.location.assign(withRole("./", "newcomer"));
});

show("step-email");
