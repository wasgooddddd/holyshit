(() => {
  "use strict";
  const BASE = "http://localhost:3110";
  const result = document.getElementById("result");

  function show(title, details) {
    result.textContent = title + "\n\n" + details;
  }

  document.getElementById("getBtn").addEventListener("click", async () => {
    show("Testing GET /o…", "Waiting for the local service.");
    try {
      const response = await fetch(BASE + "/o", {
        method: "GET",
        cache: "no-store"
      });
      const contentType = response.headers.get("content-type") || "(not exposed)";
      show("GET response received", [
        "HTTP status: " + response.status,
        "Response readable by page: yes",
        "Content-Type: " + contentType,
        "Origin tested: " + location.origin,
        "Note: response contents were not read."
      ].join("\n"));
    } catch (error) {
      show("GET failed or was blocked", [
        String(error),
        "",
        "Possible causes: service not running, address/port mismatch, CORS policy,",
        "browser private-network restrictions, or HTTPS-to-HTTP restrictions."
      ].join("\n"));
    }
  });

  document.getElementById("postBtn").addEventListener("click", async () => {
    show("Testing harmless POST /o…", "Sending only a fixed diagnostic string.");
    try {
      const response = await fetch(BASE + "/o", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "localhost CORS diagnostic only; no command or client data",
        cache: "no-store"
      });
      show("POST response received", [
        "HTTP status: " + response.status,
        "Response readable by page: yes",
        "Origin tested: " + location.origin,
        "This confirms an HTTP response, not that any command executed."
      ].join("\n"));
    } catch (error) {
      show("POST failed or was blocked", [
        String(error),
        "",
        "A text/plain POST may avoid a CORS preflight, but browser and local-network",
        "protections can still block it. A failure does not identify the exact cause."
      ].join("\n"));
    }
  });
})();
