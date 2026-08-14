// 3. Fetch a deliberately wrong URL to trigger the catch block,
//    then fetch a real URL that returns 404 to show why res.ok
//    is also required (fetch only rejects on network-level failures,
//    not on HTTP error status codes).

async function testBadUrl() {
  console.log('--- Test A: nonexistent domain ---');
  try {
    const res = await fetch('https://this-domain-does-not-exist-abc123.fake/data');
    console.log('Unexpected success:', res.status);
  } catch (err) {
    // This is where we expect to land: DNS/network failure throws,
    // so fetch's promise rejects and our catch block runs.
    console.log('catch block ran. Error name:', err.name);
    console.log('This proves try/catch handles network-level failures.');
  }
}

async function testRealNotFound() {
  console.log('\n--- Test B: real server, 404 response ---');
  const res = await fetch('https://api.github.com/repos/anthropics/definitely-not-a-real-repo-xyz');

  // No throw here! fetch() resolved successfully — the server responded,
  // it just responded with a 404. Without checking res.ok we'd wrongly
  // treat this as success and try to use a body that's an error payload.
  console.log('fetch() resolved normally. status:', res.status, ' ok:', res.ok);

  if (!res.ok) {
    console.log('res.ok is false -> we must handle this explicitly.');
    return;
  }

  const data = await res.json();
  console.log(data);
}

(async () => {
  await testBadUrl();
  await testRealNotFound();
})();
