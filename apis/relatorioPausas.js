const { chromium } = require('playwright');
const path = require('path');

const tirarRelatorio = async () => {
    try {
        console.log("Iniciando aplicação...");
        console.log("Acessando os PBX");
        const browser = await chromium.launch();
        const context = await browser.newContext({ ignoreHTTPSErrors: true, acceptDownloads: true });
        const page = await context.newPage()

        console.log(`Acessando: https://serasa.itscs.com.br/suite/`);
        await page.goto('https://serasa.itscs.com.br/suite/');

        console.log('Tentando realizar login...');
        await page.getByPlaceholder('Usuário').fill('julio.bueno');
        await page.getByPlaceholder('Senha').fill('Itscs@135');
        await page.locator('#login').click();
        console.log('Logado com sucesso!')

        await page.locator(`tbody tr:has(td:has-text("SERASA"))`).click();
        await page.waitForTimeout(1000);

        await page.locator('span', { hasText: 'Relatórios' }).click();
        await page.locator('div .sub', { hasText: 'Ações dos Operadores' }).click();
        await page.waitForTimeout(1000);

        await page.locator('input[value="Filtrar"]').click();
        await page.waitForTimeout(1000);

        await page.getByRole('button', { name: 'Exportar' }).click();
        await page.waitForTimeout(500);
        await page.locator('#tipo_arquivo').selectOption('csv');

        await page.locator('#btn_exportar_arquivo').click();

        const download = await page.waitForEvent('download');
        const suggestedFilename = download.suggestedFilename();
        const safeFilename = path.basename(suggestedFilename, path.extname(suggestedFilename)) + '.csv';
        const savePath = path.join('./reports', safeFilename);

        await download.saveAs(savePath);
        console.log(`Arquivo salvo em: ${savePath}`);

        console.log("Exportação concluída");

        console.log("Exportação concluída");
        console.log('Finalizando tarefas...');
        await context.close();
        await browser.close();
        console.log('Programa finalizado.');
        return safeFilename;
    } catch (error) {
        console.error("Erro na execução do script:", error);
        return { success: false, message: "Erro ao executar o script" };
    }
}
module.exports.tirarRelatorio = tirarRelatorio;