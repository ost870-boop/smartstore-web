const localtunnel = require('localtunnel');
const http = require('http');

(async () => {
    try {
        const tunnel = await localtunnel({ 
            port: 3000,
            subdomain: 'chaeum-mobile-' + Math.floor(Math.random() * 9000 + 1000) 
        });

        console.log('\n[SUCCESS] 외부 접속 링크가 생성되었습니다!');
        console.log('TUNNEL_URL=' + tunnel.url);
        
        http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp) {
            resp.on('data', function(ip) {
                console.log('TUNNEL_IP=' + ip);
                console.log('[READY] 이제 위 링크로 접속하실 수 있습니다.');
            });
        });

        tunnel.on('close', () => {
             console.log('Tunnel closed');
        });
        
    } catch (err) {
        console.log('Error:', err);
    }
})();
