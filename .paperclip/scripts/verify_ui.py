from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        executable_path='/usr/bin/chromium-browser',
        args=['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
    )
    page = browser.new_page()
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')
    # Verification logic goes here
    page.screenshot(path='/paperclip/instances/default/projects/801b4864-f9fa-47ba-8379-908dbdf45c8e/09c14008-3898-40e7-ba31-3bc1ca5a21bf/SplatDev.Umbraco.Plugins/sandbox-verification.png', full_page=True)
    browser.close()