pipeline {
    agent {
        label 'codesigning'
    }
    environment {
        def workspace  = pwd()
    }
    stages {
        stage('GalasaVsPlugin') {
            steps {
                sh "npm install"
                sh "npm install node@latest"
                sh "npm install npm@latest"
                sh "npm install vscode@latest"
                sh "npm install vsce@latest"
                sh "npx vsce package"
                sh "docker build -t 'galasa-vscode:latest' ."
                sh "docker tag 'galasa-vscode:latest docker.galasa.dev:galasa-vscode:latest"
                sh "docker push docker.galasa.dev:galasa-vscode:latest"
            }
        }
    }
}
