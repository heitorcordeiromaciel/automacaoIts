const { webkit } = require('playwright');
const colors = require('chalk');

const dados = [
    {
        pfsense: "** PFSENSE SEDE **",
        url: "https://192.168.1.1/"
    },
    {
        pfsense: "** SEDE AUXCC **",
        url: "https://10.100.20.1/"
    },
    {
        pfsense: "** SANTOS **",
        url: "https://10.70.20.1/"
    },
    {
        pfsense: "** PRODEMGE **",
        url: "https://10.70.40.1/"
    },
    {
        pfsense: "** BARRA FUNDA **",
        url: "https://192.168.50.1/"
    },
    {
        pfsense: "** IBAMA **",
        url: "https://10.70.30.1/"
    },
    {
        pfsense: "** CAGECE **",
        url: "https://10.70.10.1/"
    },
    {
        pfsense: "** CAMPINAS **",
        url: "https://192.168.10.1/"
    }
];

(async () => {
    const browser = await webkit.launch();
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
	const page = await context.newPage()

    for (const dado of dados) {
        console.log(colors.cyan(dado.pfsense));

        try {
            await page.goto(dado.url);
        } catch (error) {
            console.log(colors.red('PFSENSE OFFLINE'));
            continue;
        };

        await page.getByPlaceholder('Username').fill('julio');
        await page.getByPlaceholder('Password').fill('imperatriz@135');
        await page.locator('input[name="login"]').click()
        
        await page.waitForTimeout(2000);
        await checkStatus(page);
    };

    await browser.close();
})();

async function checkStatus(page) {
    const tbodyElement = await page.$('tbody[id^="gateways-"]');
    if (!tbodyElement) {
        console.log("No gateways table found.");
        return;
    };

    const tbodyId = await tbodyElement.evaluate(el => el.id);

    const rows = await page.$$(`#${tbodyId} > tr`);
    if (rows.length === 0) {
        console.log("No gateways found.");
        return;
    };

    for (let row of rows) {
        try {
            const linkName = await row.$eval('td[title=""], td[title="Default gateway"]', el => el.innerText.trim());

            const onlineStatus = await row.$('.bg-success');
            if (onlineStatus) {
                const statusText = await onlineStatus.evaluate(el => el.innerText);
                console.log(`${linkName}: ${colors.green(statusText.toUpperCase())}`);
                continue;
            };

            const statusElement = await row.$("td[class^='bg-']");
            if (statusElement) {
                const statusText = await statusElement.evaluate(el => el.innerText);
                console.log(`${linkName}: ${colors.red(statusText.toUpperCase())}`);
            } else {
                console.log(`${linkName}: ${colors.yellow("UNKNOWN STATUS")}`);
            };

        } catch (error) {
            console.log("Error checking a gateway row:", error);
        };
    };
};