require('dotenv').config({ path:'/.env' });
const express = require('express');
const path = require('path');
const fs = require('fs');
const { restartVpn } = require('./public/src/modules/vpnBlumenau');
const { linksti } = require('./public/src/modules/linksTi');
const { addCampaign } = require('./public/src/modules/addCampaign');
const { tirarRelatorio } = require('./public/src/modules/relatorioPausas');
const { restartFiesc } = require('./public/src/modules/troncoFiesc');
const { clearVoicemail } = require('./public/src/modules/clearVoicemail');
const { getLastRamal } = require('./public/src/modules/getLastRamal');
const { criaRamal } = require('./public/src/modules/criadorDeRamal');
const logger = require('./public/src/helpers/logger');
const { clear } = require('console');

const app = express();
const router = express.Router();
const ip = process.env.SERVER_IP;
const port = process.env.SERVER_PORT;
let latestFilename = '';

app.use(express.json());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.get('/dashboard', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/ramal', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'ramal.html'));
});

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

app.get('/restart-fiesc', async (req, res) => {
	const result = await restartFiesc();
	res.json(result);
})

app.get('/clear-voicemail', async (req, res) => {
	const result = await clearVoicemail();
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
	};

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

app.post('/api/ramais', async (req, res) => {
	const { ip, username, password } = req.body;
	console.log("Requisição recebida com:", req.body);
	try {
		const ramais = await getLastRamal(ip, username, password);
		res.json({ success: true, ramais });
	} catch (err) {
		res.status(500).json({ success: false, message: "Erro ao buscar ramal." });
	}
});

app.post('/api/criar-ramal', async (req, res) => {
	const { issabel, ramalStart, ramalEnd } = req.body;
	console.log("Requisição recebida com:", req.body);
	try {
		const { success, message } = await criaRamal(issabel, ramalStart, ramalEnd);
		return res.json({ success, message });
	} catch (err) {
		console.log(err);
		return res.status(500).json({ success: false, message: `${err}` });
	}
});

app.get('/logs', (req, res) => {
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.flushHeaders();

	logger.addSubscriber(res);
});

app.listen(port, ip, () => {
	console.log(`Servidor rodando em http://${ip}:${port}`);
	console.log(`Chame http://${ip}:${port}/restart-vpn para reiniciar a vpn de Blumenau`);
	console.log(`Chame http://${ip}:${port}/add-campaign para adicionar campanha para todos os operadores`);
	console.log(`Chame http://${ip}:${port}/download-report para extrair o relatório de pausas`);
	linksti();
});
