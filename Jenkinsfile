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
                sh "npm install -g node@latest"
                sh "npm install -g npm@latest"
                sh "npm install -g vscode@latest"
                sh "npm install -g vsce@latest"
                sh "npx vsce package"
                sh "docker build -t 'galasa-vscode:latest' ."
                sh "docker tag 'galasa-vscode:latest docker.galasa.dev:galasa-vscode:latest"
                sh "docker push docker.galasa.dev:galasa-vscode:latest"
            }
        }
    }
}
