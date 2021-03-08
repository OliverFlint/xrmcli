import { program } from 'commander';
import { TokenResponse } from 'adal-node';
import fetch from 'node-fetch';
import { mkdirSync, writeFileSync } from 'fs';
import ProgressBar from 'progress';
import ValidateConnectionOptions from '../utils/validation';
import Authenticate, { AddAuthCommandOptions } from '../utils/connect';
import { initHeader } from '../utils/header';

interface exportoptions {
  SolutionName: string;
  Managed: boolean;
  TargetVersion?: string;
  ExportAutoNumberingSettings?: boolean;
  ExportCalendarSettings?: boolean;
  ExportCustomizationSettings?: boolean;
  ExportEmailTrackingSettings?: boolean;
  ExportGeneralSettings?: boolean;
  ExportMarketingSettings?: boolean;
  ExportOutlookSynchronizationSettings?: boolean;
  ExportRelationshipRoles?: boolean;
  ExportIsvConfig?: boolean;
  ExportSales?: boolean;
  ExportExternalApplications?: boolean;
}

const exportsolution = async (
  authToken: TokenResponse,
  url: string,
  options: exportoptions,
  output: string,
): Promise<void> => {
  const bar = new ProgressBar('Exporting :bar :elapsed seconds', { total: 50 });
  let barReverse = false;
  const timer = setInterval(() => {
    bar.tick(barReverse ? -1 : 1);
    if (bar.curr === bar.total - 1 || bar.curr <= 1) {
      barReverse = !(bar.curr <= 1);
    }
  }, 500);
  try {
    const result = await fetch(`${url}/api/data/v9.2/ExportSolution`, {
      headers: initHeader(authToken.accessToken),
      method: 'POST',
      body: JSON.stringify(options),
    });
    if (result) {
      const json = await result.json();
      if (json.error) {
        console.error(`\n${json.error.message}`);
      } else {
        mkdirSync(output.replace(/(?:.(?!\/|\\))+.zip/, ''), {
          recursive: true,
        });
        writeFileSync(output, json.ExportSolutionFile, { encoding: 'base64' });
        console.log('\nSolution exported');
      }
    }
  } catch (e) {
    console.error(`\n${e.message || 'Error exporting solution.'}`);
  } finally {
    clearInterval(timer);
  }
};
program.name('xrmcli solution export').addHelpText(
  'after',
  `
https://docs.microsoft.com/en-us/dynamics365/customer-engagement/web-api/exportsolution`,
);
AddAuthCommandOptions();
program
  .requiredOption('-s, --solution <solution>', 'The unique name of the solution.')
  .requiredOption('-o, --output <output>', 'Path to output zip file')
  .option(
    '-m, --managed',
    'Indicates whether the solution should be exported as a managed solution.',
    false,
  )
  .option(
    '-v, --targetversion <targetversion>',
    'The version that the exported solution will support.',
  )
  .option(
    '-an, --exportautonumberingsettings',
    'Indicates whether auto numbering settings should be included in the solution being exported.',
    false,
  )
  .option(
    '-cal, --exportcalendarsettings',
    'Indicates whether calendar settings should be included in the solution being exported',
    false,
  )
  .option(
    '-cus, --exportcustomizationsettings',
    'Indicates whether customization settings should be included in the solution being exported.',
    false,
  )
  .option(
    '-eml, --exportemailtrackingsettings',
    'Indicates whether email tracking settings should be included in the solution being exported.',
    false,
  )
  .option(
    '-gen, --exportgeneralsettings',
    'Indicates whether general settings should be included in the solution being exported.',
    false,
  )
  .option(
    '-mkt, --exportmarketingsettings',
    'Indicates whether marketing settings should be included in the solution being exported.',
    false,
  )
  .option(
    '-olk, --exportoutlooksynchronizationsettings',
    'Indicates whether outlook synchronization settings should be included in the solution being exported.',
    false,
  )
  .option(
    '-rel, --exportrelationshiproles',
    'Indicates whether relationship role settings should be included in the solution being exported.',
    false,
  )
  .option(
    '-isv, --exportisvconfig',
    'Indicates whether ISV.Config settings should be included in the solution being exported.',
    false,
  )
  .option(
    '-sal, --exportsales',
    'Indicates whether sales settings should be included in the solution being exported.',
    false,
  )
  .option('-ext, --exportexternalapplications', '', false)
  .action(async (options) => {
    if (ValidateConnectionOptions(options)) {
      const auth = await Authenticate(options);
      await exportsolution(
        auth,
        program.opts().url,
        {
          SolutionName: options.solution,
          Managed: !!options.managed,
          ExportAutoNumberingSettings: !!options.exportautonumberingsettings,
          ExportCalendarSettings: !!options.exportcalendarsettings,
          ExportCustomizationSettings: !!options.exportcustomizationsettings,
          ExportEmailTrackingSettings: !!options.exportemailtrackingsettings,
          ExportExternalApplications: !!options.exportexternalapplications,
          ExportGeneralSettings: !!options.exportgeneralsettings,
          ExportIsvConfig: !!options.exportisvconfig,
          ExportMarketingSettings: !!options.exportmarketingsettings,
          ExportOutlookSynchronizationSettings: !!options.exportoutlooksynchronizationsettings,
          ExportRelationshipRoles: !!options.exportrelationshiproles,
          ExportSales: !!options.exportsales,
          TargetVersion: options.targetversion,
        },
        options.output,
      );
    }
  });

program.parseAsync();
