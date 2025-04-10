const { webkit } = require('playwright');
const logger = require('./../helpers/logger');

const clearVoicemail = async () => {
    try {
        logger.log("Iniciando aplicação...");
        logger.log("Tentando acessar o Issabel...");
        const browser = await webkit.launch();
        const context = await browser.newContext({ ignoreHTTPSErrors: true });
        const page = await context.newPage()
        logger.log(`Acessando: https://10.70.40.250`);
        await page.goto(`https://10.70.40.250`)
        logger.log('Acesso concedido.');
        logger.log('Tentando realizar login...');
        await page.getByPlaceholder('Usuário').fill('admin');
        await page.getByPlaceholder('Senha').fill('Imp3r@tr1z');
        await page.getByRole('button', { name: /Enviar/i }).click()
        logger.log('Logado com sucesso!');
        logger.log('Acessando configurações do PBX');
        await page.locator('[href="index.php?menu=pbxconfig"]').click();
        await page.waitForTimeout(1000);
        await page.getByRole('link', { name: 'Configurações do PBX' }).click();
        await page.getByRole('link', { name: 'Voicemail Admin' }).click();
        await page.waitForTimeout(2000);
        await page.locator('#del_msgs').click();
        logger.log('Removendo mensagens...');
        await page.waitForTimeout(1000);
        await page.locator('#action').click();
        logger.log('Finalizando tarefas...');
        await context.close();
        await browser.close();
        logger.log('Programa finalizado.');

        return { success: true, message: "Script executado com sucesso" };
    } catch (error) {
        console.error("Erro na execução do script:", error);
        return { success: false, message: "Erro ao executar o script" };
    }
}

module.exports.clearVoicemail = clearVoicemail;