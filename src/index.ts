#!/usr/bin/env node
import { program } from 'commander';

program.name('xrmcli').version(require('../package.json').version);

program
  .command('data', 'perform data commands', { executableFile: './data' })
  .command('publish', 'publish customizations', { executableFile: './publish' })
  .command('solution', 'solution commands e.g. import, extprt, ...', {
    executableFile: './solution',
  })
  .command('code', 'create new code projects', { executableFile: './code' });

program.parseAsync();
