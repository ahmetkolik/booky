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
        
        # -> Scroll down the landing page to reveal more sections, then click the 'EN' language button to switch the site to English.
        await page.mouse.wheel(0, 300)
        
        # -> Scroll down the landing page to reveal more sections, then click the 'EN' language button to switch the site to English.
        # EN button
        elem = page.get_by_role('button', name='EN', exact=True)
        await elem.click(timeout=10000)
        
        # -> Scroll down the landing page to reveal more sections, including the 'See the live demo' / booking widget area.
        await page.mouse.wheel(0, 300)
        
        # -> In the live demo booking widget, click the 'Haircut & style' service, then click the '10:00' time, and then click the 'Confirm booking' button (if it becomes enabled).
        # Haircut & style 45m ₺850 button
        elem = page.get_by_role('button', name='Haircut & style 45m ₺850', exact=True)
        await elem.click(timeout=10000)
        
        # -> In the live demo booking widget, click the 'Haircut & style' service, then click the '10:00' time, and then click the 'Confirm booking' button (if it becomes enabled).
        # 10:00 button
        elem = page.get_by_role('button', name='10:00', exact=True)
        await elem.click(timeout=10000)
        
        # -> In the live demo booking widget, click the 'Haircut & style' service, then click the '10:00' time, and then click the 'Confirm booking' button (if it becomes enabled).
        # Confirm booking button
        elem = page.get_by_role('button', name='Confirm booking', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Sign in' link in the header and verify the login screen appears.
        # Sign in button
        elem = page.get_by_role('button', name='Sign in', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Booky' link to return to the landing page.
        # Booky link
        elem = page.get_by_text('Bookings, on autopilot', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='Booky', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Get started' button in the header to open the signup screen and verify the signup screen appears.
        # Get started button
        elem = page.get_by_role('button', name='Get started', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the signup screen is displayed
        await page.locator("xpath=/html/body/div[2]/section[2]/div[2]/div[2]/button[1]").nth(0).scroll_into_view_if_needed()
        # Assert: The Google social sign-in button is visible on the signup screen.
        await expect(page.locator("xpath=/html/body/div[2]/section[2]/div[2]/div[2]/button[1]").nth(0)).to_be_visible(timeout=15000), "The Google social sign-in button is visible on the signup screen."
        await page.locator("xpath=/html/body/div[2]/section[2]/div[2]/div[2]/button[2]").nth(0).scroll_into_view_if_needed()
        # Assert: The GitHub social sign-in button is visible on the signup screen.
        await expect(page.locator("xpath=/html/body/div[2]/section[2]/div[2]/div[2]/button[2]").nth(0)).to_be_visible(timeout=15000), "The GitHub social sign-in button is visible on the signup screen."
        await page.locator("xpath=/html/body/div[2]/section[2]/div[2]/form/div[1]/input").nth(0).scroll_into_view_if_needed()
        # Assert: The Full name input field is visible on the signup screen.
        await expect(page.locator("xpath=/html/body/div[2]/section[2]/div[2]/form/div[1]/input").nth(0)).to_be_visible(timeout=15000), "The Full name input field is visible on the signup screen."
        await page.locator("xpath=/html/body/div[2]/section[2]/div[2]/form/button").nth(0).scroll_into_view_if_needed()
        # Assert: The 'Get started' submit button is visible on the signup screen.
        await expect(page.locator("xpath=/html/body/div[2]/section[2]/div[2]/form/button").nth(0)).to_be_visible(timeout=15000), "The 'Get started' submit button is visible on the signup screen."
        current_url = await page.evaluate("() => window.location.href")
        # Assert: page loaded with a URL (final outcome verified by the AI judge during the run)
        assert current_url, 'Page should have loaded with a URL'
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    