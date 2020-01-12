'use strict';

const { SANDBOX_URLS } = require('../../src');
const { URL } = require('url');

/**
 *
 * Important
 *
 * - Do not edit this file. Copy it to to the root of the project as integration-settings.js and edit it there.
 *
 * @/src
 * @/test
 * @/integration-config.js ( Here!!! )
 * @/package.json
 *
 * - The endpoint cannot contain a port number. It must be just a domain or an IP. Why? Because of redsys servers.
 *
 */

/**
 *
 * Example to get endpoint address and notification working
 *
 * 1) Get a remote server(VPS) with fixed IP address. When setting up the ssh serer, dont forget to use the following option.
 *   GatewayPorts clientspecified
 *
 * 2) Reverse forward the port of your local notification server to the http port of your remote server. You need root privileges on the remote server.
 * $ ssh root@my-remote-server -R 0.0.0.0:80:localhost:3344
 *
 * 3) Open the http port (temporarily) on the remote server.
 * [root@my-remote-server ~]$ firewall-cmd --zone=public --add-service http
 *
 * 4) Use the domain of your remote server as endpoint. Alternatively, find your the IP address of your remote server and use it as endpoint.
 * [root@my-remote-server ~]$ ip address 
 *
 */
const endpoint = 'http://my-remote-server.com';

const successPath = '/success';
const errorPath = '/error';
const notificationPath = '/notification';

const settings = {
  notificationServer: {
    port: 3344,
  },
  instanceSettings: {
    secretKey: 'sq7HjrUOBfKmC576ILgskD5srU870gJ7',
    urls: SANDBOX_URLS,
  },
  merchantData: {
    merchantCode: '999008881',
    terminal: '1',
  },
  redirectData: {
    merchantURL: new URL(notificationPath, endpoint).toString(),
    successURL: new URL(successPath, endpoint).toString(),
    errorURL: new URL(errorPath, endpoint).toString(),
  },
  cardData: {
    pan: '4548812049400004',
    expiryMonth: '12',
    expiryYear: '20',
    CVV2: '123',
    cip: '123456',
  },
};

try {
  const overrideSettings = require('../../integration-settings');

  // Override settings
  for (const key in settings) {
    if (!(key in overrideSettings)) continue;
    settings[key] = Object.assign({}, settings[key], overrideSettings[key]);
  }

  //eslint-disable-next-line no-empty
} catch (err) {
}

module.exports = settings;
