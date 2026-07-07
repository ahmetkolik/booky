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
        
        # -> Open the AI search box on the Dashboard page after navigating to /dashboard.
        await page.goto("http://localhost:3000/dashboard")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'AI ile ara' button in the left sidebar to open the AI search box.
        # AI ile ara ⌘K button
        elem = page.get_by_role('button', name='AI ile ara ⌘K', exact=True)
        await elem.click(timeout=10000)
        
        # -> Type 'Bugünkü randevularım neler?' into the AI assistant input field and click the send button to submit the query.
        # Bir şey sor… text field
        elem = page.get_by_placeholder('Bir şey sor…', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Bug\u00fcnk\u00fc randevular\u0131m neler?")
        
        # -> Type 'Bugünkü randevularım neler?' into the AI assistant input field and click the send button to submit the query.
        # button
        elem = page.locator('xpath=/html/body/div[2]/div[2]/div[2]/div/button')
        await elem.click(timeout=10000)
        
        # -> Search the page for the submitted query 'Bugünkü randevularım neler?' and, if not visible, open the 'AI ile ara' assistant by clicking the 'AI ile ara' button.
        # AI ile ara ⌘K button
        elem = page.get_by_role('button', name='AI ile ara ⌘K', exact=True)
        await elem.click(timeout=10000)
        
        # -> Type 'Bugünkü randevularım neler?' into the AI assistant input field (placeholder 'Bir şey sor…') and press Enter to submit the query, then verify the conversation shows the submitted query and an assistant response.
        # Bir şey sor… text field
        elem = page.get_by_placeholder('Bir şey sor…', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Bug\u00fcnk\u00fc randevular\u0131m neler?")
        
        # --> Assertions to verify final state
        
        # --> Verify an assistant response is displayed
        # Assert: An assistant reply about adding GEMINI_API_KEY is visible.
        await expect(page.locator("xpath=/html/body/div[2]/div[2]/div[2]/div[2]/div[2]/span").nth(0)).to_contain_text("AI arama \u00f6zelli\u011fi i\u00e7in .env.local dosyas\u0131na GEMINI_API_KEY eklemeniz gerekiyor.", timeout=15000), "An assistant reply about adding GEMINI_API_KEY is visible."
        
        # --> Verify the submitted query is reflected in the conversation
        # Assert: Verify the conversation contains the submitted message 'Bugünkü randevularım neler?'.
        await expect(page.locator("xpath=/html/body/div[2]/div[2]/div[1]").nth(0)).to_contain_text("Bug\u00fcnk\u00fc randevular\u0131m neler?", timeout=15000), "Verify the conversation contains the submitted message 'Bug\u00fcnk\u00fc randevular\u0131m neler?'."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    