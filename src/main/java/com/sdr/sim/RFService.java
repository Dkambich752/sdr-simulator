package com.sdr.sim;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class RFService {
    public List<Signal> getActiveSpectrum() {
        List<Signal> spectrum = new ArrayList<>();
        Random r = new Random();
        for (int i = 0; i < 5; i++) {
            spectrum.add(new Signal(2400 + r.nextInt(100), -70 - r.nextInt(20), "FRIENDLY"));
        }
        // Add frequency drift (wiggle) and power flicker (pulse)
        double drift = (r.nextDouble() - 0.5) * 1.5; 
        double flicker = -30.0 - (r.nextDouble() * 5.0);
        spectrum.add(new Signal(2442.0 + drift, flicker, "ADVERSARY")); 

        return spectrum;
    }
}
