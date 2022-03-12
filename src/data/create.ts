import { program } from 'commander';
import { TokenResponse } from 'adal-node';
import fetch from 'node-fetch';
import ProgressBar from 'progress';
import ValidateConnectionOptions from '../utils/validation';
import Authenticate, { AddAuthCommandOptions } from '../utils/connect';
import { initHeader } from '../utils/header';

const create = async (
  authToken: TokenResponse,
  url: string,
  table: string,
  data: string,
): Promise<void> => {
  const bar = new ProgressBar('Creating record :bar :elapsed seconds', { total: 50 });
  let barReverse = false;
  const timer = setInterval(() => {
    bar.tick(barReverse ? -1 : 1);
    if (bar.curr === bar.total - 1 || bar.curr <= 1) {
      barReverse = !(bar.curr <= 1);
    }
  }, 500);
  try {
    const result = await fetch(`${url}/api/data/v9.2/${table}`, {
      headers: {
        ...initHeader(authToken.accessToken),
      },
      method: 'POST',
      body: data,
    });
    if (result) {
      if (result.status >= 200 && result.status < 300) {
        console.log(`\nReacord created. ${result.headers.get('location')}`);
      } else {
        console.error(`\nError creating record. ${result.statusText}`);
      }
    }
  } catch (e: any) {
    console.error(`\n${e.message || 'Error creating record.'}`);
  } finally {
    clearInterval(timer);
  }
};

program.name('xrmcli data create');
AddAuthCommandOptions();
program
  .requiredOption('-e, --table <table>', 'Table (entity) name')
  .requiredOption('-d, --data <data>', 'The data e.g. { field: value }')
  .action(async (options) => {
    if (ValidateConnectionOptions(options)) {
      const auth = await Authenticate(options);
      await create(auth, options.url, options.table, options.data);
    }
  });

program.parseAsync();
