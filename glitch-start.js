const http = require('http');
const handler = require('./api/[...fastify].js');

const server = http.createServer(async (req, res) => {
  try {
    // Check if the handler is an object with a default property (Vercel unwrap)
    const fn = typeof handler === 'function' ? handler : (handler.default || handler);
    await fn(req, res);
  } catch (err) {
    res.statusCode = 500;
    res.end('Server Error');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
