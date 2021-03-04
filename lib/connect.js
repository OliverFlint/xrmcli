"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authenticate = void 0;
const adal_node_1 = require("adal-node");
const Authenticate = (options) => {
    const { tenent, url, clientid, secret, username, password } = options;
    if (username && password && clientid) {
        return authenticateWithUsernamePassword(tenent, url, username, password, clientid);
    }
    else if (clientid && secret) {
        return authenticateWithClientSecret(tenent, url, clientid, secret);
    }
    else {
        throw 'Invalid authetication options!';
    }
};
exports.Authenticate = Authenticate;
const authenticateWithUsernamePassword = (tenent, url, username, password, clientid) => {
    return new Promise((resolve, reject) => {
        const authContext = new adal_node_1.AuthenticationContext(tenent);
        authContext.acquireTokenWithUsernamePassword(url, username, password, clientid, (error, response) => {
            if (error) {
                reject(error);
            }
            if (response.accessToken) {
                resolve(response);
            }
            if (response.error) {
                reject(response);
            }
            reject('Unknow authentication error!');
        });
    });
};
const authenticateWithClientSecret = (tenent, url, clientid, secret) => {
    return new Promise((resolve, reject) => {
        const authContext = new adal_node_1.AuthenticationContext(tenent);
        authContext.acquireTokenWithClientCredentials(url, clientid, secret, (error, response) => {
            if (error) {
                reject(error);
            }
            if (response.accessToken) {
                resolve(response);
            }
            if (response.error) {
                reject(response);
            }
            reject('Unknow authentication error!');
        });
    });
};
//# sourceMappingURL=connect.js.map