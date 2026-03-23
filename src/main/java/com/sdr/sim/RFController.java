package com.sdr.sim;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*") // Allows React to talk to Java
@RestController
@RequestMapping("/api")     // Sets the base path to /api
public class RFController {

    private final RFService rfService;

    public RFController(RFService rfService) {
        this.rfService = rfService;
    }

    @GetMapping("/spectrum")
    public List<Signal> getSpectrum() {
        // 1. Get the base signals from the service
        List<Signal> currentSpectrum = rfService.getActiveSpectrum();
        
        // 2. Automated Defense logic: Scan for Adversaries
        Optional<Double> threatFreq = ThreatDetector.scanForThreat(currentSpectrum);
        
        // 3. If a threat is found, automatically generate and add the Jammer signal
        threatFreq.ifPresent(freq -> 
            currentSpectrum.add(ThreatDetector.generateCounterMeasure(freq))
        );
        
        return currentSpectrum;
    }
}
