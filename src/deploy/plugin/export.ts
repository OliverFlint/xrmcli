import { program } from 'commander';
import { TokenResponse } from 'adal-node';
import fetch from 'node-fetch';
import ProgressBar from 'progress';
import { mkdirSync, writeFileSync } from 'fs';
import ValidateConnectionOptions from '../../utils/validation';
import Authenticate, { AddAuthCommandOptions } from '../../utils/connect';
import { initHeader } from '../../utils/header';

// eslint-disable-next-line max-len
// ./api/data/v9.2/pluginassemblies?$select=pluginassemblyid,name,sourcetype,isolationmode,description,path&$expand=pluginassembly_plugintype($select=description,assemblyname,_pluginassemblyid_value,friendlyname,plugintypeid,typename,name;$expand=plugintypeid_sdkmessageprocessingstep($select=description,name,configuration,filteringattributes,_impersonatinguserid_value,rank,stage,mode,asyncautodelete))&$filter=(ishidden/Value eq false and name eq %27ActivityFeeds.Plugins%27) and (pluginassembly_plugintype/any(o1:(o1/plugintypeid ne null) and (o1/plugintypeid_sdkmessageprocessingstep/any(o2:(o2/sdkmessageprocessingstepid ne null)))))&$top=50

const fetchdata = async (authToken: TokenResponse, query: string): Promise<any> => {
  const result = await fetch(query, {
    headers: {
      ...initHeader(authToken.accessToken),
    },
    method: 'GET',
  });
  if (result) {
    const json = await result.json();
    if (json.error) {
      console.error(`\n${json.error.message}`);
    } else {
      const spec = json.value[0];
      delete spec['@odata.etag'];
      delete spec.content;
      if (spec.pluginassembly_plugintype) {
        spec.pluginassembly_plugintype.forEach((element: any, index: number) => {
          delete spec.pluginassembly_plugintype[index]['@odata.etag'];
        });
      }
      if (spec['pluginassembly_plugintype@odata.nextLink']) {
        const spec2 = await fetchdata(authToken, spec['pluginassembly_plugintype@odata.nextLink']);
        spec.pluginassembly_plugintype.push(spec2);
        return spec;
      }
      return spec;
    }
  }
  return undefined;
};

const exportspec = async (
  authToken: TokenResponse,
  url: string,
  name: string,
  output: string,
): Promise<void> => {
  const bar = new ProgressBar('Exporting plugin spec :bar :elapsed seconds', { total: 50 });
  let barReverse = false;
  const timer = setInterval(() => {
    bar.tick(barReverse ? -1 : 1);
    if (bar.curr === bar.total - 1 || bar.curr <= 1) {
      barReverse = !(bar.curr <= 1);
    }
  }, 500);
  try {
    const result = await fetchdata(
      authToken,
      `${url}/api/data/v9.2/pluginassemblies?$select=pluginassemblyid,name,sourcetype,isolationmode,description,path&$expand=pluginassembly_plugintype($select=description,assemblyname,_pluginassemblyid_value,friendlyname,plugintypeid,typename,name;$expand=plugintypeid_sdkmessageprocessingstep($select=description,name,configuration,filteringattributes,_impersonatinguserid_value,rank,stage,mode,asyncautodelete))&$filter=(ishidden/Value eq false and name eq '${name}') and (pluginassembly_plugintype/any(o1:(o1/plugintypeid ne null) and (o1/plugintypeid_sdkmessageprocessingstep/any(o2:(o2/sdkmessageprocessingstepid ne null)))))&$top=1`,
    );
    if (result) {
      delete result['pluginassembly_plugintype@odata.nextLink'];
      mkdirSync(output, {
        recursive: true,
      });
      writeFileSync(`${output}/${name}.spec.json`, JSON.stringify(result), {
        encoding: 'utf8',
      });
      console.log('\nPlugin spec exported');
    }
  } catch (e) {
    console.error(`\n${e.message || 'Error exporting reacord(s).'}`);
  } finally {
    clearInterval(timer);
  }
};

program.name('xrmcli data export');
AddAuthCommandOptions();
program
  .requiredOption('-n, --name <name>', 'Plugin name')
  .requiredOption('-o, --output <output>', 'Path to the output folder')
  .action(async (options) => {
    if (ValidateConnectionOptions(options)) {
      const auth = await Authenticate(options);
      await exportspec(auth, options.url, options.name, options.output);
    }
  });

program.parseAsync();
