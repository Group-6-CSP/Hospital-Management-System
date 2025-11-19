def test_home_links_navigate(driver, base_url, wait_for):
    driver.get(base_url)
    wait_for(1)

    # Find Register link and click
    register = driver.find_element('link text', 'Register')
    register.click()
    wait_for(1)
    assert '/register' in driver.current_url

    # Navigate back to home
    driver.get(base_url)
    wait_for(1)

    # Find Login link and click
    login = driver.find_element('link text', 'Login')
    login.click()
    wait_for(1)
    assert '/login' in driver.current_url
