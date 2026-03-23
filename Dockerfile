# Step 1: Use a lightweight Java Runtime
FROM eclipse-temurin:17-jre-alpine

# Step 2: Set the working directory
WORKDIR /app

# Step 3: Copy the compiled JAR from the Jenkins build
COPY target/*.jar app.jar

# Step 4: Run the simulator on port 8081
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
