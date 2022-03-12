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

const clonesolution = async (
  authToken: TokenResponse,
  url: string,
  options: cloneoptions,
): Promise<void> => {
  const bar = new ProgressBar('Cloneing solution :bar :elapsed seconds', { total: 50 });
  let barReverse = false;
  const timer = setInterval(() => {
    bar.tick(barReverse ? -1 : 1);
    if (bar.curr === bar.total - 1 || bar.curr <= 1) {
      barReverse = !(bar.curr <= 1);
    }
  }, 500);
  try {
    const result = await fetch(`${url}/api/data/v9.2/CloneAsSolution`, {
      headers: initHeader(authToken.accessToken),
      method: 'POST',
      body: JSON.stringify(options),
    });
    if (result) {
      const json = await result.json();
      if (json.error) {
        console.error(`\n${json.error.message}`);
      } else {
        console.log(`\nSolution cloned with id ${json.SolutionId}`);
      }
    }
  } catch (e: any) {
    console.error(`\n${e.message || 'Error cloneing solution.'}`);
  } finally {
    clearInterval(timer);
  }
};

program.name('xrmcli solution clone').addHelpText(
  'after',
  `
https://docs.microsoft.com/en-us/dynamics365/customer-engagement/web-api/cloneassolution`,
);
AddAuthCommandOptions();
program
  .requiredOption(
    '-s, --parentsolutionuniquename <parentsolutionuniquename>',
    'The name of the parent solution. This name must be the same as the parent name in the original solution that was cloned.',
  )
  .requiredOption('-d, --displayname <displayname>', 'The name of the cloned solution.')
  .requiredOption(
    '-v, --versionnumber <versionnumber>',
    'The version number of the patch. The version must be greater than the parent solution but have the same major.minor number.',
  )
  .action(async (options) => {
    if (ValidateConnectionOptions(options)) {
      const auth = await Authenticate(options);
      await clonesolution(auth, options.url, {
        ParentSolutionUniqueName: options.parentsolutionuniquename,
        DisplayName: options.displayname,
        VersionNumber: options.versionnumber,
      });
    }
  });

program.parseAsync();
