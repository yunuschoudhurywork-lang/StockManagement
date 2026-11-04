/**
 * Server startup script with DNS configuration fix
 * Fixes Node.js DNS resolution issue on Windows for MongoDB Atlas SRV connections
 */

const dns = require('dns');

// Configure DNS servers to use Google DNS instead of localhost
// This fixes the "querySrv ECONNREFUSED" error on Windows
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

console.log('DNS servers configured:', dns.getServers());

// Now start the server
require('./server.js');
