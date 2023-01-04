const getFloorFromCnftTools =
  async function getFloorFromCnftTools(
    collectionName,
    range
  ) {
    console.log(
      "getFloorFromCnftTools collectionName:" +
        collectionName +
        " range:" +
        JSON.stringify(range)
    )
    try {
      const browser = await puppeteer.launch()
      const page = await browser.newPage()
      await page.setViewport({
        width: 1200,
        height: 1500,
      })

      await page.goto(
        "https://cnft.tools/" + collectionName,
        {
          waitUntil: "networkidle2",
        }
      )

      await page.click("#sort-type")
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("Enter")
      await page.waitForTimeout(5000)

      await page.type(
        'input[placeholder="Min"]:first-child',
        range.min.toString()
      )
      await page.type(
        'input[placeholder="Max"]:first-child',
        range.max.toString()
      )
      await page.click("button.mantine-txbd7p")
      await page.waitForTimeout(1000)
      const html = await page.content()

      const result = []
      let idx = 0
      let end_idx = 0
      do {
        idx = html.indexOf('line-height: 1.5;">', idx)
        if (idx == -1) {
          continue
        }
        idx = idx + 'line-height: 1.5;">'.length

        end_idx = html.indexOf("<", idx)
        const asset_name = html
          .substring(idx, end_idx)
          .replace(" # ", "")
        idx = end_idx

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
        console.log({
          collectionName: asset_name,
          price: parseInt(trimmed_asset_price),
        })
        result.push({
          collectionName: asset_name,
          price: parseInt(trimmed_asset_price),
        })
      } while (idx != -1)

      await browser.close()
      return result
    } catch (error) {
      console.log("error", error)
    }

    return []
  }
