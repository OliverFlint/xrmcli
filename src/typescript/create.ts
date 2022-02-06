import { program } from 'commander';
import fetch from 'node-fetch';
import { copySync, removeSync, writeFileSync, readFileSync } from 'fs-extra';
import { Extract } from 'unzipper';
import child_process from 'child_process';

program.name('xrmcli typescript create');
program
  .option('--name <name>', 'Project name', 'Webresources')
  .requiredOption('--template <template>', 'Template type (tsc, webpack, esbuild)')
  .option('--xrmtypesgen', 'Include XrmTypesGen', false)
  .option('--path <path>', 'Path to create project', './')
  .action(async (options: any) => {
    try {
      const { name, template, xrmtypesgen, path } = options;
      console.log(path);
      const response = await fetch(
        'https://api.github.com/search/repositories?q=xrmcli-code-template-',
      );
      const json = await response.json();
      const names = json.items.map((value: any) => {
        return {
          url: value.svn_url,
          branch: value.default_branch,
          name: value.name.replace('xrmcli-code-template-', ''),
        };
      }) as { url: string; branch: string; name: string }[];

      const repo = names.find((value) => {
        return value.name == template;
      });

      if (!repo || !repo.url || !repo.name || !repo.branch) {
        console.log(`Template '${template}' not found!`);
        return;
      }

      const downloadsource = `${repo?.url}/archive/refs/heads/${repo?.branch}.zip`;
      const zipfile = await fetch(downloadsource);
      const downloadPromise = new Promise<any>((resolve, reject) => {
        try {
          zipfile.body.pipe(Extract({ path: `${path}/_template` })).on('close', () => {
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

      copySync(`${path}/_template/xrmcli-code-template-${template}-main`, `${path}/`, {
        recursive: true,
      });
      removeSync(`${path}/_template`);

      const packagejson = JSON.parse(readFileSync(`${path}/package.json`, { encoding: 'utf8' }));
      packagejson.name = name;
      writeFileSync(`${path}/package.json`, JSON.stringify(packagejson));

      child_process.execSync('npm install', { stdio: 'inherit', cwd: `${path}/` });

      if (xrmtypesgen) {
        child_process.execSync('npm install xrmtypesgen --save-dev', {
          stdio: 'inherit',
          cwd: `${path}/`,
        });
      }

      console.log('Finished.');
    } catch (err) {
      console.log(`Code template command failed! ${err}`);
    }
  });
program.parseAsync();
