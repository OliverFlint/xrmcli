import { program } from 'commander';
import { TokenResponse } from 'adal-node';
import fetch from 'node-fetch';
import ProgressBar from 'progress';
import ValidateConnectionOptions from '../utils/validation';
import Authenticate, { AddAuthCommandOptions } from '../utils/connect';
import { initHeader } from '../utils/header';

const update = async (
  authToken: TokenResponse,
  url: string,
  table: string,
  recordid: string,
  data: string,
): Promise<void> => {
  const bar = new ProgressBar('Updating record :bar :elapsed seconds', { total: 50 });
  let barReverse = false;
  const timer = setInterval(() => {
    bar.tick(barReverse ? -1 : 1);
    if (bar.curr === bar.total - 1 || bar.curr <= 1) {
      barReverse = !(bar.curr <= 1);
    }
  }, 500);
  try {
    const result = await fetch(`${url}/api/data/v9.2/${table}(${recordid})`, {
      headers: {
        ...initHeader(authToken.accessToken),
      },
      method: 'PATCH',
      body: data,
    });
    if (result) {
      if (result.status >= 200 && result.status < 300) {
        console.log(`\nReacord updated. ${result.headers.get('location')}`);
      } else {
        console.error(`\nError updating record. ${result.statusText}`);
      }
    }
  } catch (e) {
    console.error(`\n${e.message || 'Error updating record.'}`);
  } finally {
    clearInterval(timer);
  }
};

program.name('xrmcli data update');
AddAuthCommandOptions();
program
  .requiredOption('-e, --table <table>', 'Table (entity) name')
  .requiredOption('-i, --id <id>', 'The id of the record to update')
  .requiredOption('-d, --data <data>', 'The data e.g. { field: value }')
  .action(async (options) => {
    if (ValidateConnectionOptions(options)) {
      const auth = await Authenticate(options);
      await update(auth, options.url, options.table, options.id, options.data);
    }
  });

program.parseAsync();
