const express = require('express');
const { webkit } = require('playwright');

const app = express();
const PORT = 8080;

async function runScript() {
    try {
        console.log("Iniciando aplicação...");
        const browser = await webkit.launch();
        const context = await browser.newContext({ ignoreHTTPSErrors: true });
        const page = await context.newPage();

        console.log("Acessando os pFsenses...");
        await page.goto('https://192.168.1.1');

        await page.getByPlaceholder('Username').fill('julio');
        await page.getByPlaceholder('Password').fill('imperatriz@135');
        await page.locator('input[name="login"]').click();
        console.log('Logado com sucesso!');

        await page.getByRole('button', { name: 'Status' }).click();
        console.log('Reiniciando IPsec Blumenau...');
        await page.locator('[href="/status_ipsec.php"]').click();
        await page.waitForTimeout(500);

        page.on('dialog', dialog => dialog.accept());

        const rowLocator = page.locator(`tbody#ipsec-body tr:has(td:nth-child(2):text("SERASA-ALGAR"))`);
        await rowLocator.locator('a[title="Disconnect P1"]').click();
        console.log('VPN Reiniciada');

        console.log('Finalizando tarefas...');
        await context.close();
        await browser.close();
        console.log('Programa finalizado.');

        return { success: true, message: "Script executado com sucesso" };
    } catch (error) {
        console.error("Erro na execução do script:", error);
        return { success: false, message: "Erro ao executar o script" };
    }
}

app.get('/run-script', async (req, res) => {
    const result = await runScript();
    res.json(result);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Chame http://localhost:${PORT}/run-script para rodar o script`);
});