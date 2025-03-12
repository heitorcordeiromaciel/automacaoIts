const { webkit } = require('playwright');
const fs = require('fs');
const colors = require('chalk');
const { exec } = require('child_process');

// Define your data (the same structure as before)
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

// Function to run the Playwright script
async function runPlaywrightScript() {
  const browser = await webkit.launch();
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
    await checkStatus(page, result, dado.pfsense);  // Pass the pfsense name
  }

  await browser.close();

  // Save the result as a JSON file
  fs.writeFileSync('gateway_status.json', JSON.stringify(result, null, 2));

  console.log('Updated gateway_status.json');
}

// Function to check gateway status
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

      result.push(pfsenseData);  // Add the pfsense data with its gateways
      break;
    }
  }
}

function scheduleScriptRun() {
  runPlaywrightScript();

  setInterval(() => {
    runPlaywrightScript();
  }, 2 * 60 * 60 * 1000);
}

const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.get('/gateway_status', (req, res) => {
  res.sendFile(__dirname + '/gateway_status.json');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  scheduleScriptRun();
});