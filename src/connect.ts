import { AuthenticationContext, ErrorResponse, TokenResponse } from 'adal-node';

const authenticateWithUsernamePassword = (
  tenent: string,
  url: string,
  username: string,
  password: string,
  clientid: string,
): Promise<TokenResponse> =>
  // eslint-disable-next-line implicit-arrow-linebreak
  new Promise((resolve, reject) => {
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
          reject((response as ErrorResponse).error);
        }
        reject(new Error('Unknow authentication error!'));
      },
    );
  });

const authenticateWithClientSecret = (
  tenent: string,
  url: string,
  clientid: string,
  secret: string,
): Promise<TokenResponse> =>
  // eslint-disable-next-line implicit-arrow-linebreak
  new Promise((resolve, reject) => {
    const authContext = new AuthenticationContext(tenent);
    authContext.acquireTokenWithClientCredentials(url, clientid, secret, (error, response) => {
      if (error) {
        reject(error);
      }
      if ((response as TokenResponse).accessToken) {
        resolve(response as TokenResponse);
      }
      if ((response as ErrorResponse).error) {
        reject((response as ErrorResponse).error);
      }
      reject(new Error('Unknow authentication error!'));
    });
  });

export const Authenticate = (options: any): Promise<TokenResponse> => {
  // eslint-disable-next-line object-curly-newline
  const { tenent, url, clientid, secret, username, password } = options;
  if (username && password && clientid) {
    return authenticateWithUsernamePassword(tenent, url, username, password, clientid);
  }
  if (clientid && secret) {
    return authenticateWithClientSecret(tenent, url, clientid, secret);
  }
  throw new Error('Invalid authetication options!');
};

export default Authenticate;
