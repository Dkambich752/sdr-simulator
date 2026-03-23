package com.sdr.sim;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
public class RFController { ... }

@RestController
@RequestMapping("/api")
public class RFController {
    private final RFService rfService;

    public RFController(RFService rfService) {
        this.rfService = rfService;
    }

    @GetMapping("/spectrum")
    public List<Signal> getSpectrum() {
        List<Signal> currentSpectrum = rfService.getActiveSpectrum();
        
        // Automated Defense logic
        Optional<Double> threatFreq = ThreatDetector.scanForThreat(currentSpectrum);
        threatFreq.ifPresent(freq -> currentSpectrum.add(ThreatDetector.generateCounterMeasure(freq)));
        
        return currentSpectrum;
    }
}
