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
        
        # -> Open the Calendar page by navigating to /calendar so the calendar day view can be inspected.
        await page.goto("http://localhost:3000/calendar")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # --> Assertions to verify final state
        
        # --> Verify staff columns are displayed
        await page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div/div/div[1]/div[2]/span").nth(0).scroll_into_view_if_needed()
        # Assert: Selin's staff column header (SA) is visible.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div/div/div[1]/div[2]/span").nth(0)).to_be_visible(timeout=15000), "Selin's staff column header (SA) is visible."
        await page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div/div/div[1]/div[3]/span").nth(0).scroll_into_view_if_needed()
        # Assert: Mert's staff column header (MK) is visible.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div/div/div[1]/div[3]/span").nth(0)).to_be_visible(timeout=15000), "Mert's staff column header (MK) is visible."
        await page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div/div/div[1]/div[4]/span").nth(0).scroll_into_view_if_needed()
        # Assert: Aylin's staff column header (AD) is visible.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div/div/div[1]/div[4]/span").nth(0)).to_be_visible(timeout=15000), "Aylin's staff column header (AD) is visible."
        await page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div/div/div[1]/div[5]/span").nth(0).scroll_into_view_if_needed()
        # Assert: Cem's staff column header (CY) is visible.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div/div/div[1]/div[5]/span").nth(0)).to_be_visible(timeout=15000), "Cem's staff column header (CY) is visible."
        
        # --> Verify time-based appointment blocks are displayed
        # Assert: Elif Şahin appointment block displays the time 09:00.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div/div/div[2]/div[2]/button[1]").nth(0)).to_contain_text("09:00", timeout=15000), "Elif \u015eahin appointment block displays the time 09:00."
        # Assert: Deniz Arslan appointment block displays the time 10:00.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div/div/div[2]/div[2]/button[2]").nth(0)).to_contain_text("10:00", timeout=15000), "Deniz Arslan appointment block displays the time 10:00."
        # Assert: Zeynep Korkmaz appointment block displays the time 10:30.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div/div/div[2]/div[4]/button[1]").nth(0)).to_contain_text("10:30", timeout=15000), "Zeynep Korkmaz appointment block displays the time 10:30."
        # Assert: Kerem Aslan appointment block displays the time 11:00.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div/div/div[2]/div[5]/button[1]").nth(0)).to_contain_text("11:00", timeout=15000), "Kerem Aslan appointment block displays the time 11:00."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    