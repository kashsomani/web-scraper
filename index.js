const puppeteer = require("puppeteer")
const axios = require("axios")
const collectionBot = async (collectionName, ranks) => {
  function delay(time) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time)
    })
  }
  try {
    const results = ranks.map(async rank => {
      const browser = await puppeteer.launch({
        timeout: 0,
        ignoreHTTPSErrors: true,
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      })
      const page = await browser.newPage()
      await page.setViewport({
        width: 1200,
        height: 1500,
      })

      await page.goto(
        "https://cnft.tools/" + collectionName,
        {
          waitUntil: "networkidle2",
          // Remove the timeout
          timeout: 0,
        }
      )
      await delay(3000)
      await page.click("#sort-type")
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("Enter")
      await delay(3000)

      await page.type(
        'input[placeholder="Max"]:first-child',
        rank.toString()
      )
      await page.click("button.mantine-txbd7p")
      await delay(3000)

      let texts = await page.evaluate(() => {
        let elements = document.getElementsByClassName(
          "mantine-5xhj36"
        )
        return Array.from(elements).map(el => el.innerHTML)
      })
      if (texts.length === 0) {
        return {
          rank,
          price: 1000000,
        }
      }
      //mantine-5xhj36
      //obtain text
      const asset_price = texts[0].split(" ")[0]
      await browser.close()
      return {
        rank: rank == "1" ? "SE" : rank.toString(),
        floor: asset_price,
      }
    })

    return await Promise.all(results)
  } catch (error) {
    console.log("error", error)
  }

  return []
}
const props = {
  OG: {
    collectionName: "cardanocrocsclub",
    url: "https://kash-somani-s-workspace-bet50q.us-east-1.xata.sh/db/ccc-floor:main/tables/floors/data?columns=id",
    ranks: [
      1, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000,
    ],
  },
  RA: {
    collectionName: "radioactivecrocsclub",
    url: "https://kash-somani-s-workspace-bet50q.us-east-1.xata.sh/db/ccc-floor:main/tables/RA/data?columns=id",
    ranks: [
      500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000,
      9000, 10000,
    ],
  },
  BABY: {
    collectionName: "babycrocsclub",
    url: "https://kash-somani-s-workspace-bet50q.us-east-1.xata.sh/db/ccc-floor:main/tables/baby/data?columns=id",
    ranks: [1, 500, 1000, 2000, 3000, 4000, 5000, 6000],
  },
}
const getCollection = async collection => {
  const { ranks, collectionName } = props[collection]
  const results = await collectionBot(collectionName, ranks)
  console.log(results)
  return results
}
const updateDatabase = (collection, results) => {
  results.forEach(async el => {
    const config = {
      headers: {
        Authorization: `Bearer xau_W158qTTPFlVnvZvq7lK0PwlfAQ7p5Jrf2`,
        "Content-Type": "application/json",
      },
    }
    const result = await axios.post(
      props[collection].url,
      { ...el, date: new Date(Date.now()).toISOString() },
      config
    )
    console.log(result.data)
    return result.data
  })
}

const main = async () => {
  const OGs = await getCollection("OG")
  updateDatabase("OG", OGs)
  const RAs = await getCollection("RA")
  updateDatabase("RA", RAs)
  const BABYs = await getCollection("BABY")
  updateDatabase("BABY", BABYs)
  //setTimeout(main, 1000 * 60 * 15)
}
main()
