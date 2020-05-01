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
                sh "npm install vscode"
                sh "npm install vsce"
                sh "npx vsce package"
                sh "docker build -t 'galasa-vscode:latest' ."
                sh "docker tag 'galasa-vscode:latest docker.galasa.dev:galasa-vscode:latest"
                sh "docker push docker.galasa.dev:galasa-vscode:latest"
            }
        }
    }
}
