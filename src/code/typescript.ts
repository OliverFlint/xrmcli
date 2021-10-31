import { program } from 'commander';
import fetch from 'node-fetch';
import { copySync, removeSync, writeFileSync, readFileSync } from 'fs-extra';
import { Extract } from 'unzipper';
import child_process from 'child_process';

program.name('xrmcli code typescript');
program
  .option('--name <name>', 'Project name', 'Webresources')
  .option('--template <template>', 'Template type (tsc, webpack, esbuild)', 'tsc')
  .option('--xrmtypesgen', 'Include XrmTypesGen', false)
  .option('--list', 'List available templates', false)
  .action(async (options: any) => {
    try {
      const { name, template, xrmtypesgen, list } = options;
      const response = await fetch(
        'https://api.github.com/search/repositories?q=xrmcli-code-template-',
      );
      const json = await response.json();
      const names = json.items.map((value: any) => {
        return {
          url: value.url,
          branch: value.default_branch,
          name: value.name.replace('xrmcli-code-template-', ''),
        };
      });

      if (list) {
        names.forEach((element: any) => {
          console.log(element.name);
        });
        return;
      }

      const downloadsource = `https://github.com/OliverFlint/xrmcli-code-template-${template}/archive/refs/heads/main.zip`;
      const zipfile = await fetch(downloadsource);
      const downloadPromise = new Promise<any>((resolve, reject) => {
        try {
          zipfile.body.pipe(Extract({ path: './_template' })).on('close', () => {
            resolve(true);
          });
        } catch (err) {
          console.log(`Template download failed! ${err}`);
          reject(err);
        }
      });
      const downloaded = await downloadPromise;
      if (!downloaded) {
        console.log('Template download failed!');
        return;
      }

      copySync(`./_template/xrmcli-code-template-${template}-main`, './', { recursive: true });
      removeSync('./_template');

      const packagejson = JSON.parse(readFileSync('./package.json', { encoding: 'utf8' }));
      packagejson.name = name;
      writeFileSync('./package.json', JSON.stringify(packagejson));

      child_process.execSync('npm install', { stdio: 'inherit' });

      if (xrmtypesgen) {
        child_process.execSync('npm install xrmtypesgen --save-dev', { stdio: 'inherit' });
      }

      console.log('Finished.');
    } catch (err) {
      console.log(`Code template command failed! ${err}`);
    }
  });

program.parseAsync();
