package com.sdr.sim;
import java.util.List;
import java.util.Optional;

public class ThreatDetector {
    // This method "scans" the spectrum and returns the enemy frequency
    public static Optional<Double> scanForThreat(List<Signal> spectrum) {
        return spectrum.stream()
                .filter(s -> "ADVERSARY".equals(s.getType()))
                .map(Signal::getFrequency)
                .findFirst();
    }

    // This calculates the counter-signal (The Jammer)
    public static Signal generateCounterMeasure(double enemyFreq) {
        System.out.println("[ALARM] Threat detected at " + enemyFreq + " MHz! Deploying Jammer...");
        return new Signal(enemyFreq, 0.0, "JAMMER"); // High power to drown them out
    }
}
