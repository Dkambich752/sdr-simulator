package com.sdr.sim;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/api")
public class RFController {

    private final RFService rfService;

    public RFController(RFService rfService) {
        this.rfService = rfService;
    }

    @GetMapping("/spectrum")
    public List<Signal> getSpectrum() {
        // 1. Get the current environment
        List<Signal> currentSpectrum = rfService.getActiveSpectrum();
        
        // 2. Scan for the Adversary (Red)
        Optional<Double> threatFreq = ThreatDetector.scanForThreat(currentSpectrum);
        
        // 3. If found, add the Jammer (Yellow) to the list
        threatFreq.ifPresent(freq -> 
            currentSpectrum.add(ThreatDetector.generateCounterMeasure(freq))
        );
        
        return currentSpectrum;
    }
}
