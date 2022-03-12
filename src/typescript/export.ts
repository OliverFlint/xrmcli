import { program } from 'commander';
import fetch from 'node-fetch';
import { mkdirSync, writeFileSync } from 'fs';
import initHeader from '../utils/header';
import Authenticate, { AddAuthCommandOptions } from '../utils/connect';
import ValidateConnectionOptions from '../utils/validation';
import IWebresourceConfig from '../utils/wrconfig';

const saveToDisk = (webresource: any, outputPath: string) => {
  const { name, content, displayname } = webresource;
  console.log(`Saving ${displayname}...`);
  const path = (name as string).substring(0, (name as string).lastIndexOf('/'));
  mkdirSync(`${outputPath}/${path}`, { recursive: true });
  writeFileSync(`${outputPath}/${name}`, content, { encoding: 'base64' });
};

const saveConfig = (config: IWebresourceConfig, outputPath: string) => {
  console.log('Saving config...');
  const configString = JSON.stringify(config, undefined, 2);
  writeFileSync(`${outputPath}/webresource.config.json`, configString, { encoding: 'utf-8' });
};

program.name('xrmcli typescript export');
AddAuthCommandOptions();
program
  .description(
    'Export webresources from the specified solution to the file system and create a deploy config',
  )
  .requiredOption('--solution <solution>', 'Unique solution name')
  .requiredOption('--path <path>', 'Output path')
  .action(async (options) => {
    try {
      if (ValidateConnectionOptions(options)) {
        const auth = await Authenticate(options);
        const { url, solution, path } = options;
        // get list of webresources
        const componentQuery = `/api/data/v9.2/solutions?$select=solutionid&$expand=solution_solutioncomponent($select=objectid;$filter=(componenttype eq 61))&$filter=(uniquename eq '${solution}') and (solution_solutioncomponent/any(o1:(o1/componenttype eq 61)))`;
        const result = await fetch(`${url}${componentQuery}`, {
          headers: initHeader(auth.accessToken),
          method: 'GET',
        });
        const jsonResult = await result.json();
        if (jsonResult.value.length === 0) {
          throw new Error(`${solution} contains no webresources`);
        }
        const webresourceids = (jsonResult.value[0].solution_solutioncomponent as [])?.map(
          (value: any) => value.objectid as string,
        );

        // export each webresource to disk
        const webresourceQuery = `/api/data/v9.2/webresourceset?$select=name,webresourcetype,content,displayname,description&$filter=(Microsoft.Dynamics.CRM.In(PropertyName='webresourceid',PropertyValues=${JSON.stringify(
          webresourceids,
        )}))`;
        const wresult = await fetch(`${url}${webresourceQuery}`, {
          headers: initHeader(auth.accessToken),
          method: 'GET',
        });
        const jsonWResult = await wresult.json();
        (jsonWResult.value as []).forEach((value: any) => {
          saveToDisk(value, path);
        });

        // generate deploy config
        const config: IWebresourceConfig = {
          WebResources: [],
        };
        (jsonWResult.value as []).forEach((value: any) => {
          config.WebResources.push({
            name: value.name,
            displayname: value.displayname,
            description: value.description,
            path: `${path}/${value.name}`,
            type: value.webresourcetype,
          });
        });
        saveConfig(config, path);
      }
    } catch (e: any) {
      console.error(`${e.message || 'Error exporting webresources.'}`);
    }
  });
program.parseAsync();
