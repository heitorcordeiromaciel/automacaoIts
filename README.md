# Compilado de scripts de automação para a equipe de TI da ITS
- Criador de ramal automatico para PBX Issabel


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

  navegue até a pasta do repositório e instale as dependências
```
npm install
```
  instale os navegadores do playwright
```
npx playwright install
```
# Utilização

- para os scripts relacionados a Issabel, primeiro configure o idioma do Issabel para Português (Brasil)

na pasta clonada utilize
```
node ./scripts/nomedoscript.js
```
