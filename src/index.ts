#!/usr/bin/env node
import { program } from 'commander';

program.name('xrmcli').version(require('../package.json').version);

program
  .command('data', 'perform data commands', { executableFile: './data' })
  .command('publish', 'publish customizations', { executableFile: './publish' })
  .command('solution', 'solution commands e.g. import, export, ...', {
    executableFile: './solution',
  })
  .command('typescript', 'Create new TypeScript Webresource projects', {
    executableFile: './typescript',
  });
program.parseAsync();
