pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from version control...'
                checkout scm
            }
        }

        stage('Build & Test Backend') {
            steps {
                echo 'Installing Backend Dependencies...'
                dir('server') {
                    sh 'npm install'
                    // Add test commands here if available (e.g., npm test)
                }
            }
        }

        stage('Build & Test Frontend') {
            steps {
                echo 'Installing Frontend Dependencies & Building...'
                dir('client') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Build Maven Module') {
            steps {
                echo 'Building Maven Demo Service...'
                dir('demo-maven-service') {
                    sh 'mvn clean package'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Building Docker Images...'
                sh 'docker compose build'
            }
        }

        stage('Deploy Containers') {
            steps {
                echo 'Deploying application using Docker Compose...'
                sh 'docker compose up -d'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully! All containers are running.'
        }
        failure {
            echo 'Pipeline failed! Please check the logs.'
        }
    }
}
