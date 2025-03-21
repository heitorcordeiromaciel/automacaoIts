const { webkit } = require('playwright');

(async () => {
    console.log("Iniciando aplicação...");
    const dataOntem = new Date();
    dataOntem.setDate(dataOntem.getDate());
    const dataOntemStr = dataOntem.toISOString().split('T')[0];
    console.log("Acessando os pFsenses");
    const browser = await webkit.launch();
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage()
    await page.goto('https://192.168.1.1');
    await page.getByPlaceholder('Username').fill('julio');
    await page.getByPlaceholder('Password').fill('imperatriz@135');
    await page.locator('input[name="login"]').click()
        .then(console.log('Logado com sucesso!'));
    await page.getByRole('button', { name: 'Status' }).click();
    console.log('Reiniciando IPsec Blumenau...');
    await page.locator('[href="/status_ipsec.php"]').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: './screenshots/test.png' });
    page.on('dialog', dialog => dialog.accept());
    const rowLocator = page.locator(`tbody#ipsec-body tr:has(td:nth-child(2):text("SERASA-ALGAR"))`);
    await rowLocator.locator('a[title="Disconnect P1"]').click();
    console.log('VPN Reiniciada');

    console.log('Finalizando tarefas...');
    await context.close();
    await browser.close();
    console.log('Programa finalizado.');
    process.exit(0);
})();
