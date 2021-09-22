const puppeteer = require("puppeteer");


(async ()=> {

    
    const browser = await puppeteer.launch();
    
    const page = await browser.newPage();
    await page.goto('https://teaching.brunel.ac.uk/teaching/SWS-2122/login.aspx');
    
    await page.type('[name=tUserName]', '1908906');
    await page.type('[name="tPassword"]', 'Katia1974');
    await page.click('[type=submit]');
    await page.waitForTimeout(4000)
    await page.click('a[id="LinkBtn_mystudentsettimetable"]')
    await page.waitForTimeout(4000)
    await page.click('[type=submit]');
    await page.waitForTimeout(4000)    
    console.log(await page.content());
    await page.screenshot({path: 'screenshot.png'});
    
    await browser.close();
})();

