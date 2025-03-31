const { webkit } = require('playwright');

const clearVoicemail = async () => {
    try {
        console.log("Iniciando aplicação...");
        console.log("Tentando acessar o Issabel...");
        const browser = await webkit.launch();
        const context = await browser.newContext({ ignoreHTTPSErrors: true });
        const page = await context.newPage()
        console.log(`Acessando: https://10.70.40.250`);
        await page.goto(`https://10.70.40.250`).then(console.log('Acesso concedido.'));
        console.log('Tentando realizar login...');
        await page.getByPlaceholder('Usuário').fill('admin');
        await page.getByPlaceholder('Senha').fill('Imp3r@tr1z');
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
        await page.getByRole('link', { name: 'Voicemail Admin' }).click();
        await page.waitForTimeout(2000);
        await page.locator('#del_msgs').click();
        console.log('Removendo mensagens...');
        await page.waitForTimeout(1000);
        await page.locator('#action').click();
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

module.exports.clearVoicemail = clearVoicemail;