const express = require('express');
const { restartVpn } = require('./vpnBlumenau');
const { linksti } = require('./linksTi');
const { addCampaign } = require('./addCampaign');

const app = express();
const port = 80;
const ip = 'setyourip';

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

app.listen(port, ip, () => {
  console.log(`Servidor rodando em http://${ip}:${port}`);
  console.log(`Chame http://${ip}:${port}/restart-vpn para reiniciar a vpn de Blumenau`);
  console.log(`Chame http://${ip}:${port}/add-campaign para adicionar campanha para todos os operadores`);
  linksti();
});