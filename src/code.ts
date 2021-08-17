import { program } from 'commander';

program
  .name('xrmcli')
  .usage('code [options] [command]')
  .command('typescript', 'Create a typescript project', {
    executableFile: './code/typescript',
  })
  .command('plugin', 'Create a c# plugin project', {
    executableFile: './code/plugin',
  })
  .command('workflow', 'Create a custom workflow activity project', {
    executableFile: './code/workflow',
  })
  .action(() => {
    program.help();
  });

program.parseAsync();
