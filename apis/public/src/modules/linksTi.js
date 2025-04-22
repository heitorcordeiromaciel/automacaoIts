require('dotenv').config({ path: '/.env' });
const { chromium } = require('playwright');
const dados = require('./../data/gateways.json');
const fs = require('fs');
const colors = require('chalk');

const username = process.env.PFSENSE_LOGIN;
const password = process.env.PFSENSE_PASS;
const gatewayStatus = [];

async function loginToPfSense(page, url, pfsenseName) {
	try {
		await page.goto(url);
		await page.getByPlaceholder('Username').fill(username);
		await page.getByPlaceholder('Password').fill(password);
		await page.locator('input[name="login"]').click();
		await page.waitForTimeout(2000);
		console.log(colors.green(`[${pfsenseName}] Login realizado com sucesso.`));
		return true;
	} catch (err) {
		console.log(colors.red(`[${pfsenseName}] Falha ao logar: ${err.message}`));
		return false;
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
					console.log(colors.yellow(`Erro ao ler linha em ${pfsenseName}: ${error.message}`));
				}
			}

			return gateways;
		}
	}

	return [];
}

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
			console.log(colors.cyan(`Conectando ao ${dado.pfsense}`));
			const loginSuccess = await loginToPfSense(page, dado.url, dado.pfsense);
			if (!loginSuccess) continue;

			setInterval(async () => {
				try {
					await page.reload({ waitUntil: 'domcontentloaded' });
					await page.waitForTimeout(1000);

					const loginFieldVisible = await page.getByPlaceholder('Username').isVisible().catch(() => false);
					if (loginFieldVisible) {
						console.log(colors.yellow(`[${dado.pfsense}] Sessão expirada. Reautenticando...`));
						await loginToPfSense(page, dado.url, dado.pfsense);
						return;
					}

					const updatedGateways = await fetchGatewayStatus(page, dado.pfsense);

					const index = gatewayStatus.findIndex(g => g.pfsense === dado.pfsense);
					if (index !== -1) {
						gatewayStatus[index].gateways = updatedGateways;
					}

					fs.writeFileSync('gateway_status.json', JSON.stringify(gatewayStatus, null, 2));
					console.log(colors.green(`Status atualizado para ${dado.pfsense}`));
				} catch (err) {
					console.log(colors.red(`[${dado.pfsense}] Erro ao atualizar: ${err.message}`));
				}
			}, 30 * 1000);

		} catch (err) {
			console.log(colors.red(`Falha ao conectar ao ${dado.pfsense}: ${err.message}`));
		}
	}
}

function linksti() {
	monitorGateways();
}

module.exports.linksti = linksti;
