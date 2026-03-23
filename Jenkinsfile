pipeline {
    agent any

    environment {
        // Defines the image name for consistency across stages
        IMAGE_NAME = "rf-simulator:latest"
        CONTAINER_NAME = "rf-sim-container"
    }

    stages {
        stage('Build & Test') {
            steps {
                echo '🚀 Compiling Java Backend and Executing Selenium Quality Gates...'
                // This runs both the code compilation and your SdrUiTest.java
                sh 'mvn clean package'
            }
        }

        stage('Deploy') {
            steps {
                echo '📦 Orchestrating Docker Deployment to AWS EC2...'
                // Stop and remove the old container if it exists
                sh "docker rm -f ${CONTAINER_NAME} || true"
                
                // Launch the new mission-ready container on Port 80
                sh "docker run -d -p 80:8081 --name ${CONTAINER_NAME} ${IMAGE_NAME}"
            }
        }
    }

    post {
        always {
            echo '📊 Archiving Test Metrics and Cleaning Infrastructure...'
            
            // 1. ARCHIVE JUNIT RESULTS
            // This creates the "Test Result Trend" graph in the Jenkins UI
            // Direct alignment with KBR "Maintain detailed test documentation" requirement
            junit '**/target/surefire-reports/*.xml'

            // 2. DISK MANAGEMENT
            // Prunes old Docker layers to prevent the "Disk Exhaustion" errors we solved earlier
            sh 'docker image prune -f'
            
            // 3. WORKSPACE CLEANUP (Optional but recommended for t3.micro)
            cleanWs()
        }
        
        success {
            echo '✅ MISSION SUCCESS: UI Validated and SDR Engine Deployed.'
        }

        failure {
            echo '❌ MISSION FAILURE: Quality Gate failed. Deployment aborted.'
        }
    }
}