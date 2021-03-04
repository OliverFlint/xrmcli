import { AuthenticationContext, ErrorResponse, TokenResponse } from 'adal-node';

export const Authenticate = (options: any): Promise<TokenResponse> => {
  const { tenent, url, clientid, secret, username, password } = options;
  if (username && password && clientid) {
    return authenticateWithUsernamePassword(tenent, url, username, password, clientid);
  } else if (clientid && secret) {
    return authenticateWithClientSecret(tenent, url, clientid, secret);
  } else {
    throw 'Invalid authetication options!';
  }
};

const authenticateWithUsernamePassword = (
  tenent: string,
  url: string,
  username: string,
  password: string,
  clientid: string,
): Promise<TokenResponse> => {
  return new Promise((resolve, reject) => {
    const authContext = new AuthenticationContext(tenent);
    authContext.acquireTokenWithUsernamePassword(
      url,
      username,
      password,
      clientid,
      (error, response) => {
        if (error) {
          reject(error);
        }
        if ((response as TokenResponse).accessToken) {
          resolve(response as TokenResponse);
        }
        if ((response as ErrorResponse).error) {
          reject(response as ErrorResponse);
        }
        reject('Unknow authentication error!');
      },
    );
  });
};

const authenticateWithClientSecret = (
  tenent: string,
  url: string,
  clientid: string,
  secret: string,
): Promise<TokenResponse> => {
  return new Promise((resolve, reject) => {
    const authContext = new AuthenticationContext(tenent);
    authContext.acquireTokenWithClientCredentials(url, clientid, secret, (error, response) => {
      if (error) {
        reject(error);
      }
      if ((response as TokenResponse).accessToken) {
        resolve(response as TokenResponse);
      }
      if ((response as ErrorResponse).error) {
        reject(response as ErrorResponse);
      }
      reject('Unknow authentication error!');
    });
  });
};
