pipeline {
    agent any
    tools {
        maven 'M3'
        jdk 'JAVA_HOME'
    }
    stages {
        stage('Build & Test') {
            steps {
                sh 'mvn clean package -DskipTests' // Creates the .jar file
            }
        }
        stage('Docker Build') {
            steps {
                // Build the image and tag it as 'rf-simulator'
                sh 'docker build -t rf-simulator:latest .'
            }
        }
    }
}
