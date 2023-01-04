const puppeteer = require("puppeteer")
// haha
// cardanocrocsclub

const collectionBot = async (collectionName, rank) => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setViewport({
    width: 1200,
    height: 1500,
  })

  await page.goto("https://cnft.tools/" + collectionName, {
    waitUntil: "networkidle2",
  })

  await page.click("#sort-type")
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")
  try {
    await page.waitForTimeout(5000)

    await page.type(
      'input[placeholder="Max"]:first-child',
      rank
    )
    await page.click("button.mantine-txbd7p")
    await page.waitForTimeout(1000)
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
      rank: rank == "1" ? "SE" : rank,
      price: parseInt(trimmed_asset_price),
      date: new Date(Date.now()).toISOString(),
    }
  } catch (error) {
    console.log("error", error)
  }

  return []
}
const babyRanks = [
  "1",
  "500",
  "1000",
  "2000",
  "3000",
  "4000",
  "5000",
  "6000",
]
let results = []
babyRanks.forEach(rank => {
  const res = collectionBot("babycrocsclub", rank)
  results.push(res)
})
Promise.all(results).then(result => console.log(result))
