import { program } from 'commander';

program
  .name('xrmcli')
  .usage('data [options] [command]')
  .command('create', 'Create a record', {
    executableFile: './data/create',
  })
  .command('read', 'Read record(s)', {
    executableFile: './data/read',
  })
  .command('update', 'Update a record (also upserts)', {
    executableFile: './data/update',
  })
  .command('delete', 'Delete a record', {
    executableFile: './data/delete',
  })
  .command('export', 'Export record(s)', {
    executableFile: './data/export',
  })
  .command('import', 'Import record(s)', {
    executableFile: './data/import',
  })
  .action(() => {
    program.help();
  });

program.parseAsync();
