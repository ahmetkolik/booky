import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:3000/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Demo' link in the top navigation to open the dashboard (enter demo mode).
        # Demo link
        elem = page.get_by_role('link', name='Demo', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'EN' button to switch the dashboard interface to English and then verify the workspace view stays visible and labels update to English.
        # EN button
        elem = page.get_by_role('button', name='EN', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'TR' language button to switch the interface back to Turkish and verify the dashboard workspace (Client view and Your dashboard panels) remains visible and UI labels update to Turkish.
        # TR button
        elem = page.get_by_role('button', name='TR', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the dashboard workspace remains displayed
        # Assert: The URL shows the demo dashboard is open (contains #demo).
        await expect(page).to_have_url(re.compile("\\#demo"), timeout=15000), "The URL shows the demo dashboard is open (contains #demo)."
        await page.locator("xpath=/html/body/div[2]/div[2]/section[3]/div[2]/div/div[1]/button").nth(0).scroll_into_view_if_needed()
        # Assert: The customer booking card's 'Rezerve et' button is visible, indicating the workspace is displayed.
        await expect(page.locator("xpath=/html/body/div[2]/div[2]/section[3]/div[2]/div/div[1]/button").nth(0)).to_be_visible(timeout=15000), "The customer booking card's 'Rezerve et' button is visible, indicating the workspace is displayed."
        await page.locator("xpath=/html/body/div[2]/div[2]/section[1]/div/div[2]/div[2]/div/div[3]/div[1]/span[1]").nth(0).scroll_into_view_if_needed()
        # Assert: A dashboard calendar time slot ('08:00') is visible, confirming the workspace panel remains shown.
        await expect(page.locator("xpath=/html/body/div[2]/div[2]/section[1]/div/div[2]/div[2]/div/div[3]/div[1]/span[1]").nth(0)).to_be_visible(timeout=15000), "A dashboard calendar time slot ('08:00') is visible, confirming the workspace panel remains shown."
        
        # --> Verify the language change is reflected in the interface
        # Assert: Header navigation shows 'Özellikler' in Turkish.
        await expect(page.locator("xpath=/html/body/div[2]/header/div/nav/a[2]").nth(0)).to_have_text("\u00d6zellikler", timeout=15000), "Header navigation shows '\u00d6zellikler' in Turkish."
        # Assert: The demo link displays 'Canlı demoyu gör', confirming Turkish labels are shown.
        await expect(page.locator("xpath=/html/body/div[2]/div[2]/section[1]/div/div[2]/div[1]/div/div[2]/a").nth(0)).to_have_text("Canl\u0131 demoyu g\u00f6r", timeout=15000), "The demo link displays 'Canl\u0131 demoyu g\u00f6r', confirming Turkish labels are shown."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    