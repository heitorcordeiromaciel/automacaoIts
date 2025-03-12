# Compilado de scripts de automação para a equipe de TI da ITS
- Criador de ramal automatico para PBX Issabel
- Script de cadastro de callback automatico (em desenvolvimento)
- Scripts ja existentes serão enviados ao repositório conforme eu for encontrando eles

# Instalação

- instalar o NVM for Windows [aqui](https://github.com/coreybutler/nvm-windows/releases/download/1.2.2/nvm-setup.exe)

instalar o node e npm
```
nvm install latest
```
  ativar o node
```
nvm use latest
```
  clone este repositório com https ou ssh
  (alternativamente pode fazer o download do repositório compactado e extrair, se feito dessa maneira é necessario realizar o download novamente a cada release novo)

  navegue até a pasta do repositório e instale as dependências
```
npm install
```
  instale os navegadores do playwright
```
npx playwright install
```
# Utilização

_**para os scripts relacionados a Issabel, primeiro configure o idioma do Issabel para Português (Brasil)**_

- Criador de Ramal

na pasta clonada utilize
```
node ./scripts/criadorDeRamal.js
```
informe IP, usuario, senha, Ramal a se começar e Ramal onde terminar a criação, o script irá realizar a criação automaticamente, pulando ramais que ja existam para evitar erros.

- Script de cadastro de Callback
```
node ./scripts/cadastroCallback.js
```

será necessario fornecer um arquivo chamado callback.csv, coloque-o em `scripts/import`, o arquivo deve estar com a seguinte estrutura:
```
Nome,Ramal
Exemplo1,200
Exemplo2,201
```

o script irá iterar pelas linhas do arquivo criando o callback e atribuindo o ramal ao nome, a senha será sempre a mesma que o ramal.
