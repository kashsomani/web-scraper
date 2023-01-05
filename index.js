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
        headless: false,
      })
      const page = await browser.newPage()
      await page.setViewport({
        width: 1200,
        height: 1500,
      })

      await page.goto(
        "https://cnft.tools/" + collectionName,
        {
          waitUntil: "load",
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
      const html = await page.content()

      let idx = 0
      let end_idx = 0
      idx = html.indexOf('line-height: 1.5;">', idx)
      if (idx == -1) {
        return {
          rank,
          price: 1000000,
        }
      }
      idx = idx + 'line-height: 1.5;">'.length

      end_idx = html.indexOf("<", idx)

      idx = html.indexOf('line-height: 1.5;">', idx)
      idx = idx + 'line-height: 1.5;">'.length
      idx = html.indexOf(">", idx)
      end_idx = html.indexOf("<", idx)
      const asset_price = html.substring(idx, end_idx)
      const trimmed_asset_price = asset_price.substring(
        1,
        asset_price.length - 3
      )
      idx = end_idx
      await browser.close()
      return {
        rank: rank == "1" ? "SE" : rank.toString(),
        floor: trimmed_asset_price,
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
    console.log(result)
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
  setTimeout(main, 1000 * 60 * 15)
}
main()
