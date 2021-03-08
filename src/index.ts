#!/usr/bin/env node
import { program } from 'commander';

program.name('xrmcli').version(require('../package.json').version);

program
  .command('solution', 'solution commands e.g. import, extprt, ...', {
    executableFile: './solution',
  })
  .command('publish', 'publish customizations', { executableFile: './publish' })
  .command('data', 'perform data commands', { executableFile: './data' });

program.parseAsync();
