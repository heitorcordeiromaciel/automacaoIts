const { chromium } = require('playwright');
const credentials = require('../credentials.json');
const logger = require('./../helpers/logger');

const getLastRamal = async (issabelIP) => {

  const { username, password } = credentials[issabelIP] || {};

  if (!username || !password) {
    return { success: false, message: 'Credenciais não encontradas para este Issabel.' };
  }
  const browser = await chromium.launch();
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  try {
    logger.log(`Acessando: https://${issabelIP}`);
    await page.goto(`https://${issabelIP}`);
    await page.getByPlaceholder('Usuário').fill(username);
    await page.getByPlaceholder('Senha').fill(password);
    await page.getByRole('button', { name: /Enviar/i }).click();

    logger.log('Logado com sucesso!');

    if ((issabel !== '192.168.1.60') && (issabel !== '10.70.40.250')) {
      try {
        await page.locator('.neo-modal-issabel-popup-close').click();
        logger.log('popup fechado');
      } catch (e) {
        logger.log('nenhum popup');
      }
    };
    logger.log('Compilando lista de Ramais...');
    await page.locator('[href="index.php?menu=pbxconfig"]').click();
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: 'Configurações do PBX' }).click();
    await page.getByRole('link', { name: 'Ramais' }).click();
    await page.waitForTimeout(1000);

    const extensionTexts = await page.locator('a[href*="extdisplay="]').allTextContents();

    const ramais = extensionTexts.map(txt => {
      const match = txt.match(/<(\d+)>/);
      return match ? parseInt(match[1]) : null;
    }).filter(n => n !== null);

    await context.close();
    await browser.close();
    return ramais || null;
  } catch (err) {
    await browser.close();
    throw err;
  }
};
module.exports.getLastRamal = getLastRamal;