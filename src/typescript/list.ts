import { program } from 'commander';
import fetch from 'node-fetch';

program.name('xrmcli typescript list');
program.action(async () => {
  const response = await fetch(
    'https://api.github.com/search/repositories?q=xrmcli-code-template-',
  );
  const json = await response.json();
  const names = json.items.map((value: any) => ({
    name: value.name.replace('xrmcli-code-template-', ''),
    description: value.description,
  }));
  names.forEach((element: any) => {
    console.log(`\x1b[32m${element.name}\x1b[0m => ${element.description}`);
  });
  console.log('\r');
  console.log('Example:');
  console.log('xrmcli typescript create --template \x1b[32mesbuild\x1b[0m');
});
program.parseAsync();
