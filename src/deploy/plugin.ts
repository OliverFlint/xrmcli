import { program } from 'commander';

program
  .name('xrmcli')
  .usage('deploy plugin [options] [command]')
  .command('register', 'Register a plugin', {
    executableFile: 'plugin/register',
  })
  .command('export', 'Export a plugin spec', {
    executableFile: 'plugin/export',
  })
  .action(() => {
    program.help();
  });

program.parseAsync();
