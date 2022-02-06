import { program } from 'commander';
import fetch, { Response, Body } from 'node-fetch';
import Authenticate, { AddAuthCommandOptions } from '../utils/connect';
import ValidateConnectionOptions from '../utils/validation';
import { readFileSync } from 'fs';
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
        let ids: string[] = [];
        for (let index = 0; index < config.WebResources.length; index++) {
          const value = config.WebResources[index];
          console.log(`Parsing Webresource '${value.name}'`);
          var query = `/api/data/v9.2/webresourceset?$select=content,webresourceid&$filter=(name eq '${value.name}')&$top=1`;
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
            var update = `/api/data/v9.2/webresourceset(${webresourceid})`;
            const result = await fetch(`${url}${update}`, {
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
            if (result.status >= 200 && result.status < 300) {
              ids.push(webresourceid);
              console.log(`Deployed ${value.name} (${result.status})`);
              publish = true;
            } else {
              throw new Error(
                `Deployment of ${value.name} failed! ${result.status} ${result.statusText}`,
              );
            }
          } else {
            console.log(`Deploying (New) ${value.name}`);
            var update = `/api/data/v9.2/webresourceset`;
            const result = await fetch(`${url}${update}`, {
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
            if (result.status >= 200 && result.status < 300) {
              ids.push(
                result.headers.get('odata-entityid')?.replace(/(.+\()(.+)(\))/, '$2') as string,
              );
              console.log(`Deployed ${value.name} (${result.status})`);
              publish = true;
            } else {
              throw new Error(
                `Deployment of ${value.name} failed! ${result.status} ${result.statusText}`,
              );
            }
          }
        }
        if (publish) {
          await publishsome(
            auth,
            url,
            `<importexportxml><webresources>${ids
              .map((value) => {
                return `<webresource>{${value}}</webresource>`;
              })
              .join()}</webresources></importexportxml>`,
          );
        }
        console.log(`${ids.length} Webresources deployed.`);
      }
    } catch (e) {
      console.error(`${e.message || 'Error deploying webresources.'}`);
    }
  });
program.parseAsync();
