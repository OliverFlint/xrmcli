import { program } from 'commander';
import { TokenResponse } from 'adal-node';
import fetch from 'node-fetch';
import ProgressBar from 'progress';
import ValidateConnectionOptions from '../utils/validation';
import Authenticate, { AddAuthCommandOptions } from '../utils/connect';
import { initHeader } from '../utils/header';

const read = async (
  authToken: TokenResponse,
  url: string,
  table: string,
  query: string,
  includeannotations: boolean,
): Promise<void> => {
  const bar = new ProgressBar('Reading reacord(s) :bar :elapsed seconds', { total: 50 });
  let barReverse = false;
  const timer = setInterval(() => {
    bar.tick(barReverse ? -1 : 1);
    if (bar.curr === bar.total - 1 || bar.curr <= 1) {
      barReverse = !(bar.curr <= 1);
    }
  }, 500);
  try {
    const result = await fetch(`${url}/api/data/v9.2/${table}${query}`, {
      headers: {
        ...initHeader(authToken.accessToken),
        Prefer: includeannotations ? 'odata.include-annotations=*' : '',
      },
      method: 'GET',
    });
    if (result) {
      const json = await result.json();
      if (json.error) {
        console.error(`\n${json.error.message}`);
      } else {
        console.log(`\n${JSON.stringify(json.value)}`);
      }
    }
  } catch (e) {
    console.error(`\n${e.message || 'Error reading reacord(s).'}`);
  } finally {
    clearInterval(timer);
  }
};

program.name('xrmcli data read');
AddAuthCommandOptions();
program
  .requiredOption('-e, --table <table>', 'Table (entity) name')
  .option('-q, --query <query>', 'Query to perform (odata or fetchxml')
  .option(
    '-a, --includeannotations',
    'Indicates if the results should include odata annotations',
    false,
  )
  .action(async (options) => {
    if (ValidateConnectionOptions(options)) {
      const auth = await Authenticate(options);
      await read(
        auth,
        options.url,
        options.table,
        options.query ? options.query : '',
        !!options.includeannotations,
      );
    }
  });

program.parseAsync();
