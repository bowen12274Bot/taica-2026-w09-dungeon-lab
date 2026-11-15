import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Uses an already installed Chrome and Node's built-in WebSocket; no test dependency.
export async function openPagesBrowser(executable) {
  const profile = mkdtempSync(join(tmpdir(), 'dungeon-pages-'));
  const process = spawn(executable, ['--headless=new', '--remote-debugging-port=0',
    `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let launchError;
  process.on('error', error => { launchError = error; });
  let port;
  for (let i = 0; i < 100; i++) {
    if (launchError) throw launchError;
    try { port = Number(readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]); break; } catch { /* Chrome still starting */ }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!port) { process.kill(); throw new Error('Chrome debugging endpoint did not start'); }
  const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  const pending = new Map(), consoleLog = [], network = [];
  let id = 0;
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const task = pending.get(message.id); if (!task) return;
      pending.delete(message.id); clearTimeout(task.timer);
      if (message.error) task.reject(new Error(JSON.stringify(message.error))); else task.resolve(message.result);
    } else if (message.method === 'Runtime.exceptionThrown') {
      consoleLog.push({ level: 'error', details: message.params.exceptionDetails });
    } else if (message.method === 'Runtime.consoleAPICalled') {
      consoleLog.push({ level: message.params.type, values: message.params.args.map(arg => arg.value ?? arg.description) });
    } else if (message.method === 'Network.responseReceived') {
      const r = message.params.response; network.push({ url: r.url, status: r.status, mimeType: r.mimeType });
    } else if (message.method === 'Network.loadingFailed') {
      network.push({ failed: true, error: message.params.errorText, canceled: message.params.canceled });
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const key = ++id;
    const timer = setTimeout(() => { pending.delete(key); reject(new Error(`CDP timeout: ${method}`)); }, 30000);
    pending.set(key, { resolve, reject, timer }); socket.send(JSON.stringify({ id: key, method, params }));
  });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    return result.result.value;
  };
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  return {
    evaluate, consoleLog, network,
    viewport: (width, height) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false }),
    navigate: async url => {
      const result = await send('Page.navigate', { url }); if (result.errorText) throw new Error(result.errorText);
      for (let i = 0; i < 100; i++) {
        try { if (await evaluate(`location.href === ${JSON.stringify(url)} && Boolean(document.querySelector('#game canvas')) && document.querySelector('#status').hidden`)) return; } catch { /* context changed during navigation */ }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      throw new Error('Public game did not become ready');
    },
    screenshot: async path => {
      const result = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(path, Buffer.from(result.data, 'base64'));
    },
    close: async () => {
      try { await send('Browser.close'); } catch { process.kill(); }
      socket.close();
    },
  };
}
