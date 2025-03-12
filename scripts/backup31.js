const fs = require('fs');
const path = require('path');

async function verificarGravacoes(pastaBase) {
    const dataOntem = new Date();
    dataOntem.setDate(dataOntem.getDate() - 1);
    const dataOntemStr = dataOntem.toISOString().split('T')[0];

    const pastaAudio = path.join(pastaBase, 'AUDIOS');
    if (fs.existsSync(pastaAudio)) {
        const pastaAno = path.join(pastaAudio, '2025');
        if (fs.existsSync(pastaAno)) {
            const meses = fs.readdirSync(pastaAno);
            for (const mes of meses) {
                const caminhoMes = path.join(pastaAno, mes);
                if (fs.statSync(caminhoMes).isDirectory()) {
                    const dias = fs.readdirSync(caminhoMes);
                    for (const dia of dias) {
                        const caminhoDia = path.join(caminhoMes, dia);
                        if (fs.statSync(caminhoDia).isDirectory()) {
                            const dataModificacao = new Date(fs.statSync(caminhoDia).mtime).toISOString().split('T')[0];
                            if (dataModificacao === dataOntemStr) {
                                return "ok";
                            };
                        };
                    };
                };
            };
        };
    };
    return "sem gravações";
};

async function verificarBanco(pastaBase) {
    const dataOntem = new Date();
    dataOntem.setDate(dataOntem.getDate() - 1);
    const dataOntemStr = dataOntem.toLocaleDateString('pt-BR').split('/').join('-');

    const pastaBanco = path.join(pastaBase, 'BANCO');
    if (fs.existsSync(pastaBanco)) {
        const arquivosBanco = fs.readdirSync(pastaBanco);
        for (const arquivo of arquivosBanco) {
            if (arquivo.includes(dataOntemStr)) {
                const caminhoArquivo = path.join(pastaBanco, arquivo);
                const tamanhoArquivo = fs.statSync(caminhoArquivo).size;
                return tamanhoArquivo > 10240 ? 'ok' : 'off';
            };
        };
    };
    return 'sem backup banco';
};

const pastas = ["CEDAE-OUVIDORIA", "CEDAE-SAC", "DEREG", "CRO-BADESC-IPREVILLE", "PRODEMGE", "CESAMA", "ARTESP", "SANTANA-PARNAIBA", "CAGECE-252", "AGSUS", "SANASA", "JOAO-PESSOA", "FIESC"];

const caminhoPrincipal = "\\\\192.168.1.31\\black-4t";

(async () => {
    for (const pasta of pastas) {
        let caminhoPasta = path.join(caminhoPrincipal, pasta);
        if (pasta.includes('ARTESP')) {
            caminhoPasta = path.join(caminhoPasta, 'FINAL-80');
        }
        
        const resultado = await verificarGravacoes(caminhoPasta);
        const resultadoBanco = await verificarBanco(caminhoPasta);
        console.log(`Para a pasta ${pasta}: GRAVAÇÕES: ${resultado}; BANCO: ${resultadoBanco}`);
    }
})();
