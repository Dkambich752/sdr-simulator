package com.sdr.sim;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import java.time.Duration;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class SdrUiTest {

    @Test
    public void verifyThreatDetectionRendering() {
        // Setup Chrome to run 'Headless' (invisible) for Jenkins/AWS
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");

        WebDriver driver = new ChromeDriver(options);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));

        try {
            // 1. Navigate to the Mission Monitor
            driver.get("http://localhost:3000");

            // 2. Wait for the Axios fetch to complete (Look for ADVERSARY)
            Thread.sleep(5000); 

            // 3. Automated Validation (The 'Quality Gate')
            String pageContent = driver.getPageSource();
            
            assertTrue(pageContent.contains("ADVERSARY"), "CRITICAL: Adversary signal not detected in UI!");
            assertTrue(pageContent.contains("JAMMER"), "CRITICAL: Automated Jammer countermeasure not rendered!");

            System.out.println("LOG: Automated UI Verification Successful. Mission Telemetry Validated.");
        } catch (Exception e) {
            System.err.println("TEST FAILED: " + e.getMessage());
        } finally {
            driver.quit();
        }
    }
}
