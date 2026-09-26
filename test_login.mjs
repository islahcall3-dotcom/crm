import fetch from 'node-fetch';

async function testLogin() {
  const res = await fetch('http://127.0.0.1:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: '123456' })
  });
  
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Body:', data);
  
  process.exit(0);
}
testLogin();
