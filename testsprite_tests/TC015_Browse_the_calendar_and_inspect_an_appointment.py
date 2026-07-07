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
        
        # -> Open the Calendar page by navigating to /calendar so the calendar view can be inspected.
        await page.goto("http://localhost:3000/calendar")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the '>' (next) button next to 'Bugün' to advance the calendar date.
        # next button
        elem = page.get_by_role('button', name='next', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Hakan Şen' appointment block (09:00) to open its details and verify the appointment details panel appears.
        # Hakan Şen Kişisel antrenman 09:00 button
        elem = page.get_by_role('button', name='Hakan Şen Kişisel antrenman 09:00', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify appointment blocks are displayed for staff members
        # Assert: An appointment for 'Hakan Şen' is visible, confirming appointment blocks are displayed for staff members.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[4]").nth(0)).to_contain_text("Hakan \u015een", timeout=15000), "An appointment for 'Hakan \u015een' is visible, confirming appointment blocks are displayed for staff members."
        # Assert: The appointment details show the price '₺800', confirming an appointment block's details are displayed.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[4]/div/div[2]/div[4]/span[2]").nth(0)).to_have_text("\u20ba800", timeout=15000), "The appointment details show the price '\u20ba800', confirming an appointment block's details are displayed."
        
        # --> Verify appointment details are displayed
        await page.locator("xpath=/html/body/div[2]/div/main/div/div[4]").nth(0).scroll_into_view_if_needed()
        # Assert: The appointment details modal is visible showing the customer's name and contact.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[4]").nth(0)).to_be_visible(timeout=15000), "The appointment details modal is visible showing the customer's name and contact."
        # Assert: The appointment details show the correct price of ₺800.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[4]/div/div[2]/div[4]/span[2]").nth(0)).to_have_text("\u20ba800", timeout=15000), "The appointment details show the correct price of \u20ba800."
        await page.locator("xpath=/html/body/div[2]/div/main/div/div[4]/div/button").nth(0).scroll_into_view_if_needed()
        # Assert: The appointment details modal includes a visible 'Kapat' (Close) button.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[4]/div/button").nth(0)).to_be_visible(timeout=15000), "The appointment details modal includes a visible 'Kapat' (Close) button."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    