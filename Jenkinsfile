pipeline {
    agent {
        label 'k8s-node'
    } 

    environment {
        DOCKER_HUB_USERNAME = 'ebrahimmohammed'
        IMAGE_TAG = "${BUILD_NUMBER}"
        AUTH_IMAGE = "${DOCKER_HUB_USERNAME}/hospital-auth-service"
        CORE_IMAGE = "${DOCKER_HUB_USERNAME}/hospital-core-service"
        CHAT_IMAGE = "${DOCKER_HUB_USERNAME}/hospital-chat-service"
        BOT_IMAGE = "${DOCKER_HUB_USERNAME}/hospital-medical-chatbot"
        IOT_IMAGE = "${DOCKER_HUB_USERNAME}/hospital-iot-service"
        METRIC_IMAGE = "${DOCKER_HUB_USERNAME}/hospital-metric-servo-service"
        FRONT_IMAGE = "${DOCKER_HUB_USERNAME}/hospital-frontend"
        NAMESPACE = 'hospital-ns'
    }

    stages {
        stage ('Checkout Code') {
            steps {
                git branch: 'main' ,
                url: 'https://github.com/Ibrahim131313/Graduation-Project.git'
            }
        }

        stage ('Docker login') {
            steps {
                withCredentials([usernamePassword(credentialsId : 'dockerhub-creds' , usernameVariable: 'DOCKER_USER' , passwordVariable: 'DOCKER_PASS')]){
                    sh 'echo "$DOCKER_PASS" | docker login -u $DOCKER_USER --password-stdin'
                }
            }
        }

        stage ('Build & Push Services') {
            steps {
                sh """
                docker build -t \$AUTH_IMAGE:\$IMAGE_TAG ./services/auth-service
                docker push \$AUTH_IMAGE:\$IMAGE_TAG

                docker build -t \$CORE_IMAGE:\$IMAGE_TAG ./services/core-service
                docker push \$CORE_IMAGE:\$IMAGE_TAG

                docker build -t \$CHAT_IMAGE:\$IMAGE_TAG ./services/chat-service
                docker push \$CHAT_IMAGE:\$IMAGE_TAG

                docker build -t \$METRIC_IMAGE:\$IMAGE_TAG ./services/metric-servo-service
                docker push \$METRIC_IMAGE:\$IMAGE_TAG

                docker build -t \$BOT_IMAGE:\$IMAGE_TAG ./Medical-ChatBot-main
                docker push \$BOT_IMAGE:\$IMAGE_TAG

                docker build -t \$IOT_IMAGE:\$IMAGE_TAG ./services/iot-service
                docker push \$IOT_IMAGE:\$IMAGE_TAG

                docker build -t \$FRONT_IMAGE:\$IMAGE_TAG -f ./frontend/Dockerfile.microservices ./frontend
                docker push \$FRONT_IMAGE:\$IMAGE_TAG
                """
            }
        }

        stage ('Inject Secrets & Run Deploy Script') {
            steps {
                script {
                    echo "🔐 Applying Sealed Secrets and Namespace..."
                    sh "kubectl apply -f k8s/namespace.yml"
                    
                    // تطبيق ملف الـ SealedSecret مباشرة من مكانه
                    sh "kubectl apply -f k8s/secret.yml"

                    echo "🚀 Invoking the deploy script..."
                    sh """
                    cd k8s
                    chmod +x deploy.sh
                    IMAGE_TAG=${IMAGE_TAG} bash deploy.sh
                    """
                }
            }
        }
    }

    post {
        always {
            echo "Cleaning up Docker images..."
            sh 'docker logout || true'
            sh 'docker image prune -f'
        }

        success {
            echo "🎉 Smart Hospital System updated successfully via Jenkins Master-Agent Architecture!"
        }

        failure {
            echo "❌ Deployment failed! Please inspect the logs using: kubectl get pods -n hospital-ns."
        }
    }
}
