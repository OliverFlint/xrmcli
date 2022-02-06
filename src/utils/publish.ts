import fetch from 'node-fetch';
import ProgressBar from 'progress';
import { initHeader } from '../utils/header';
import { TokenResponse } from 'adal-node';

export const publishsome = async (
  authToken: TokenResponse,
  url: string,
  parameterxml: string,
): Promise<void> => {
  const bar = new ProgressBar('Publishing customizations :bar :elapsed seconds', { total: 50 });
  let barReverse = false;
  const timer = setInterval(() => {
    bar.tick(barReverse ? -1 : 1);
    if (bar.curr === bar.total - 1 || bar.curr <= 1) {
      barReverse = !(bar.curr <= 1);
    }
  }, 500);
  try {
    const result = await fetch(`${url}/api/data/v9.2/PublishXml`, {
      headers: initHeader(authToken.accessToken),
      method: 'POST',
      body: JSON.stringify({
        ParameterXml: parameterxml,
      }),
    });
    if (result) {
      if (result.status >= 200 && result.status < 300) {
        console.log('\nCustomizations published.');
      } else {
        console.error(`\nError publishing customizations. ${result.statusText}`);
      }
    }
  } catch (e) {
    console.error(`\n${e.message || 'Error publishing customizations.'}`);
  } finally {
    clearInterval(timer);
  }
};
