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
        
        # -> Click the 'Demo' link in the top navigation to open the demo booking page.
        # Demo link
        elem = page.get_by_role('link', name='Demo', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the demo booking page so the booking UI (service, staff, date, and time-slot grid) is visible.
        await page.goto("http://localhost:3000/book/demo")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Devam et' button to proceed to the staff selection step.
        # Devam et button
        elem = page.get_by_role('button', name='Devam et', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Selin Aydın' staff card to select that staff so the booking can proceed.
        # SA Selin Aydın Kıdemli stilist button
        elem = page.get_by_role('button', name='SA Selin Aydın Kıdemli stilist', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Selin Aydın' staff card to select that staff so the booking can proceed.
        # Devam et button
        elem = page.get_by_role('button', name='Devam et', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '10:00' time slot (displayed as struck-through/disabled) to verify it cannot be selected, then click the '09:00' time slot to verify selection is allowed.
        # 10:00 button
        elem = page.get_by_role('button', name='10:00', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '10:00' time slot (displayed as struck-through/disabled) to verify it cannot be selected, then click the '09:00' time slot to verify selection is allowed.
        # 09:00 button
        elem = page.get_by_role('button', name='09:00', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the booked time slots are disabled and cannot be selected (clicking them does not highlight them)
        # Assert: The 10:00 time slot is disabled and cannot be selected.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[2]/div[2]/div/button[2]").nth(0)).to_have_attribute("disabled", "true", timeout=15000), "The 10:00 time slot is disabled and cannot be selected."
        # Assert: The 12:00 time slot is disabled and cannot be selected.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[2]/div[2]/div/button[5]").nth(0)).to_have_attribute("disabled", "true", timeout=15000), "The 12:00 time slot is disabled and cannot be selected."
        # Assert: The 15:00 time slot is disabled and cannot be selected.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[2]/div[2]/div/button[8]").nth(0)).to_have_attribute("disabled", "true", timeout=15000), "The 15:00 time slot is disabled and cannot be selected."
        
        # --> Verify at least one available time slot can be selected
        await page.locator("xpath=/html/body/div[2]/div/main/div/div[2]/div[2]/div/button[1]").nth(0).scroll_into_view_if_needed()
        # Assert: At least one available time slot (09:00) is visible and can be selected.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[2]/div[2]/div/button[1]").nth(0)).to_be_visible(timeout=15000), "At least one available time slot (09:00) is visible and can be selected."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    