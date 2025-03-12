const { webkit } = require('playwright');
const readline = require('readline');
const fs = require('fs');
const parse = require('papaparse');

function loadCSV(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`Arquivo CSV não encontrado! Por favor, adicione um arquivo "${filePath}" na pasta raiz.`);
        return null;
    }

    const csvData = fs.readFileSync(filePath, 'utf8');
    const parsedData = parse.parse(csvData, { header: true });

    if (parsedData.data.length === 0) {
        console.log(`O arquivo "${filePath}" está vazio. Adicione dados antes de continuar.`);
        return null;
    }

    return parsedData.data;
}

const csvFile = 'scripts/import/callback.csv';
const pbxExtensions = loadCSV(csvFile);

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
	const issabel = await askQuestion('Qual o IP do Issabel para cadastro do callback? ');
	const username = await askQuestion('Digite o usuário para login: ');
	const password = await askQuestion('Digite a senha para login: ');

	rl.close();
	return { issabel, username, password };
};

(async () => {
	console.log("Iniciando aplicação...");
    if (!pbxExtensions) {
        console.log('Nenhum dado carregado. Finalizando o script.');
        process.exit(1);
    } else {
        console.log('CSV carregado com sucesso!', pbxExtensions);
        const { issabel, username, password } = await info();

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
	};

	console.log('Acessando configurações do CallCenter');
	await page.locator('[href="index.php?menu=call_center"]').click();
	await page.waitForTimeout(1000);
	await page.getByRole('link', { name: 'Opções de Agente' }).click();
	await page.getByRole('link', { name: 'Ramais Callback' }).click();
	await page.waitForTimeout(2000);

	console.log('Começando o cadastro de callback.');
	console.log('Criando extensões de callback...');

	for (const entry of pbxExtensions) {
        console.log(`Atribuindo ramal ${entry.Ramal} ao usuário ${entry.Nome}`);
        await page.locator('button[name="?menu=cb_extensions&action=new_agent"]').click();
		await page.waitForTimeout(1000);
        await page.locator('#extension').selectOption({ value: `SIP/${entry.Ramal}`});
		await page.waitForTimeout(1000);
        await page.locator('#description').fill(`${entry.Nome}`);
		await page.waitForTimeout(1000);
        await page.locator('input[name="password1"]').fill(`${entry.Ramal}`);
		await page.waitForTimeout(1000);
        await page.locator('input[name="password2"]').fill(`${entry.Ramal}`);
        await page.waitForTimeout(1000);
        await page.locator('input[name="submit_save_agent"]').click();
        console.log('Salvando usuário');
		await page.waitForTimeout(5000);
	};

	console.log('Finalizando tarefas...');
	await context.close();
	await browser.close();
	console.log('Programa finalizado.');
	process.exit(0);
    };
})();
