import { program } from 'commander';
import ValidateConnectionOptions from '../utils/validation';
import Authenticate, { AddAuthCommandOptions } from '../utils/connect';
import { publishsome } from '../utils/publish';

program.name('xrmcli publish all').addHelpText(
  'after',
  `
https://docs.microsoft.com/en-us/dynamics365/customer-engagement/web-api/publishxml`,
);
AddAuthCommandOptions();
program
  .requiredOption(
    '-p, --parameterxml <parameterxml>',
    'The XML that defines which solution components to publish in this request. https://docs.microsoft.com/en-us/dotnet/api/microsoft.crm.sdk.messages.publishxmlrequest.parameterxml',
  )
  .action(async (options) => {
    if (ValidateConnectionOptions(options)) {
      const auth = await Authenticate(options);
      await publishsome(auth, options.url, options.parameterxml);
    }
  });

program.parseAsync();
