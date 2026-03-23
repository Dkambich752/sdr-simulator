package com.sdr.sim;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class SdrUiTest {

    @Test
    public void verifyMissionBroadcast() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        
        WebDriver driver = new ChromeDriver(options);

        // POINT TO THE API ON THE SERVER ITSELF (Port 80)
        // This validates the actual 'Mission Engine' is running
        try {
            driver.get("http://localhost/api/spectrum");
            
            String pageSource = driver.getPageSource();
            
            // Validate the Signal Logic is broadcasting
            assertTrue(pageSource.contains("ADVERSARY"), "CRITICAL: Threat Detection Engine Offline!");
            assertTrue(pageSource.contains("JAMMER"), "CRITICAL: Countermeasure Logic Failed!");

            System.out.println("LOG: Mission Critical Data Stream Verified.");
        } finally {
            // No catch block here - if it fails, Maven MUST know so it stops the build!
            driver.quit();
        }
    }
}
