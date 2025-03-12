const { webkit } = require('playwright');
const colors = require('chalk');
const fs = require('fs');

const dados = [
	{ pfsense: "PFSENSE SEDE", url: "https://192.168.1.1/" },
	{ pfsense: "SEDE AUXCC", url: "https://10.100.20.1/" },
	{ pfsense: "SANTOS", url: "https://10.70.20.1/" },
	{ pfsense: "PRODEMGE", url: "https://10.70.40.1/" },
	{ pfsense: "BARRA FUNDA", url: "https://192.168.50.1/" },
	{ pfsense: "IBAMA", url: "https://10.70.30.1/" },
	{ pfsense: "CAGECE", url: "https://10.70.10.1/" },
	{ pfsense: "CAMPINAS", url: "https://192.168.10.1/" }
];

// Object to store structured data
let outputData = {};

(async () => {
	const browser = await webkit.launch();
	const context = await browser.newContext({ ignoreHTTPSErrors: true });
	const page = await context.newPage();

	for (const dado of dados) {
		console.log(colors.cyan(dado.pfsense));

		try {
			await page.goto(dado.url);
		} catch (error) {
			console.log(colors.red('PFSENSE OFFLINE'));
			outputData[dado.pfsense] = { status: "OFFLINE", gateways: {} };
			continue;
		}

		await page.getByPlaceholder('Username').fill('julio');
		await page.getByPlaceholder('Password').fill('imperatriz@135');
		await page.locator('input[name="login"]').click();
		await page.waitForTimeout(2000);

		outputData[dado.pfsense] = { status: "ONLINE", gateways: {} };
		await checkStatus(page, outputData[dado.pfsense].gateways);
	}

	// Save structured data to JSON file
	fs.writeFileSync("gateway_status.json", JSON.stringify(outputData, null, 2));
	console.log(colors.yellow("Status saved to gateway_status.json"));

	await browser.close();
})();

async function checkStatus(page, gatewayData) {
	for (let i = 0; i < 5; i++) {
		const rows = await page.$$(`#gateways-${i}-gwtblbody > tr`);

		if (rows.length > 0) {
			for (let row of rows) {
				try {
					const linkName = await row.$eval('td[title=""], td[title="Default gateway"]', el => el.innerText.trim());

					const onlineStatus = await row.$('.bg-success');
					if (onlineStatus) {
						const statusText = await onlineStatus.innerText();
						console.log(`${linkName}: ${colors.green(statusText.toUpperCase())}`);
						gatewayData[linkName] = statusText.toUpperCase();
						continue;
					}

					const statusElement = await row.$("td[class^='bg-']");
					if (statusElement) {
						const statusText = await statusElement.innerText();
						console.log(`${linkName}: ${colors.red(statusText.toUpperCase())}`);
						gatewayData[linkName] = statusText.toUpperCase();
					} else {
						console.log(`${linkName}: ${colors.yellow("UNKNOWN STATUS")}`);
						gatewayData[linkName] = "UNKNOWN STATUS";
					}
				} catch (error) {
					console.log("Error checking a gateway row:", error);
				}
			}
			break;
		}
	}
}