pipeline {
    agent any
    stages {
        stage('Build & Test') {
            steps {
                // We removed -DskipTests so the Selenium test runs now!
                sh 'mvn clean package' 
            }
        }
        stage('Deploy') {
            steps {
                sh 'docker rm -f rf-sim-container || true'
                sh 'docker run -d -p 80:8081 --name rf-sim-container rf-simulator:latest'
                // THE FIX: This deletes old images so your disk never fills up again!
                sh 'docker image prune -f' 
            }
        }
    }
}
