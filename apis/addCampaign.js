const { webkit } = require('playwright');

const addCampaign = async () => {
    try {
        const browser = await webkit.launch();
        const context = await browser.newContext({ ignoreHTTPSErrors: true });
        const page = await context.newPage();

        await page.goto('https://serasa.itscs.com.br/suite/');

        await page.locator('input[placeholder="Usuário"]').fill('julio.bueno');
        await page.locator('input[placeholder="Senha"]').fill('Itscs@135');
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
        return { success: true, message: "Script executado com sucesso" };
    } catch (error) {
        console.error("Erro na execução do script:", error);
        return { success: false, message: "Erro ao executar o script" };
    }
}

module.exports.addCampaign = addCampaign;