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
                sh "npm run compile"
                sh "docker build -t 'galasa-vscode:latest' ."
                sh "docker tag 'galasa-vscode:latest docker.galasa.dev:galasa-vscode:latest"
                sh "docker push docker.galasa.dev:galasa-vscode:latest"
            }
        }
    }
}
