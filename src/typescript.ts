import { program } from 'commander';

program
  .name('xrmcli')
  .description('Create new TypeScript Webresource projects')
  .usage('typescript [options] [command]')
  .command('list', 'List available templates', { executableFile: './typescript/list' })
  .command('create', 'Create a project', {
    executableFile: './typescript/create',
  })
  .command('deploy', 'Deploy webresorces', { executableFile: './typescript/deploy' })
  .command('export', 'Export webresorces', { executableFile: './typescript/export' })
  .action(() => {
    program.help();
  });
program.parseAsync();
