const { chromium } = require('playwright');
const logger = require('./../helpers/logger');

async function restartVpn() {
	try {
		logger.log("Iniciando aplicação...");
		const browser = await chromium.launch();
		const context = await browser.newContext({ ignoreHTTPSErrors: true });
		const page = await context.newPage();

		logger.log("Acessando os pFsenses...");
		await page.goto('https://192.168.1.1');

		await page.getByPlaceholder('Username').fill('julio');
		await page.getByPlaceholder('Password').fill('imperatriz@135');
		await page.locator('input[name="login"]').click();
		logger.log('Logado com sucesso!');

		await page.getByRole('button', { name: 'Status' }).click();
		logger.log('Reiniciando IPsec Blumenau...');
		await page.locator('[href="/status_ipsec.php"]').click();
		await page.waitForTimeout(500);

		page.on('dialog', dialog => dialog.accept());

		const rowLocators = page.locator(`tbody#ipsec-body tr:has(td:nth-child(2):text("BLUMENAU"))`);

		const rowCount = await rowLocators.count();

		if (rowCount === 0) {
			logger.log('Nenhuma conexão VPN encontrada para BLUMENAU.');
		} else {
			logger.log(`Encontradas ${rowCount} conexões VPN para BLUMENAU. Reiniciando...`);
			for (let i = 0; i < rowCount; i++) {
				await rowLocators.nth(i).locator('a[title="Disconnect P1"]').click();
				logger.log(`Desconectado P1 da instância ${i + 1}`);
				await page.waitForTimeout(500);
			}
		}

		logger.log('Finalizando tarefas...');
		await context.close();
		await browser.close();
		logger.log('Programa finalizado.');

		return { success: true, message: "Script executado com sucesso" };
	} catch (error) {
		console.error("Erro na execução do script:", error);
		return { success: false, message: "Erro ao executar o script" };
	}
}

module.exports.restartVpn = restartVpn