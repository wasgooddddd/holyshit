'use strict';

const BASE = 'http://localhost:3110';
const GET_ENDPOINT = `${BASE}/o`;
const POST_ENDPOINT = `${BASE}/test`;
const TIMEOUT_MS = 5000;
const PAYLOAD = 'hi';

const button = document.getElementById('runButton');
const result = document.getElementById('result');

const endpointEl = document.getElementById('endpoint');
const originEl = document.getElementById('origin');

if (endpointEl) endpointEl.textContent = GET_ENDPOINT;
if (originEl) originEl.textContent = window.location.origin;

function showResult(state, heading, detail) {
  if (!result) {
    console.error(heading, detail);
    return;
  }

  result.dataset.state = state;
  result.replaceChildren();

  const title = document.createElement('strong');
  title.textContent = heading;
  result.appendChild(title);

  const message = document.createElement('p');
  message.textContent = detail;
  result.appendChild(message);
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    TIMEOUT_MS
  );

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: 'no-store'
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function runTest() {
  if (!button || !result) {
    console.error('Missing #runButton or #result in the HTML.');
    return;
  }

  button.disabled = true;
  button.textContent = 'Testing…';

  try {
    showResult(
      '',
      'Test running',
      'Checking the local endpoint…'
    );

    // Read-only GET check.
    let clients = [];
    let getStatus = 'GET request failed';

    try {
      const response = await fetchWithTimeout(GET_ENDPOINT, {
        method: 'GET',
        mode: 'cors'
      });

      getStatus = `GET HTTP ${response.status}`;

      if (response.ok) {
        const data = await response.json().catch(() => []);
        clients = Array.isArray(data) ? data : [];
      }
    } catch (error) {
      getStatus = error.name === 'AbortError'
        ? 'GET request timed out'
        : 'GET failed: service unavailable or browser blocked access';
    }

    // Send "hi" to a dedicated test endpoint.
    // Your local server must implement POST /test.
    let postStatus;

    try {
      const response = await fetchWithTimeout(POST_ENDPOINT, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: PAYLOAD
      });

      const body = await response.text().catch(() => '');
      postStatus = `POST HTTP ${response.status}`;

      showResult(
        response.ok ? 'success' : 'warning',
        postStatus,
        `GET result: ${getStatus}\n` +
        `POST body sent: ${PAYLOAD}\n` +
        `Server response: ${body.slice(0, 500) || '(empty)'}`
      );
    } catch (error) {
      postStatus = error.name === 'AbortError'
        ? 'POST request timed out'
        : 'POST failed: service unavailable or browser blocked access';

      showResult(
        'error',
        postStatus,
        `GET result: ${getStatus}\n` +
        `The browser could not complete the POST request.`
      );
    }

    console.log('Client list:', clients);
    console.log('GET:', getStatus);
    console.log('POST:', postStatus);

  } finally {
    button.disabled = false;
    button.textContent = 'Run connectivity test';
  }
}

if (button) {
  button.addEventListener('click', runTest);
}
