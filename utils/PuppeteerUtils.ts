import puppeteer from "puppeteer-extra";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import { pageExtend } from "puppeteer-jquery";
import { URL } from "url";

export default class PuppeteerUtils {
  page;
  launchOptions;
  browser;

  constructor(launchOptions?) {
    puppeteer.use(AdblockerPlugin());
    this.launchOptions = launchOptions;
  }

  async iniciar(): Promise<any> {
    this.browser = await puppeteer.launch({
      ...this.launchOptions,
      // headless: false,
      // slowMo: 1000,
      // devtools: true,
    });

    const pageSite = await this.browser.newPage();
    this.page = pageExtend(pageSite);

    await this.page.setExtraHTTPHeaders({
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36",
      "upgrade-insecure-requests": "1",
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "en-US,en;q=0.9,en;q=0.8",
    });

    return this.page;
  }

  async acessarUrl(url: URL): Promise<any> {
    try {
      await this.page.goto(url.href, {
        waitUntil: "load",
      });
    } catch (error) {
      console.warn("ERRO acessarUrl: ", error);
    }

    return this.page;
  }

  async fecharNavegador(): Promise<void> {
    await this.browser.close();
  }

  static logRequest(interceptedRequest) {
    console.log("A request was made:", interceptedRequest.url());
  }

  static delayPup(time): Promise<void> {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }
}
