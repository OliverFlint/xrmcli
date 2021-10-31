import { program } from 'commander';

program
  .name('xrmcli')
  .usage('code [options] [command]')
  .command('typescript', 'Create a typescript project', {
    executableFile: './code/typescript',
  })
  .action(() => {
    program.help();
  });

program.parseAsync();
