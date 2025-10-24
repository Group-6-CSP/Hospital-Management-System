import os
import time
import pytest
import webdriver_manager.chrome
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


@pytest.fixture(scope='session')
def base_url():
    return os.environ.get('FRONTEND_URL', 'http://localhost:3001')


@pytest.fixture(scope='session')
def chrome_options():
    opts = Options()
    # Run headless when CI or env var is set
    if os.environ.get('HEADLESS', '1') in ('1', 'true', 'True'):
        opts.add_argument('--headless=new')
    opts.add_argument('--no-sandbox')
    opts.add_argument('--disable-dev-shm-usage')
    opts.add_argument('--window-size=1366,768')
    return opts


@pytest.fixture(scope='session')
def driver(chrome_options):
    # Use webdriver-manager to install a compatible ChromeDriver automatically
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    yield driver
    try:
        driver.quit()
    except Exception:
        pass


@pytest.fixture
def wait_for(driver):
    def _wait(seconds=0.5):
        time.sleep(seconds)
    return _wait
