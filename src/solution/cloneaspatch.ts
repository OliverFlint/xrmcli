import { program } from 'commander';
import { TokenResponse } from 'adal-node';
import fetch from 'node-fetch';
import ProgressBar from 'progress';
import ValidateConnectionOptions from '../utils/validation';
import Authenticate, { AddAuthCommandOptions } from '../utils/connect';
import { initHeader } from '../utils/header';

interface cloneoptions {
  ParentSolutionUniqueName: string;
  DisplayName: string;
  VersionNumber: string;
}

const clonepatch = async (
  authToken: TokenResponse,
  url: string,
  options: cloneoptions,
): Promise<void> => {
  const bar = new ProgressBar('Cloneing patch :bar :elapsed seconds', { total: 50 });
  let barReverse = false;
  const timer = setInterval(() => {
    bar.tick(barReverse ? -1 : 1);
    if (bar.curr === bar.total - 1 || bar.curr <= 1) {
      barReverse = !(bar.curr <= 1);
    }
  }, 500);
  try {
    const result = await fetch(`${url}/api/data/v9.2/CloneAsPatch`, {
      headers: initHeader(authToken.accessToken),
      method: 'POST',
      body: JSON.stringify(options),
    });
    if (result) {
      const json = await result.json();
      if (json.error) {
        console.error(`\n${json.error.message}`);
      } else {
        console.log(`\nSolution cloned as patch with id ${json.SolutionId}`);
      }
    }
  } catch (e: any) {
    console.error(`\n${e.message || 'Error cloneing patch.'}`);
  } finally {
    clearInterval(timer);
  }
};

program.name('xrmcli solution patch').addHelpText(
  'after',
  `
https://docs.microsoft.com/en-us/dynamics365/customer-engagement/web-api/cloneaspatch`,
);
AddAuthCommandOptions();
program
  .requiredOption(
    '-s, --parentsolutionuniquename <parentsolutionuniquename>',
    'The unique name of the parent solution.',
  )
  .requiredOption('-d, --displayname <displayname>', 'The name of the patch.')
  .requiredOption(
    '-v, --versionnumber <versionnumber>',
    'The version number of the patch. The version must be greater than the parent solution but have the same major.minor number.',
  )
  .action(async (options) => {
    if (ValidateConnectionOptions(options)) {
      const auth = await Authenticate(options);
      await clonepatch(auth, options.url, {
        ParentSolutionUniqueName: options.parentsolutionuniquename,
        DisplayName: options.displayname,
        VersionNumber: options.versionnumber,
      });
    }
  });

program.parseAsync();
