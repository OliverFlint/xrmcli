import { program } from 'commander';

export const ValidateConnectionOptions = (options: any): boolean => {
  // eslint-disable-next-line object-curly-newline
  const { clientid, secret, username, password } = options;
  if (username && password && clientid) {
    return true;
  }
  if (clientid && secret) {
    return true;
  }
  program.help();
  return false;
};

export default ValidateConnectionOptions;
