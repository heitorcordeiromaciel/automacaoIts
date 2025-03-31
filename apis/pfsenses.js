const { run } = require('node:test');
const { webkit } = require('playwright');

const runBackup = async () => {
    try {
        console.log("Iniciando aplicação...");
        const dataOntem = new Date();
        dataOntem.setDate(dataOntem.getDate());
        const dataOntemStr = dataOntem.toISOString().split('T')[0];
        console.log("Acessando os pFsenses");
        const browser = await webkit.launch();
        const context = await browser.newContext({ ignoreHTTPSErrors: true });
        const page = await context.newPage()
        const backupPfsense = async (ip) => {
            console.log(`Acessando: ${ip}`);
            await page.goto(ip);
            console.log('Tentando realizar login...');
            await page.getByPlaceholder('Username').fill('julio');
            await page.getByPlaceholder('Password').fill('imperatriz@135');
            await page.locator('input[name="login"]').click()
                .then(console.log('Logado com sucesso!'));
            await page.getByRole('button', { name: 'Diagnostics' }).click();
            console.log('Realizando backup das configurações do pFsense');
            await page.getByRole('link', { name: 'Backup & Restore' }).click();

            const downloadPromise = page.waitForEvent('download');
            await page.locator('button[value="Download configuration as XML"]').click();
            const download = await downloadPromise;
            console.log('Backup concluido');

            await download.saveAs(`\\\\192.168.1.31\\backup-4t\\BACKUP-PFSENSE-2024\\2025\\${dataOntemStr}\\` + download.suggestedFilename());

        }
        await backupPfsense('https://192.168.1.1');
        await backupPfsense('https://10.100.20.1');
        await backupPfsense('https://10.70.20.1');
        await backupPfsense('https://10.70.30.1');
        await backupPfsense('https://10.70.40.1');
        await backupPfsense('https://192.168.50.1');
        await backupPfsense('https://10.70.10.1');
        await backupPfsense('https://192.168.10.1');
        await backupPfsense('https://10.70.13.1');
        console.log('Todos os backups concluidos');

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

module.exports.runBackup = runBackup;