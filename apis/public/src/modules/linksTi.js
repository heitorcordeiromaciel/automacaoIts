const { chromium } = require('playwright');
const fs = require('fs');
const colors = require('chalk');
const { exec } = require('child_process');

const dados = [
  {
    pfsense: "PFSENSE SEDE",
    url: "https://192.168.1.1/"
  },
  {
    pfsense: "SEDE AUXCC",
    url: "https://10.100.20.1/"
  },
  {
    pfsense: "SANTOS",
    url: "https://10.70.20.1/"
  },
  {
    pfsense: "IBAMA",
    url: "https://10.70.30.1/"
  },
  {
    pfsense: "PRODEMGE",
    url: "https://10.70.40.1/"
  },
  {
    pfsense: "BARRA FUNDA",
    url: "https://192.168.50.1/"
  },
  {
    pfsense: "CAGECE",
    url: "https://10.70.10.1/"
  },
  {
    pfsense: "CAMPINAS",
    url: "https://192.168.10.1/"
  },
];

async function runPlaywrightScript() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  const result = [];

  for (const dado of dados) {
    console.log(colors.cyan(dado.pfsense));

    try {
      await page.goto(dado.url);
    } catch (error) {
      console.log(colors.red('PFSENSE OFFLINE'));
      continue;
    }

    await page.getByPlaceholder('Username').fill('julio');
    await page.getByPlaceholder('Password').fill('imperatriz@135');
    await page.locator('input[name="login"]').click();

    await page.waitForTimeout(2000);
    await checkStatus(page, result, dado.pfsense);
  }

  await browser.close();

  fs.writeFileSync('gateway_status.json', JSON.stringify(result, null, 2));

  console.log('Updated gateway_status.json');
}

async function checkStatus(page, result, pfsenseName) {
  for (let i = 0; i < 5; i++) {
    const rows = await page.$$(`#gateways-${i}-gwtblbody > tr`);

    if (rows.length > 0) {
      const pfsenseData = {
        pfsense: pfsenseName,
        gateways: []
      };

      for (let row of rows) {
        try {
          const linkName = await row.$eval('td[title=""], td[title="Default gateway"]', el => el.innerText.trim());

          const onlineStatus = await row.$('.bg-success');
          if (onlineStatus) {
            const statusText = await onlineStatus.innerText();
            pfsenseData.gateways.push({ gateway: linkName, status: statusText.toUpperCase() });
            continue;
          }

          const statusElement = await row.$("td[class^='bg-']");
          if (statusElement) {
            const statusText = await statusElement.innerText();
            pfsenseData.gateways.push({ gateway: linkName, status: statusText.toUpperCase() });
          } else {
            pfsenseData.gateways.push({ gateway: linkName, status: "UNKNOWN STATUS" });
          }

        } catch (error) {
          console.log("Error checking a gateway row:", error);
        }
      }

      result.push(pfsenseData); 
      break;
    }
  }
}

function linksti() {
  runPlaywrightScript();

  setInterval(() => {
    runPlaywrightScript();
  }, 1 * 30 * 60 * 1000);
}

module.exports.linksti = linksti