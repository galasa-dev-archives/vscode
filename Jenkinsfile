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
                sh "npm install vsce"
                sh "npm run vscode:prepublish"
                sh "npx vsce package"
                sh "docker build -t 'galasa-vscode:latest' ."
                sh "docker tag 'galasa-vscode:latest docker.galasa.dev:galasa-vscode:latest"
                sh "docker push docker.galasa.dev:galasa-vscode:latest"
            }
        }
    }
}
