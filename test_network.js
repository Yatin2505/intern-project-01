
const dns = require('dns');
const https = require('https');

console.log('Testing DNS resolution for api.coincap.io...');
dns.lookup('api.coincap.io', (err, address, family) => {
    if (err) {
        console.error('DNS Lookup failed for api.coincap.io:', err);
    } else {
        console.log('DNS Lookup successful:', address);

        console.log('Testing HTTPS connection to api.coincap.io...');
        const req = https.get('https://api.coincap.io/v2/assets?limit=1', (res) => {
            console.log('Response status:', res.statusCode);
            res.on('data', () => { }); // consume data
            res.on('end', () => console.log('Response finished.'));
        }).on('error', (e) => {
            console.error('HTTPS request failed:', e);
        });
    }
});

console.log('Testing DNS resolution for google.com...');
dns.lookup('google.com', (err, address) => {
    if (err) console.error('DNS Lookup failed for google.com:', err);
    else console.log('DNS Lookup successful for google.com:', address);
});
