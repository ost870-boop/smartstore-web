const localtunnel = require('localtunnel');

(async () => {
  try {
    const tunnel = await localtunnel({ port: 3000 });
    console.log('TUNNEL_URL:', tunnel.url);

    tunnel.on('close', () => {
      console.log('Tunnel closed.');
    });
    
    // Keep alive
    setInterval(() => {}, 1000 * 60 * 60);
  } catch (err) {
    console.error('Error starting tunnel:', err);
  }
})();
