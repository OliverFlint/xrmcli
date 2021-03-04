import { TokenResponse } from 'adal-node';
import { initHeader } from './header';
import fetch, { Response } from 'node-fetch';
import { mkdirSync, writeFile, writeFileSync } from 'fs';
import ProgressBar from 'progress';

export const exportsolution = async (
  authToken: TokenResponse,
  url: string,
  options: exportoptions,
  output: string,
): Promise<void> => {
  const bar = new ProgressBar('Exporting :bar :elapsed seconds', { total: 50 });
  let barReverse = false;
  const timer = setInterval(function () {
    bar.tick(barReverse ? -1 : 1);
    if (bar.curr === bar.total - 1 || bar.curr <= 1) {
      barReverse = !(bar.curr <= 1);
    }
  }, 500);
  try {
    const result = await fetch(`${url}/api/data/v9.2/ExportSolution`, {
      headers: initHeader(authToken.accessToken),
      method: 'POST',
      body: JSON.stringify(options),
    });
    if (result) {
      const json = await result.json();
      if (json.error) {
        console.error(`\n${json.error.message}`);
      } else {
        mkdirSync(output.replace(/(?:.(?!\/|\\))+.zip/, ''), {
          recursive: true,
        });
        writeFileSync(output, json.ExportSolutionFile, { encoding: 'base64' });
        console.log('\nSolution exported');
      }
    }
  } catch (e) {
    console.error(`\n${e.message || 'Error exporting solution.'}`);
  } finally {
    clearInterval(timer);
  }
};

interface exportoptions {
  SolutionName: string;
  Managed: boolean;
  TargetVersion?: string;
  ExportAutoNumberingSettings?: boolean;
  ExportCalendarSettings?: boolean;
  ExportCustomizationSettings?: boolean;
  ExportEmailTrackingSettings?: boolean;
  ExportGeneralSettings?: boolean;
  ExportMarketingSettings?: boolean;
  ExportOutlookSynchronizationSettings?: boolean;
  ExportRelationshipRoles?: boolean;
  ExportIsvConfig?: boolean;
  ExportSales?: boolean;
  ExportExternalApplications?: boolean;
}
