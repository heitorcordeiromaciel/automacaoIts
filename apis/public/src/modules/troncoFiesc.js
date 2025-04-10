const { webkit } = require('playwright');
const logger = require('./../helpers/logger');

const restartFiesc = async () => {
	try {
		logger.log("Iniciando aplicação...");

		logger.log("Tentando acessar o Issabel...");
		const browser = await webkit.launch();
		const context = await browser.newContext({ ignoreHTTPSErrors: true });
		const page = await context.newPage()
		logger.log(`Acessando: https://192.168.1.59`);
		await page.goto(`https://192.168.1.59`)
		logger.log('Acesso concedido.');
		await page.getByPlaceholder('Usuário').fill('admin');
		await page.getByPlaceholder('Senha').fill('Imp3r@tr1z');
		await page.getByRole('button', { name: /Enviar/i }).click();
		logger.log('Logado com sucesso!');
		try {
			await page.locator('.neo-modal-issabel-popup-close').click();
		} catch (e) {
			logger.log('Nenhum pop-up encontrado.');
		}
		logger.log('Acessando configurações do PBX');
		await page.locator('[href="index.php?menu=pbxconfig"]').click();
		await page.waitForTimeout(1000);
		await page.getByRole('link', { name: 'Configurações do PBX' }).click();
		await page.getByRole('link', { name: 'Troncos' }).click();
		await page.waitForTimeout(2000);

		logger.log('Navegando até o Tronco.');
		logger.log('Desligando tronco...');
		await page.getByRole('link', { name: "FIESC_30090 (sip)" }).click();
		await page.waitForTimeout(2000);
		page.on('dialog', dialog => dialog.accept());
		await page.locator('#disabletrunk').click();
		await page.waitForTimeout(500);
		await page.getByRole('button', { name: 'Aplicar Alterações' }).click();
		await page.waitForTimeout(1000);
		await page.locator('#button_reload').click();
		logger.log(`Tronco desligado, Ligando novamente em 5 minutos.`);
		await page.waitForTimeout(5 * 60 * 1000);
		logger.log('Ligando tronco...');
		await page.locator('#disabletrunk').click();
		await page.waitForTimeout(500);
		await page.getByRole('button', { name: 'Aplicar Alterações' }).click();
		await page.waitForTimeout(1000);
		await page.locator('#button_reload').click();
		logger.log('Reinicialização do tronco concluida');

		logger.log('Finalizando tarefas...');
		await context.close();
		await browser.close();
		logger.log('Programa finalizado.');
		return { success: true, message: "Tronco reiniciado com sucesso" };
	} catch (error) {
		console.error("Erro na execução do script:", error);
		return { success: false, message: "Erro ao executar o script" };
	}
}

module.exports.restartFiesc = restartFiesc;