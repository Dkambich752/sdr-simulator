# Step 1: Use a lightweight Java Runtime
FROM eclipse-temurin:17-jre-alpine

# Step 2: Set the working directory
WORKDIR /app

# Step 3: Copy the compiled JAR from the Jenkins build
COPY target/*.jar app.jar

# --- THE ADDITION: DOCKER HEALTH CHECK ---
# This tells Docker to check the API every 30 seconds. 
# If it gets a 200 OK, the container is "healthy". 
# If it fails, Docker marks it as "unhealthy".
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8081/api/spectrum || exit 1

# Step 4: Run the simulator on port 8081
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
