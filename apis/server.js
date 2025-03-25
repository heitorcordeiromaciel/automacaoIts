const express = require('express');
const path = require('path');
const fs = require('fs');
const { restartVpn } = require('./vpnBlumenau');
const { linksti } = require('./linksTi');
const { addCampaign } = require('./addCampaign');
const { tirarRelatorio } = require('./relatorioPausas');

const app = express();
const port = 80;
const ip = '192.168.1.170';
let latestFilename = '';

app.use(express.static('public'));
app.get('/gateway_status', (req, res) => {
  res.sendFile(__dirname + '/gateway_status.json');
});

app.get('/restart-vpn', async (req, res) => {
  const result = await restartVpn();
  res.json(result);
});

app.get('/add-campaign', async (req, res) => {
  const result = await addCampaign();
  res.json(result);
})

app.get('/run-report', async (req, res) => {
  try {
      latestFilename = await tirarRelatorio();
      res.send(`Report generated successfully! Filename: ${latestFilename}`);
  } catch (error) {
      res.status(500).send('Error generating report: ' + error.message);
  }
});

app.get('/download-report', async (req, res) => {
  let latestFilename;
  try {
      latestFilename = await tirarRelatorio();
  } catch (error) {
      return res.status(500).send('Error generating report: ' + error.message);
  }

  const reportPath = path.join(__dirname, 'reports', latestFilename);
  console.log('Generated report at: ', reportPath);

  if (!fs.existsSync(reportPath)) {
      return res.status(404).send('Report file not found.');
  }

  res.download(reportPath, latestFilename, async (err) => {
      if (err) {
          return res.status(500).send('Error downloading the file: ' + err.message);
      }

      try {
          console.log(`Deleting file: ${reportPath}`);
          await fs.promises.unlink(reportPath);
          console.log('File deleted successfully');
      } catch (deleteErr) {
          console.error('Error deleting file:', deleteErr);
      }
  });
});

app.listen(port, ip, () => {
  console.log(`Servidor rodando em http://${ip}:${port}`);
  console.log(`Chame http://${ip}:${port}/restart-vpn para reiniciar a vpn de Blumenau`);
  console.log(`Chame http://${ip}:${port}/add-campaign para adicionar campanha para todos os operadores`);
  console.log(`Chame http://${ip}:${port}/download-report para extrair o relatório de pausas`);
  linksti();
});