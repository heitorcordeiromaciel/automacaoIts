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

const username = 'julio';
const password = 'imperatriz@135';
const gatewayStatus = [];

async function monitorGateways() {
	const browser = await chromium.launch();
	const context = await browser.newContext({ ignoreHTTPSErrors: true });

	for (const dado of dados) {
		const page = await context.newPage();
		const pfsenseData = {
			pfsense: dado.pfsense,
			gateways: []
		};
		gatewayStatus.push(pfsenseData);

		try {
			console.log(colors.cyan(`Connecting to ${dado.pfsense}`));
			await page.goto(dado.url);

			await page.getByPlaceholder('Username').fill(username);
			await page.getByPlaceholder('Password').fill(password);
			await page.locator('input[name="login"]').click();
			await page.waitForTimeout(2000);

			setInterval(async () => {
				const updatedGateways = await fetchGatewayStatus(page, dado.pfsense);
				const index = gatewayStatus.findIndex(g => g.pfsense === dado.pfsense);
				if (index !== -1) {
					gatewayStatus[index].gateways = updatedGateways;
				}

				fs.writeFileSync('gateway_status.json', JSON.stringify(gatewayStatus, null, 2));
				console.log(colors.green(`Updated ${dado.pfsense}`));

			}, 30 * 1000);

		} catch (err) {
			console.log(colors.red(`Failed to connect to ${dado.pfsense}: ${err.message}`));
		}
	}
}

async function fetchGatewayStatus(page, pfsenseName) {
	for (let i = 0; i < 5; i++) {
		const rows = await page.$$(`#gateways-${i}-gwtblbody > tr`);
		if (rows.length > 0) {
			const gateways = [];

			for (const row of rows) {
				try {
					const linkName = await row.$eval('td[title=""], td[title="Default gateway"]', el => el.innerText.trim());

					const onlineStatus = await row.$('.bg-success');
					if (onlineStatus) {
						const statusText = await onlineStatus.innerText();
						gateways.push({ gateway: linkName, status: statusText.toUpperCase() });
						continue;
					}

					const statusElement = await row.$("td[class^='bg-']");
					if (statusElement) {
						const statusText = await statusElement.innerText();
						gateways.push({ gateway: linkName, status: statusText.toUpperCase() });
					} else {
						gateways.push({ gateway: linkName, status: "UNKNOWN STATUS" });
					}
				} catch (error) {
					console.log(colors.yellow(`Error reading gateway row in ${pfsenseName}: ${error.message}`));
				}
			}

			return gateways;
		}
	}

	return [];
}

function linksti() {
	monitorGateways();
}


module.exports.linksti = linksti