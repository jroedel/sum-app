// The stand-in for the dues form in drop-in forms, where Stripe takes the
// card (doc 06). Paying here only marks it paid in this browser, and goes
// back to Dues, as the real form returns to the app.
import { firstDuesState, role, saved } from "./app.js";
import { withRole } from "./model.js";

const first = new URLSearchParams(window.location.search).get("for") === "first";
const payer = first ? "Lucas" : { member: "Mateo", secretary: "Daniel" }[role];

document.querySelector('[data-slot="payer"]').textContent = payer ?? "you";

for (const b of document.querySelectorAll("[data-pay]")) {
  b.addEventListener("click", () => {
    if (first && firstDuesState === "due") {
      saved.set("first-dues", true);
    } else if (!first && payer) {
      saved.set(`paid:${payer.toLowerCase()}`, true);
    }
    window.location.assign(withRole("dues.html?paid=1", role));
  });
}
