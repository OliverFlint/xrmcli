import { TokenResponse } from 'adal-node';
import fetch from 'node-fetch';
import ProgressBar from 'progress';
import { initHeader } from './header';

interface importoptions {
  OverwriteUnmanagedCustomizations: boolean;
  PublishWorkflows: boolean;
  CustomizationFile: string;
  ImportJobId: string;
  ConvertToManaged?: boolean;
  SkipProductUpdateDependencies?: boolean;
  HoldingSolution?: boolean;
  SkipQueueRibbonJob?: boolean;
  AsyncRibbonProcessing?: boolean;
}

export const importsolution = async (
  authToken: TokenResponse,
  url: string,
  options: importoptions,
): Promise<void> => {
  const bar = new ProgressBar('Importing :bar :elapsed seconds', { total: 50 });
  let barReverse = false;
  const timer = setInterval(() => {
    bar.tick(barReverse ? -1 : 1);
    if (bar.curr === bar.total - 1 || bar.curr <= 1) {
      barReverse = !(bar.curr <= 1);
    }
  }, 500);
  try {
    const result = await fetch(`${url}/api/data/v9.2/ImportSolution`, {
      headers: initHeader(authToken.accessToken),
      method: 'POST',
      body: JSON.stringify(options),
    });
    if (result) {
      if (result.status >= 200 && result.status < 300) {
        console.log('\nSolution imported');
      } else {
        console.error(`\nError importing solution. ${result.statusText}`);
      }
    }
  } catch (e) {
    console.error(`\n${e.message || 'Error importing solution.'}`);
  } finally {
    clearInterval(timer);
  }
};

export default importsolution;
