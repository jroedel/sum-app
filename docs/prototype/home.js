// Home's one control: withdrawing a request to join (doc 04: he can withdraw
// at any time, and then ask another group).
import { withdraw } from "./app.js";

document.getElementById("withdraw")?.addEventListener("click", () => withdraw());
