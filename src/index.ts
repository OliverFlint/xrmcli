#!/usr/bin/env node
import { option, program } from 'commander';
import { Authenticate } from './connect';
import { terms } from './terms';
import { exportsolution } from './exportsolution';
import { importsolution } from './importsolution';
import { readFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

/*
program.version("1.0.0");

program
  .requiredOption(
    "-u, --url <url>",
    `${terms.d365} Url. e.g. https://myorg.crm11.dynamics.com/`
  )
  .option("-n, --username <username>", `Username for ${terms.d365}`)
  .option("-p, --password <password>", `Password for ${terms.d365}`)
  .option("--secret <secret>", "OAuth Client Secret")
  .requiredOption(
    "-t, --tenent <tenent>",
    `${terms.AAD} authority. e.g. https://login.windows.net/myorg.onmicrosoft.com`
  )
  .option(
    "-c, --clientid <clientid>",
    "OAuth Client Id",
    "51f81489-12ee-4a9e-aaae-a2591f45987d"
  );

program.parse();
const options = program.opts();
*/
const ValidateGlobalOptions = (options: any): boolean => {
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

program
  .name('xrmtools')
  .requiredOption('-u, --url <url>', `${terms.d365} Url. e.g. https://myorg.crm11.dynamics.com/`)
  .option('-n, --username <username>', `Username for ${terms.d365}`)
  .option('-p, --password <password>', `Password for ${terms.d365}`)
  .option('-cs, --secret <secret>', 'OAuth Client Secret')
  .requiredOption(
    '-t, --tenent <tenent>',
    `${terms.AAD} authority. e.g. https://login.windows.net/myorg.onmicrosoft.com`,
  )
  .option('-c, --clientid <clientid>', 'OAuth Client Id', '51f81489-12ee-4a9e-aaae-a2591f45987d');

program
  .command('export')
  .description(`Export a ${terms.d365} Solution`)
  .requiredOption('-s, --solution <solution>', 'The unique name of the solution.')
  .requiredOption('-o, --output <output>', 'Path to output zip file')
  .option(
    '-m, --managed',
    'Indicates whether the solution should be exported as a managed solution.',
    false,
  )
  .option('--targetversion <targetversion>', 'The version that the exported solution will support.')
  .option(
    '--exportautonumberingsettings',
    'Indicates whether auto numbering settings should be included in the solution being exported.',
    false,
  )
  .option(
    '--exportcalendarsettings',
    'Indicates whether calendar settings should be included in the solution being exported',
    false,
  )
  .option(
    '--exportcustomizationsettings',
    'Indicates whether customization settings should be included in the solution being exported.',
    false,
  )
  .option(
    '--exportemailtrackingsettings',
    'Indicates whether email tracking settings should be included in the solution being exported.',
    false,
  )
  .option(
    '--exportgeneralsettings',
    'Indicates whether general settings should be included in the solution being exported.',
    false,
  )
  .option(
    '--exportmarketingsettings',
    'Indicates whether marketing settings should be included in the solution being exported.',
    false,
  )
  .option(
    '--exportoutlooksynchronizationsettings',
    'Indicates whether outlook synchronization settings should be included in the solution being exported.',
    false,
  )
  .option(
    '--exportrelationshiproles',
    'Indicates whether relationship role settings should be included in the solution being exported.',
    false,
  )
  .option(
    '--exportisvconfig',
    'Indicates whether ISV.Config settings should be included in the solution being exported.',
    false,
  )
  .option(
    '--exportsales',
    'Indicates whether sales settings should be included in the solution being exported.',
    false,
  )
  .option('--exportexternalapplications', '', false)
  .action(async (options) => {
    if (ValidateGlobalOptions(program.opts())) {
      const auth = await Authenticate(program.opts());
      await exportsolution(
        auth,
        program.opts().url,
        {
          SolutionName: options.solution,
          Managed: options.managed ? true : false,
          ExportAutoNumberingSettings: options.exportautonumberingsettings ? true : false,
          ExportCalendarSettings: options.exportcalendarsettings ? true : false,
          ExportCustomizationSettings: options.exportcustomizationsettings ? true : false,
          ExportEmailTrackingSettings: options.exportemailtrackingsettings ? true : false,
          ExportExternalApplications: options.exportexternalapplications ? true : false,
          ExportGeneralSettings: options.exportgeneralsettings ? true : false,
          ExportIsvConfig: options.exportisvconfig ? true : false,
          ExportMarketingSettings: options.exportmarketingsettings ? true : false,
          ExportOutlookSynchronizationSettings: options.exportoutlooksynchronizationsettings
            ? true
            : false,
          ExportRelationshipRoles: options.exportrelationshiproles ? true : false,
          ExportSales: options.exportsales ? true : false,
          TargetVersion: options.targetversion,
        },
        options.output,
      );
    }
  });

program
  .command('import')
  .description(`Import a ${terms.d365} Solution`)
  .requiredOption('-z, --zipfile <zipfile>', 'Solution zip file')
  .option(
    '--overwriteunmanagedcustomizations',
    'Indicates whether any unmanaged customizations that have been applied over existing managed solution components should be overwritten',
    true,
  )
  .option(
    '--publishworkflows',
    'Indicates whether any processes (workflows) included in the solution should be activated after they are imported.',
    true,
  )
  .option('--asyncribbonprocessing', '', false)
  .option(
    '--converttomanaged',
    'Converts any matching unmanaged customizations into your managed solution.',
    false,
  )
  .option('--holdingsolution', '', false)
  .option(
    '--skipproductupdatedependencies',
    'Indicates whether enforcement of dependencies related to product updates should be skipped.',
    false,
  )
  .option('--skipqueueribbonjob', '', false)
  .action(async (options) => {
    if (ValidateGlobalOptions(program.opts())) {
      const auth = await Authenticate(program.opts());
      await importsolution(auth, program.opts().url, {
        CustomizationFile: readFileSync(options.zipfile, { encoding: 'base64' }),
        ImportJobId: uuidv4(),
        OverwriteUnmanagedCustomizations: options.overwriteunmanagedcustomizations ? true : false,
        PublishWorkflows: options.publishworkflows ? true : false,
        AsyncRibbonProcessing: options.asyncribbonprocessing ? true : false,
        ConvertToManaged: options.converttomanaged ? true : false,
        HoldingSolution: options.holdingsolution ? true : false,
        SkipProductUpdateDependencies: options.skipproductupdatedependencies ? true : false,
        SkipQueueRibbonJob: options.skipqueueribbonjob ? true : false,
      });
    }
  });

program.addHelpText(
  'afterAll',
  `
When providing credentials you must provide in the following pairs:

  For username and password authentication:
    '-n, --username <username>' is required
    '-p, --password <password>' is required
    '-c, --clientid <clientid>' is optional

  For client secret authentication:
    '-c, --clientid <clientid>' is required
    '--secret <secret>' is required
`,
);

program.parseAsync();
