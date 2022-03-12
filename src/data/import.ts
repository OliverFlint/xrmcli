import { program } from 'commander';
import { TokenResponse } from 'adal-node';
import fetch from 'node-fetch';
import ProgressBar from 'progress';
import { readFileSync } from 'fs';
import ValidateConnectionOptions from '../utils/validation';
import Authenticate, { AddAuthCommandOptions } from '../utils/connect';
import { initHeader } from '../utils/header';

const exportrecords = async (
  authToken: TokenResponse,
  url: string,
  input: string,
): Promise<void> => {
  const bar = new ProgressBar('Importing :record [:bar] :elapsed seconds :status', {
    total: 10,
  });
  try {
    const filecontent = readFileSync(input, { encoding: 'utf8' });
    const json = JSON.parse(filecontent);
    const { table, records } = json;
    bar.total = records.length * 2 + 1;
    const metadataresult = await fetch(
      `${url}/api/data/v9.0/EntityDefinitions?$select=LogicalName&$filter=LogicalCollectionName eq '${table}'`,
      {
        headers: {
          ...initHeader(authToken.accessToken),
        },
        method: 'GET',
      },
    );
    if (metadataresult) {
      const metajson = await metadataresult.json();
      const { LogicalName } = metajson.value[0];
      bar.tick({ record: `${LogicalName}(s)` });
      // eslint-disable-next-line no-restricted-syntax
      for (const data of records) {
        const id = data[`${LogicalName}id`] ? `(${data[`${LogicalName}id`]})` : '';
        // eslint-disable-next-line no-param-reassign
        delete data['@odata.etag'];
        // eslint-disable-next-line no-param-reassign
        delete data[`${LogicalName}id`];
        bar.tick({ status: '' });
        // eslint-disable-next-line no-await-in-loop
        const result = await fetch(`${url}/api/data/v9.2/${table}${id}`, {
          headers: {
            ...initHeader(authToken.accessToken),
          },
          method: 'PATCH',
          body: JSON.stringify(data),
        });
        if (result) {
          if (result) {
            if (result.status >= 200 && result.status < 300) {
              bar.tick({ status: '', record: `${LogicalName}(s)` });
            } else {
              bar.tick({
                status: `Error importing ${LogicalName}. ${result.statusText}`,
                record: `${LogicalName}(s)`,
              });
            }
          }
        }
      }
    }
  } catch (e: any) {
    console.error(`\n${e.message || 'Error importing reacord(s).'}`);
  }
};

program.name('xrmcli data import');
AddAuthCommandOptions();
program.requiredOption('-i, --input <input>', 'Path to the input file').action(async (options) => {
  if (ValidateConnectionOptions(options)) {
    const auth = await Authenticate(options);
    await exportrecords(auth, options.url, options.input);
  }
});

program.parseAsync();
