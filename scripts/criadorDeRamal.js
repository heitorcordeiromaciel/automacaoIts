const { webkit } = require('playwright');
const readline = require('readline');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const askQuestion = (query) => {
	return new Promise((resolve) => {
		console.log(query);
		rl.question(' ', (answer) => {
			resolve(answer.trim());
		});
	});
};

const info = async () => {
	console.log("Iniciando perguntas...");
	const issabel = await askQuestion('Qual o IP do Issabel para serem criados os ramais? ');
	const username = await askQuestion('Digite o usuário para login: ');
	const password = await askQuestion('Digite a senha para login: ');
	const ramalStart = await askQuestion('Qual o ramal de início a ser criado? ');
	const ramalEnd = await askQuestion('Qual o ramal final a ser criado? ');

	console.log(`Confirmação: Criando ramais de ${ramalStart} até ${ramalEnd} no PBX de IP ${issabel}`);

	rl.close();
	return { issabel, ramalStart, ramalEnd, username, password };
};

(async () => {
	console.log("Iniciando aplicação...");
	const { issabel, ramalStart, ramalEnd, username, password } = await info();

	console.log("Tentando acessar o Issabel...");
	const browser = await webkit.launch();
	const context = await browser.newContext({ ignoreHTTPSErrors: true });
	const page = await context.newPage()
	console.log(`Acessando: https://${issabel}`);
	await page.goto(`https://${issabel}`).then(console.log('Acesso concedido.'));
	console.log('Tentando realizar login...');
	await page.getByPlaceholder('Usuário').fill(username);
	await page.getByPlaceholder('Senha').fill(password);
	await page.getByRole('button', { name: /Enviar/i }).click()
		.then(console.log('Logado com sucesso!'));
	try {
		await page.locator('.neo-modal-issabel-popup-close').click();
	} catch (e) {
		console.log('Nenhum pop-up encontrado.');
	}
	console.log('Acessando configurações do PBX');
	await page.locator('[href="index.php?menu=pbxconfig"]').click();
	await page.waitForTimeout(1000);
	await page.getByRole('link', { name: 'Configurações do PBX' }).click();
	await page.getByRole('link', { name: 'Ramais' }).click();
	await page.waitForTimeout(2000);

	console.log('Começando a criação de ramais.');
	console.log('Criando ramais...');
	for (let ramal = ramalStart; ramal <= ramalEnd; ramal++) {
		console.log(`Verificando se o ramal ${ramal} já existe...`);

		const ramalExists = await page.isVisible(`[href="config.php?type=setup&display=extensions&extdisplay=${ramal}"]`);

		if (ramalExists === true) {
			console.log(`Ramal ${ramal} já existe. Pulando...`);
			continue;
		} else if (ramalExists === false) {
			console.log(`Criando ramal ${ramal}...`);

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

			console.log('Adicionando AccountCode');
			await page.getByRole('link', { name: `${ramal}` }).click();

			await page.waitForTimeout(2000);
			await page.locator('#devinfo_accountcode').fill('MANUAL');

			console.log(`Salvando ramal ${ramal}...`);
			await page.getByRole('button', { name: 'Aplicar' }).click();
			await page.waitForTimeout(1000);
			await page.locator('#button_reload').click();
			console.log(`Ramal ${ramal} criado com sucesso.`);
		};
	};

	console.log('Finalizando tarefas...');
	await context.close();
	await browser.close();
	console.log('Programa finalizado.');
	process.exit(0);
})();
