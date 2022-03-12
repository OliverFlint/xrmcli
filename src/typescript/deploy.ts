import { program } from 'commander';
import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import Authenticate, { AddAuthCommandOptions } from '../utils/connect';
import ValidateConnectionOptions from '../utils/validation';
import IWebresourceConfig from '../utils/wrconfig';
import initHeader from '../utils/header';
import { publishsome } from '../utils/publish';

program.name('xrmcli typescript deploy');
AddAuthCommandOptions();
program
  .requiredOption('--configfile <configfile>', 'Configuration file')
  .option('--solution <solution>', 'Solution to add the webresources to')
  .action(async (options) => {
    try {
      if (ValidateConnectionOptions(options)) {
        const { url, configfile } = options;
        // load config
        const configjson = readFileSync(configfile, { encoding: 'utf-8' });
        const config: IWebresourceConfig = JSON.parse(configjson);
        // upsert webresources
        const auth = await Authenticate(options);
        let publish = false;
        const ids: string[] = [];
        for (let index = 0; index < config.WebResources.length; index += 1) {
          const value = config.WebResources[index];
          console.log(`Parsing Webresource '${value.name}'`);
          const query = `/api/data/v9.2/webresourceset?$select=content,webresourceid&$filter=(name eq '${value.name}')&$top=1`;
          const result = await fetch(`${url}${query}`, {
            headers: initHeader(auth.accessToken),
            method: 'GET',
          });
          const jsonResult = await result.json();
          const fileContents = readFileSync(value.path, { encoding: 'base64' });
          if (jsonResult?.value.length > 0) {
            const { content, webresourceid } = jsonResult?.value[0];
            if (content === fileContents) {
              console.log(`No changes detected in ${value.name}, file skipped.`);
              continue;
            }
            console.log(`Deploying (Existing) ${value.name}`);
            const update = `/api/data/v9.2/webresourceset(${webresourceid})`;
            const r = await fetch(`${url}${update}`, {
              headers: initHeader(auth.accessToken),
              method: 'PATCH',
              body: JSON.stringify({
                name: value.name,
                content: fileContents,
                displayname: value.displayname,
                description: value.description,
                webresourcetype: value.type,
              }),
            });
            if (r.status >= 200 && r.status < 300) {
              ids.push(webresourceid);
              console.log(`Deployed ${value.name} (${r.status})`);
              publish = true;
            } else {
              throw new Error(`Deployment of ${value.name} failed! ${r.status} ${r.statusText}`);
            }
          } else {
            console.log(`Deploying (New) ${value.name}`);
            const update = '/api/data/v9.2/webresourceset';
            const r = await fetch(`${url}${update}`, {
              headers: initHeader(auth.accessToken),
              method: 'POST',
              body: JSON.stringify({
                name: value.name,
                content: fileContents,
                displayname: value.displayname,
                description: value.description,
                webresourcetype: value.type,
              }),
            });
            if (r.status >= 200 && r.status < 300) {
              ids.push(r.headers.get('odata-entityid')?.replace(/(.+\()(.+)(\))/, '$2') as string);
              console.log(`Deployed ${value.name} (${r.status})`);
              publish = true;
            } else {
              throw new Error(`Deployment of ${value.name} failed! ${r.status} ${r.statusText}`);
            }
          }
        }
        if (publish) {
          await publishsome(
            auth,
            url,
            `<importexportxml><webresources>${ids
              .map((value) => `<webresource>{${value}}</webresource>`)
              .join()}</webresources></importexportxml>`,
          );
        }
        console.log(`${ids.length} Webresources deployed.`);
      }
    } catch (e: any) {
      console.error(`${e.message || 'Error deploying webresources.'}`);
    }
  });
program.parseAsync();
