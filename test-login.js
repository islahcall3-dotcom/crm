fetch('http://localhost:8080/api/v1/auth/login', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:5173',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'content-type'
  }
}).then(r => r.text().then(t => {
  console.log('STATUS:', r.status);
  console.log('HEADERS:', Object.fromEntries(r.headers.entries()));
  console.log('BODY:', t);
})).catch(console.error);
