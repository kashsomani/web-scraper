const puppeteer = require("puppeteer")
const axios = require("axios")

const collectionBot = async (collectionName, ranks) => {
  function delay(time) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time)
    })
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      timeout: 20000,
      ignoreHTTPSErrors: true,
      slowMo: 0,
      args: [
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-setuid-sandbox",
        "--no-first-run",
        "--no-sandbox",
        "--no-zygote",
        "--window-size=1280,720",
      ],
    })
    const results = await Promise.all(
      await ranks.map(async rank => {
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
          return Array.from(elements).map(
            el => el.innerHTML
          )
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

        return {
          rank: rank == "1" ? "SE" : rank.toString(),
          floor: asset_price,
        }
      })
    )
    await browser.close()

    return results
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
const updateDatabase = async (collection, results) => {
  return results.map(el => {
    const config = {
      headers: {
        Authorization: `Bearer xau_W158qTTPFlVnvZvq7lK0PwlfAQ7p5Jrf2`,
        "Content-Type": "application/json",
      },
    }
    return axios
      .post(
        props[collection].url,
        {
          ...el,
          date: new Date(Date.now()).toISOString(),
        },
        config
      )
      .then(res => res.data)
  })
}

const BABY = async () => {
  const BABYs = await getCollection("BABY")
  return await Promise.all(
    await updateDatabase("BABY", BABYs)
  )
}
const OG = async () => {
  const OGs = await getCollection("OG")
  updateDatabase("OG", OGs)
}
const RA = async () => {
  const RAs = await getCollection("RA")
  updateDatabase("RA", RAs)
}
const test = async () => {
  let full = await BABY()
  console.log(full)
  full = await RA()
  console.log(full)
  full = await OG()
  console.log(full)
}
test()
