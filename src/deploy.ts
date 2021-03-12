import { program } from 'commander';

program
  .name('xrmcli')
  .usage('deploy [options] [command]')
  .command('plugin', 'Deploy a plugin', {
    executableFile: './deploy/plugin',
  })
  .action(() => {
    program.help();
  });

program.parseAsync();
