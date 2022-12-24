// require("dotenv").config()
// const axios = require("axios")
// const options = {
//   url: "https://kash-somani-s-workspace-bet50q.us-east-1.xata.sh/db/ccc-floor:main/tables/floors/query",
//   method: "POST",
//   headers: {
//     Authorization: `Bearer ${process.env.TOKEN}`,
//     "Content-Type": "application/json",
//   },
//   body: '{"sort":{"date":"asc"}}',
// }

// axios(options)
//   .then(response => response.data)
//   .then(response => {
//     let records = response.records.slice(0, 9)

//     records = records.sort((a, b) => {
//       if (a.rank == "SE") {
//         return 1
//       }
//       if (b.rank == "SE") {
//         return -1
//       }
//       return Number(b.rank) - Number(a.rank)
//     })
//     records.forEach(el =>
//       console.log(`rank:${el.rank}, floor:${el.floor}, date:${el.date}`)
//     )
//   })
//   .catch(err => console.error(err))
const puppeteer = require("puppeteer")
async function main() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setViewport({
    width: 1920,
    height: 1080,
  })
  await page.goto("https://cnft.tools/radioactivecrocsclub")
  await page.waitForSelector(".mantine-1s9i825")
  let maxInput = await page.evaluate(
    () =>
      Array.from(
        document.querySelectorAll(".mantine-1s9i825")
      )[1]
  )
  console.log(maxInput)
  maxInput = maxInput[1]
  console.log(maxInput)
  maxInput.type("1000")
  await page.waitForTimeout(1000)
  await page.keyboard.press("Tab")
  await page.keyboard.press("Enter")
  let text = await page.evaluate(() => {
    return document.querySelector(".mantine-5xhj36")
      .innerHTML
  })
  console.log(maxInput)
  console.log(text)
  await browser.close()
}
main()
