import { program } from 'commander';

program
  .name('xrmcli')
  .usage('publish [options] [command]')
  .command('all', 'Publishes all changes to solution components.', {
    executableFile: './publish/all',
  })
  .command('some', 'Publishes specified solution components.', {
    executableFile: './publish/some',
  })
  .action(() => {
    program.help();
  });

program.parseAsync();
