import { program } from 'commander';

program
  .name('xrmcli')
  .usage('solution [options] [command]')
  .command('import', 'Imports a solution.', {
    executableFile: './solution/importsolution',
  })
  .command('export', 'Exports a solution.', {
    executableFile: './solution/exportsolution',
  })
  .command('patch', 'Creates a solution patch from a managed or unmanaged solution.', {
    executableFile: './solution/cloneaspatch',
  })
  .command(
    'clone',
    'Creates a new copy of an unmanged solution that contains the original solution plus all of its patches.',
    { executableFile: './solution/cloneassolution' },
  )
  .action(() => {
    program.help();
  });

program.parseAsync();
