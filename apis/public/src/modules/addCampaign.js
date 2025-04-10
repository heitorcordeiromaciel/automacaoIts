const { chromium } = require('playwright');
const logger = require('./../helpers/logger');

const addCampaign = async () => {
    try {
        const browser = await chromium.launch();
        const context = await browser.newContext({ ignoreHTTPSErrors: true });
        const page = await context.newPage();

        logger.log('Acessando Imperatriz Suite...');
        await page.goto('https://serasa.itscs.com.br/suite/');

        await page.locator('input[placeholder="Usuário"]').fill('julio.bueno');
        await page.locator('input[placeholder="Senha"]').fill('Itscs@135');
        await page.locator('#login').click();
        logger.log('Logado com sucesso!');
        await page.waitForTimeout(1000);
        
        logger.log('Adicionando campanha...');
        await page.locator(`tbody tr:has(td:has-text("SERASA"))`).click();
        await page.waitForTimeout(1000);
        const rowLocator = page.locator('tbody tr:has(td:has-text("DISCAGEM MANUAL"))');
        await rowLocator.locator('[href^="campanha.php?action=Editar&id="]').click();
        await page.waitForTimeout(1000);
        await page.locator('#todos_agentes .checkmark').click();
        await page.locator('#btn_adicionar').click();
        await page.getByRole('button', { name: 'Salvar' }).click();
        logger.log('Salvando...');
        await page.waitForTimeout(500);

        await browser.close();
        return { success: true, message: "Script executado com sucesso" };
    } catch (error) {
        console.error("Erro na execução do script:", error);
        return { success: false, message: "Erro ao executar o script" };
    }
}

module.exports.addCampaign = addCampaign;