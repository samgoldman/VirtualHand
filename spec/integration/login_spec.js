const puppeteer = require('puppeteer');
const server = require('../../server');
const {nukeDatabase} = require('../helpers/integration_helpers');
const randomstring = require('randomstring');

describe('login', () => {
    let browser, page, originalTimeout;

    beforeAll(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;
    });

    beforeEach(async () => {
        browser = await puppeteer.launch();
        
        page = await browser.newPage();
        await page.goto('http://localhost:8080/login');
    });

    afterEach(async () =>{
        await nukeDatabase();
        browser.close();
    });

    afterAll(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it('should display a non-specific notification if the username is not correct', async () => {
        expect(await page.title()).toEqual('Virtual Hand Login');

        await page.screenshot({path: 'screenshots/incorrect_username_1.jpg'});

        let username = randomstring.generate(8);
        let password = randomstring.generate(8);
        console.log("Username, password: ", username, password);

        await page.type('input[name=username]', username, {delay: 20});
        await page.type('input[name=password]', password, {delay: 20});
        await page.screenshot({path: 'screenshots/incorrect_username_2.jpg'});
        
        await page.click('button[type=submit]', {delay: 20});
        
        await page.waitForSelector('div.alert', {'timeout': 1000});
        await page.screenshot({path: 'screenshots/incorrect_username_3.jpg'});
        const alert = await page.$('div.alert');
        expect(await page.evaluate(el => el.textContent, alert)).toEqual('Incorrect credentials');
    });
})