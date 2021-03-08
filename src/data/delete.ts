import { program } from 'commander';
import { TokenResponse } from 'adal-node';
import fetch from 'node-fetch';
import ProgressBar from 'progress';
import ValidateConnectionOptions from '../utils/validation';
import Authenticate, { AddAuthCommandOptions } from '../utils/connect';
import { initHeader } from '../utils/header';

const deleterecord = async (
  authToken: TokenResponse,
  url: string,
  table: string,
  recordid: string,
): Promise<void> => {
  const bar = new ProgressBar('Deleting record :bar :elapsed seconds', { total: 50 });
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
      method: 'DELETE',
    });
    if (result) {
      if (result.status >= 200 && result.status < 300) {
        console.log('\nReacord deleted.');
      } else {
        console.error(`\nError deleting record. ${result.statusText}`);
      }
    }
  } catch (e) {
    console.error(`\n${e.message || 'Error deleting record.'}`);
  } finally {
    clearInterval(timer);
  }
};

program.name('xrmcli data delete');
AddAuthCommandOptions();
program
  .requiredOption('-e, --table <table>', 'Table (entity) name')
  .requiredOption('-i, --id <id>', 'The id of the record to update')
  .action(async (options) => {
    if (ValidateConnectionOptions(options)) {
      const auth = await Authenticate(options);
      await deleterecord(auth, options.url, options.table, options.id);
    }
  });

program.parseAsync();
