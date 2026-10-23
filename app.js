'use strict';

const ENDPOINT = 'http://localhost:3110/o';
const TIMEOUT_MS = 5000;

const button = document.getElementById('runButton');
const result = document.getElementById('result');

// Display the endpoint and current page origin.
document.getElementById('endpoint').textContent = ENDPOINT;
document.getElementById('origin').textContent = window.location.origin;

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
    'Sending a simple GET request to the local endpoint.'
  );

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);

  try {
    const response = await fetch(ENDPOINT, {
      method: 'GET',
      mode: 'cors',
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
        `Endpoint responded: HTTP ${response.status}`,
        'The browser was able to read the response. This confirms GET reachability from this page, but does not prove that other methods or routes are vulnerable.'
      );
    } else {
      showResult(
        'warning',
        `Endpoint responded: HTTP ${response.status}`,
        'The browser could read the response, but the server returned a non-success status. Check the endpoint configuration.'
      );
    }

    if (bodyPreview) {
      const preview = document.createElement('pre');

      preview.textContent =
        `Response preview (up to 500 characters):\n${bodyPreview}`;

      result.append(preview);
    }
  } catch (error) {
    const detail =
      error.name === 'AbortError'
        ? `The request timed out after ${TIMEOUT_MS / 1000} seconds.`
        : 'The browser could not complete or read the request. The service may be stopped, the route may be unavailable, or CORS may have blocked access. Browser fetch errors do not reliably distinguish these causes.';

    showResult('error', 'Request failed', detail);
  } finally {
    clearTimeout(timeout);
    button.disabled = false;
    button.textContent = 'Run connectivity test';
  }
}

button.addEventListener('click', runTest);