const { loadPartialConfig } = require('@babel/core');

const filename = require.resolve('expo-router/entry');

const cfg = loadPartialConfig({
  filename,
  cwd: process.cwd(),
});

function clean(o) {
  if (!o || typeof o !== 'object') return o;
  const copy = Array.isArray(o) ? [] : {};
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (typeof v === 'function') {
      copy[k] = `[Function ${v.name||'anon'}]`;
    } else if (v && typeof v === 'object') {
      copy[k] = clean(v);
    } else {
      copy[k] = v;
    }
  }
  return copy;
}

console.log('--- Babel loadPartialConfig RESULT ---');
if (!cfg) {
  console.log('NO CONFIG returned by Babel');
  process.exit(1);
}

const files = cfg.files ? Array.from(cfg.files) : [];
console.log('Files loaded (config chain):');
console.log(files.length ? files.map(f => ' - ' + f).join('\n') : ' (none)');

console.log('\nOptions snapshot (sanitized):');
const snap = clean(cfg.options || {});
const toName = (x) => {
  if (Array.isArray(x)) x = x[0];
  if (typeof x === 'string') return x;
  if (x && typeof x === 'object' && x.name) return x.name;
  return '[desc]';
};
console.log(JSON.stringify({
  cwd: snap.cwd,
  root: snap.root,
  rootMode: snap.rootMode,
  babelrc: snap.babelrc,
  babelrcRoots: snap.babelrcRoots,
  configFile: snap.configFile,
  presets: (snap.presets||[]).map(toName),
  plugins: (snap.plugins||[]).map(toName),
}, null, 2));

console.log('\nRaw options keys (top-level):', Object.keys(snap).sort());
