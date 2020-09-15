const { EXIT_CODE } = require('karma/lib/constants');
const puppeteer = require('puppeteer');
const server = require('../../server');

describe('test', () => {

it('should have a title', async () => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:8080');
    expect(await page.title()).toEqual('Virtual Hand Login');
    await browser.close();

});
})