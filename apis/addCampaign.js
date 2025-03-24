const { webkit } = require('playwright');

const addCampaign = async () => {
    try {
        const browser = await webkit.launch();
        const context = await browser.newContext({ ignoreHTTPSErrors: true });
        const page = await context.newPage();

        await page.goto('https://serasa.itscs.com.br/suite/');

        await page.getByPlaceholder('Usuário').fill('julio.bueno');
        await page.getByPlaceholder('Senha').fill('Itscs@135');
        await page.locator('#login').click();
        await page.waitForTimeout(1000);

        await page.locator(`tbody tr:has(td:has-text("SERASA"))`).click();
        await page.waitForTimeout(1000);
        const rowLocator = page.locator('tbody tr:has(td:has-text("DISCAGEM MANUAL"))');
        await rowLocator.locator('[href^="campanha.php?action=Editar&id="]').click();
        await page.waitForTimeout(1000);
        await page.locator('#todos_agentes .checkmark').click();
        await page.locator('#btn_adicionar').click();
        await page.getByRole('button', { name: 'Salvar' }).click();
        await page.waitForTimeout(500);

        await browser.close();
    } catch (e) {
        throw e;
    }
}

module.exports.addCampaign = addCampaign;