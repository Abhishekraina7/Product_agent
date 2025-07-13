import asyncio
from playwright.async_api import Browser
from urllib.parse import quote_plus
import logging
from playwright.async_api import TimeoutError as PlaywrightTimeoutError

# Set up basic logging
logging.basicConfig(level=logging.INFO)

async def snapdeal_scraper(page, search_term: str):
    try:
        encoded = quote_plus(search_term)
        url = f"https://www.snapdeal.com/search?keyword={encoded}&sort=rlvncy"
        logging.info(f"Navigating to URL: {url}")

        await page.goto(url, wait_until="commit")
        
        try:
            await page.wait_for_selector("div.product-tuple-listing", timeout=15000)
        except PlaywrightTimeoutError:
            logging.warning(f"No products found for search term: '{search_term}' (selector not found)")
            return []

        products = await page.query_selector_all("div.product-tuple-listing")
        logging.info(f"Found {len(products)} product containers for search term: '{search_term}'")
        
        results = []
        for p in products:
            if len(results) >= 4:
                break
            # Parallelize all selector queries at once
            title_el, price_el, discount_el, link_el, img_el = await asyncio.gather(
                p.query_selector("p.product-title"),
                p.query_selector("span.lfloat.product-price"),
                p.query_selector("div.product-discount"),
                p.query_selector("a.dp-widget-link"),
                p.query_selector("img.product-image")
            )

            title    = (await title_el.inner_text()).strip() if title_el else None
            price    = (await price_el.inner_text()).strip() if price_el else None
            discount = (await discount_el.inner_text()).strip() if discount_el else None
            link     = await link_el.get_attribute("href") if link_el else None
            img      = await img_el.get_attribute("src") if img_el else None

            if link and not link.startswith("http"):
                link = "https://www.snapdeal.com" + link

            if all([title, price, discount, link, img]):
                results.append({
                    "id":      link,  # Unique identifier for deduplication
                    "title":    title,
                    "price":    price,
                    "discount": discount,
                    "link":     link,
                    "image":    img
                })

        return results
    finally:
        pass


async def snapdeal_scraper_multi(browser: Browser, keywords: list[str]):
    logging.info("Creating one page per keyword")
    pages = [
        await browser.new_page(user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ))
        for _ in keywords
    ]
    logging.info("pages created")
    async def _scrape(page, kw):
        try:
            return await snapdeal_scraper(page, kw)  # or inline logic
        finally:
            await page.close()

    tasks = [ _scrape(pg, kw) for pg, kw in zip(pages, keywords) ]
    result_lists = await asyncio.gather(*tasks)
    # Flatten
    return [item for sublist in result_lists for item in sublist]  