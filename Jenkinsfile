pipeline {
    agent {
        label 'codesigning'
    }
    environment {
        def workspace  = pwd()
    }
    stage('GalasaVsPlugin') {
        def vscodePackageJson = readJSON file: "package.json"
        def version = "v${vscodePackageJson.version}"
        def versionName = "vscode-extension-for-galasa-v${vscodePackageJson.version}"
        sh "npx vsce package -o ${versionName}.vsix"

        withCredentials([usernamePassword(credentialsId: 'public-github-cicsdeliverytest', usernameVariable: 'USERNAME', passwordVariable: 'TOKEN')]) {
            def releaseAPI = "repos/galasa-dev/vscode/releases"
            def releaseDetails = "{\"tag_name\":\"$version\",\"target_commitish\":\"master\",\"name\":\"$version\",\"body\":\"Changes\",\"draft\":false,\"prerelease\":false}"
            def releaseUrl = "https://$TOKEN:x-oauth-basic@api.github.com/${releaseAPI}"

            def releaseCreated = sh(returnStdout: true, script: "curl -H \"Content-Type: application/json\" -X POST -d '${releaseDetails}' ${releaseUrl}").trim()
            def releaseParsed = readJSON text: releaseCreated
            
            def uploadUrl = "https://$TOKEN:x-oauth-basic@uploads.github.com/${releaseAPI}/${releaseParsed.id}/assets?name=${versionName}.vsix"
            sh "curl -X POST --data-binary @${versionName}.vsix -H \"Content-Type: application/octet-stream\" ${uploadUrl}"
        }
    }
}
