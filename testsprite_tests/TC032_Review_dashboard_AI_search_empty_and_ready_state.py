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
        
        # -> Navigate to the dashboard page (visit path /dashboard) so the dashboard UI can be inspected.
        await page.goto("http://localhost:3000/dashboard")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # --> Assertions to verify final state
        
        # --> Verify the AI search entry point is displayed
        await page.locator("xpath=/html/body/div[2]/aside/div[2]/button").nth(0).scroll_into_view_if_needed()
        # Assert: The AI search entry point button labeled "AI ile ara" is visible in the sidebar.
        await expect(page.locator("xpath=/html/body/div[2]/aside/div[2]/button").nth(0)).to_be_visible(timeout=15000), "The AI search entry point button labeled \"AI ile ara\" is visible in the sidebar."
        
        # --> Verify the dashboard workspace is displayed
        # Assert: The dashboard shows the "Rezervasyon linki" button.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div[1]/div[3]/div[1]/div/button[1]").nth(0)).to_have_text("Rezervasyon linki", timeout=15000), "The dashboard shows the \"Rezervasyon linki\" button."
        # Assert: The dashboard table header includes "Müşteri", confirming the workspace is displayed.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div[1]/div[4]/div[2]/table/thead/tr").nth(0)).to_contain_text("M\u00fc\u015fteri", timeout=15000), "The dashboard table header includes \"M\u00fc\u015fteri\", confirming the workspace is displayed."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    