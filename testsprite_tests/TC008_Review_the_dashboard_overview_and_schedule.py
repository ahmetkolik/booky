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
        
        # -> Navigate to /dashboard to open the Dashboard page and then verify the summary metrics, schedule grid, and alerts.
        await page.goto("http://localhost:3000/dashboard")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # --> Assertions to verify final state
        
        # --> Verify summary metrics are displayed
        # Assert: Summary metric '9.2%' is displayed.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div[1]/div[2]/div[1]/div/span[2]").nth(0)).to_have_text("9.2\n%", timeout=15000), "Summary metric '9.2%' is displayed."
        # Assert: Summary metric '14.6%' is displayed.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div[1]/div[2]/div[2]/div/span[2]").nth(0)).to_have_text("14.6\n%", timeout=15000), "Summary metric '14.6%' is displayed."
        # Assert: Summary metric '4.1%' is displayed.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div[1]/div[2]/div[3]/div/span[2]").nth(0)).to_have_text("4.1\n%", timeout=15000), "Summary metric '4.1%' is displayed."
        # Assert: Summary metric '2.0%' is displayed.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div[1]/div[2]/div[4]/div/span[2]").nth(0)).to_have_text("2.0\n%", timeout=15000), "Summary metric '2.0%' is displayed."
        
        # --> Verify the schedule grid and upcoming alerts are displayed
        # Assert: The schedule grid displays the 08:00 time slot.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div[1]/div[3]/div[2]/div/div[2]/div[2]/div[1]").nth(0)).to_have_text("08:00", timeout=15000), "The schedule grid displays the 08:00 time slot."
        # Assert: A staff name (Mert) is visible in the schedule grid.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div[1]/div[3]/div[2]/div/div[1]/div[3]/div/p[1]").nth(0)).to_have_text("Mert", timeout=15000), "A staff name (Mert) is visible in the schedule grid."
        # Assert: The alerts/aside area is visible (shows reminder time 09:00).
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/aside/div[3]/div[2]/div[3]/span[1]").nth(0)).to_have_text("09:00", timeout=15000), "The alerts/aside area is visible (shows reminder time 09:00)."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    