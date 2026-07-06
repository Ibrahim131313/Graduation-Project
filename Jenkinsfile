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
                git branch: 'main',
                url: 'https://github.com/Ibrahim131313/Graduation-Project.git'
            }
        }

        stage("Set Environment Vars"){
            steps{
                script{
                    // تهيئة متغيرات الفحص لكل الخدمات كـ false في البداية
                    env.AUTH_CHANGED   = "false"
                    env.CORE_CHANGED   = "false"
                    env.CHAT_CHANGED   = "false"
                    env.METRIC_CHANGED = "false"
                    env.BOT_CHANGED    = "false"
                    env.IOT_CHANGED    = "false"
                    env.FRONT_CHANGED  = "false"
                }
            }
        }

        stage("Detect Changes"){
            steps{
                script {
                    echo "🔍 Starting microservices change detection logic..."
                    // جلب قائمة الملفات المتغيرة في آخر Commit
                    def changes = sh(script: "git diff --name-only HEAD~1 HEAD", returnStdout: true).trim()
                    echo "Files changed in last commit:\n${changes}"
                    
                    // الفحص بناءً على مسار كل خدمة في الريبو
                    if (changes.contains("services/auth-service/")){ env.AUTH_CHANGED = "true" }
                    if (changes.contains("services/core-service/")){ env.CORE_CHANGED = "true" }
                    if (changes.contains("services/chat-service/")){ env.CHAT_CHANGED = "true" }
                    if (changes.contains("services/metric-servo-service/")){ env.METRIC_CHANGED = "true" }
                    if (changes.contains("Medical-ChatBot-main/")){ env.BOT_CHANGED = "true" }
                    if (changes.contains("services/iot-service/")){ env.IOT_CHANGED = "true" }
                    if (changes.contains("frontend/")){ env.FRONT_CHANGED = "true" }
                }
            }
        }

        stage ('Docker login') {
            // الـ Login هيشتغل فقط لو فيه تغيير في أي خدمة منعاً لعمل لوجن بدون داعي
            when { expression { 
                return env.AUTH_CHANGED == "true" || env.CORE_CHANGED == "true" || 
                       env.CHAT_CHANGED == "true" || env.METRIC_CHANGED == "true" || 
                       env.BOT_CHANGED == "true"  || env.IOT_CHANGED == "true" || 
                       env.FRONT_CHANGED == "true"
            }}
            steps {
                withCredentials([usernamePassword(credentialsId : 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]){
                    sh 'echo "$DOCKER_PASS" | docker login -u $DOCKER_USER --password-stdin'
                }
            }
        }

        stage ('Build & Push Services') {
            steps {
                script {
                    // 1. Auth Service
                    if (env.AUTH_CHANGED == "true") {
                        echo "🚀 Building Auth Service..."
                        sh "docker build -t \$AUTH_IMAGE:\$IMAGE_TAG ./services/auth-service"
                        sh "docker push \$AUTH_IMAGE:\$IMAGE_TAG"
                    }
                    
                    // 2. Core Service
                    if (env.CORE_CHANGED == "true") {
                        echo "🚀 Building Core Service..."
                        sh "docker build -t \$CORE_IMAGE:\$IMAGE_TAG ./services/core-service"
                        sh "docker push \$CORE_IMAGE:\$IMAGE_TAG"
                    }

                    // 3. Chat Service
                    if (env.CHAT_CHANGED == "true") {
                        echo "🚀 Building Chat Service..."
                        sh "docker build -t \$CHAT_IMAGE:\$IMAGE_TAG ./services/chat-service"
                        sh "docker push \$CHAT_IMAGE:\$IMAGE_TAG"
                    }

                    // 4. Metric Servo Service
                    if (env.METRIC_CHANGED == "true") {
                        echo "🚀 Building Metric Servo Service..."
                        sh "docker build -t \$METRIC_IMAGE:\$IMAGE_TAG ./services/metric-servo-service"
                        sh "docker push \$METRIC_IMAGE:\$IMAGE_TAG"
                    }

                    // 5. Medical Chatbot
                    if (env.BOT_CHANGED == "true") {
                        echo "🚀 Building Medical Chatbot..."
                        sh "docker build -t \$BOT_IMAGE:\$IMAGE_TAG ./Medical-ChatBot-main"
                        sh "docker push \$BOT_IMAGE:\$IMAGE_TAG"
                    }

                    // 6. IoT Service
                    if (env.IOT_CHANGED == "true") {
                        echo "🚀 Building IoT Service..."
                        sh "docker build -t \$IOT_IMAGE:\$IMAGE_TAG ./services/iot-service"
                        sh "docker push \$IOT_IMAGE:\$IMAGE_TAG"
                    }

                    // 7. Frontend
                    if (env.FRONT_CHANGED == "true") {
                        echo "🚀 Building Frontend..."
                        sh "docker build -t \$FRONT_IMAGE:\$IMAGE_TAG -f ./frontend/Dockerfile.microservices ./frontend"
                        sh "docker push \$FRONT_IMAGE:\$IMAGE_TAG"
                    }
                }
            }
        }

        stage ('Inject Secrets & Run Deploy Script') {
            steps {
                script {
                    echo "🔐 Applying Sealed Secrets and Namespace..."
                    sh "kubectl apply -f k8s/namespace.yml"
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

        stage('Deploy Monitoring Stack') {
            steps {
                script {
                    echo "📊 Running Monitoring Script directly..."
                    dir('monitoring') {
                        sh "chmod +x scripts/delete.sh deploy-monitoring.sh || chmod +x scripts/*.sh || true"
                        sh "bash scripts/delete.sh"
                        sh "SLACK_WEBHOOK_URL='https://dummy-url.com' bash scripts/deploy-monitoring.sh"
                    }
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
