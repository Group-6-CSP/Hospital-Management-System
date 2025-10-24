Selenium test suite for frontend

How to run

1. Install Python 3.8+ and create a virtualenv (optional but recommended)

2. Install test dependencies:

   pip install -r requirements.txt

3. Ensure the frontend dev server is running. By default the tests use http://localhost:3001

   If your frontend runs on a different port, set the environment variable FRONTEND_URL before running pytest.

   Example (PowerShell):

   $env:FRONTEND_URL = 'http://localhost:3001'
   $env:HEADLESS = '1'  # set to 0 to see the browser
   pytest -q

Notes & assumptions
- These tests use Chrome via Selenium. Make sure a compatible ChromeDriver is installed and available on PATH.
- If you prefer to use webdriver-manager, you can edit `conftest.py` to use it.
- Some tests expect the backend to be reachable at http://localhost:5239 for successful register/login flows; otherwise the tests assert the UI shows an error message.
