import { program } from 'commander';

program.name('xrmcli code typescript');
program
  .option('--name', 'Project name', 'Webresources')
  .option('--template', 'Template type (tsc, webpack, esbuild)', 'tsc')
  .option('--xrmtypesgen', 'Include XrmTypesGen', false)
  .action(async (options) => {
    const { name, template, xrmtypesgen } = options;
    let templatename = 'tsc';
    if (template === 'tsc' && !xrmtypesgen) {
      templatename = 'tsc';
    } else if (template === 'tsc' && xrmtypesgen) {
      templatename = 'tsc-xtg';
    }
    const downloadsource = `https://github.com/OliverFlint/xrmcli-code-template-${templatename}/archive/refs/heads/main.zip`;
  });

program.parseAsync();
