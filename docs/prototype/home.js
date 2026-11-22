// Home's one control: withdrawing a request to join (doc 04: he can withdraw
// at any time, and then ask another group). And the member's displacement
// notice goes once he has removed the booking it is about.
import { saved, withdraw } from "./app.js";

document.getElementById("withdraw")?.addEventListener("click", () => withdraw());

if ((saved.get("removed") ?? []).includes("mateo-wed")) {
  document.getElementById("displaced-home")?.remove();
}
