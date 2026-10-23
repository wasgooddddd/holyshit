const BASE = "http://localhost:3110";

document.getElementById("test").addEventListener("click", async () => {
  const r = document.getElementById("r");
  r.textContent = "Working...";
  try {
    // enumerate clients (GET /o returns [[pid,user,ver,status,placeId], ...])
    const clients = await fetch(BASE + "/o").then(x => x.json()).catch(() => []);
    const pids = clients.map(c => String(c[0]));              // pids must be STRINGS

    const res = await fetch(BASE + "/o", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "Clients": JSON.stringify(pids.length ? pids : ["0"]) // required header
      },
      body: 'print("[SELFTEST] " .. "' + location.origin + '")'
    });
    r.textContent = "HTTP " + res.status + " | clients: " + JSON.stringify(clients);
  } catch (e) {
    r.textContent = "fetch threw: " + e.message;  // e.g. mixed content / server down
  }
});
