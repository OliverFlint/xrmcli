import { TokenResponse } from 'adal-node';
import fetch from 'node-fetch';
import ProgressBar from 'progress';
import { program } from 'commander';
import { v4 as uuidv4 } from 'uuid';
import { readFileSync } from 'fs';
import Authenticate, { AddAuthCommandOptions } from '../utils/connect';
import ValidateConnectionOptions from '../utils/validation';
import { initHeader } from '../utils/header';

interface importoptions {
  OverwriteUnmanagedCustomizations: boolean;
  PublishWorkflows: boolean;
  CustomizationFile: string;
  ImportJobId: string;
  ConvertToManaged?: boolean;
  SkipProductUpdateDependencies?: boolean;
  HoldingSolution?: boolean;
  SkipQueueRibbonJob?: boolean;
  AsyncRibbonProcessing?: boolean;
}

const importsolution = async (
  authToken: TokenResponse,
  url: string,
  options: importoptions,
): Promise<void> => {
  const bar = new ProgressBar('Importing :bar :elapsed seconds', { total: 50 });
  let barReverse = false;
  const timer = setInterval(() => {
    bar.tick(barReverse ? -1 : 1);
    if (bar.curr === bar.total - 1 || bar.curr <= 1) {
      barReverse = !(bar.curr <= 1);
    }
  }, 500);
  try {
    const result = await fetch(`${url}/api/data/v9.2/ImportSolution`, {
      headers: initHeader(authToken.accessToken),
      method: 'POST',
      body: JSON.stringify(options),
    });
    if (result) {
      if (result.status >= 200 && result.status < 300) {
        console.log('\nSolution imported');
      } else {
        console.error(`\nError importing solution. ${result.statusText}`);
      }
    }
  } catch (e: any) {
    console.error(`\n${e.message || 'Error importing solution.'}`);
  } finally {
    clearInterval(timer);
  }
};

program.name('xrmcli solution import').addHelpText(
  'after',
  `
https://docs.microsoft.com/en-us/dynamics365/customer-engagement/web-api/importsolution`,
);
AddAuthCommandOptions();
program
  .requiredOption('-z, --zipfile <zipfile>', 'Solution zip file')
  .option(
    '-omc, --overwriteunmanagedcustomizations',
    'Indicates whether any unmanaged customizations that have been applied over existing managed solution components should be overwritten',
    true,
  )
  .option(
    '-pw, --publishworkflows',
    'Indicates whether any processes (workflows) included in the solution should be activated after they are imported.',
    true,
  )
  .option('-arp, --asyncribbonprocessing', '', false)
  .option(
    '-cm, --converttomanaged',
    'Converts any matching unmanaged customizations into your managed solution.',
    false,
  )
  .option('-hs, --holdingsolution', '', false)
  .option(
    '-spd, --skipproductupdatedependencies',
    'Indicates whether enforcement of dependencies related to product updates should be skipped.',
    false,
  )
  .option('-sqr, --skipqueueribbonjob', '', false)
  .action(async (options) => {
    if (ValidateConnectionOptions(options)) {
      const auth = await Authenticate(options);
      await importsolution(auth, program.opts().url, {
        CustomizationFile: readFileSync(options.zipfile, { encoding: 'base64' }),
        ImportJobId: uuidv4(),
        OverwriteUnmanagedCustomizations: !!options.overwriteunmanagedcustomizations,
        PublishWorkflows: !!options.publishworkflows,
        AsyncRibbonProcessing: !!options.asyncribbonprocessing,
        ConvertToManaged: !!options.converttomanaged,
        HoldingSolution: !!options.holdingsolution,
        SkipProductUpdateDependencies: !!options.skipproductupdatedependencies,
        SkipQueueRibbonJob: !!options.skipqueueribbonjob,
      });
    }
  });

program.parseAsync();
