const BASE = "http://localhost:3110";

document.getElementById("test").addEventListener("click", async () => {
  const r = document.getElementById("r");
  r.textContent = "Sending POST...";

  try {
    const res = await fetch(BASE + "/o", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain"
      },
      body: "my niga: " + location.origin
    });

    r.textContent = "POST response: HTTP " + res.status;
    console.log("Localhost POST status:", res.status);
  } catch (e) {
    r.textContent = "Request failed: " + e.message;
    console.error(e);
  }
});
