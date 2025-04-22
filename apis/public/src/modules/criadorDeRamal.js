const { chromium } = require('playwright');
const credentials = require('./../data/credentials.json');
const logger = require('./../helpers/logger');

const criaRamal = async (issabel, ramalStart, ramalEnd) => {

	const { username, password } = credentials[issabel] || {};

	if (!username || !password) {
		return { success: false, message: 'Credenciais não encontradas para este Issabel.' };
	}

	logger.log("Iniciando aplicação...");
	const browser = await chromium.launch();
	const context = await browser.newContext({ ignoreHTTPSErrors: true });
	const page = await context.newPage()

	try {
		logger.log("Tentando acessar o Issabel...");
		logger.log(`Acessando: https://${issabel}`);
		await page.goto(`https://${issabel}`).then(logger.log('Acesso concedido.'));
		logger.log('Tentando realizar login...');
		await page.getByPlaceholder('Usuário').fill(username);
		await page.getByPlaceholder('Senha').fill(password);
		await page.getByRole('button', { name: /Enviar/i }).click();
		logger.log('Logado com sucesso!');
		if ((issabel !== '192.168.1.60') && (issabel !== '10.70.40.250')) {
			try {
				await page.locator('.neo-modal-issabel-popup-close').click();
				logger.log('popup fechado');
			} catch (e) {
				logger.log('nenhum popup');
			}
		};
		logger.log('Acessando configurações do PBX');
		await page.locator('[href="index.php?menu=pbxconfig"]').click();
		await page.waitForTimeout(1000);
		await page.getByRole('link', { name: 'Configurações do PBX' }).click();
		await page.getByRole('link', { name: 'Ramais' }).click();
		logger.log('Começando a criação de ramais.');
		await page.waitForTimeout(2000);

		logger.log('Criando ramais...');
		for (let ramal = ramalStart; ramal <= ramalEnd; ramal++) {
			logger.log(`Verificando se o ramal ${ramal} já existe...`);

			const ramalExists = await page.isVisible(`[href="config.php?type=setup&display=extensions&extdisplay=${ramal}"]`);

			if (ramalExists === true) {
				logger.log(`Ramal ${ramal} já existe. Pulando...`);
				continue;
			} else if (ramalExists === false) {
				logger.log(`Criando ramal ${ramal}...`);

				await page.getByRole('link', { name: 'Adicionar Ramal' }).click();
				await page.waitForTimeout(1000);

				await page.getByRole('button', { name: 'Aplicar' }).click();
				await page.waitForTimeout(2000);

				await page.locator('#extension').fill(String(ramal));

				await page.locator('#name').fill(String(ramal));

				const clrPass = await page.locator('#devinfo_secret');
				clrPass.fill('');
				clrPass.fill('123456ab');

				await page.locator('#devinfo_nat').selectOption({ value: 'yes' });
				await page.getByRole('button', { name: 'Sempre' }).first().click();
				await page.getByRole('button', { name: 'Sempre' }).nth(1).click();
				await page.getByRole('button', { name: 'Sempre' }).nth(2).click();
				await page.getByRole('button', { name: 'Sempre' }).nth(3).click();

				await page.getByRole('button', { name: 'Aplicar' }).click();

				await page.waitForTimeout(2000);

				logger.log('Adicionando AccountCode');
				await page.getByRole('link', { name: `${ramal}` }).click();

				await page.waitForTimeout(2000);
				await page.locator('#devinfo_accountcode').fill('MANUAL');

				logger.log(`Salvando ramal ${ramal}...`);
				await page.getByRole('button', { name: 'Aplicar' }).click();
				await page.waitForTimeout(1000);
				await page.locator('#button_reload').click();
				logger.log(`Ramal ${ramal} criado com sucesso.`);
			};
		};

		logger.log('Finalizando tarefas...');
		await context.close();
		await browser.close();
		logger.log('Programa finalizado.');
		return { success: true, message: 'Ramais criados com sucesso' }
	} catch (e) {
		await context.close();
		await browser.close();
		return { success: false, message: 'Ocorreu um erro durante a criação de ramal', e }
	}
}

module.exports.criaRamal = criaRamal;