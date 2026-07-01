#!/bin/bash

set -e

echo "===================================="
echo "🚀 Starting Kubernetes deployment"
echo "===================================="

echo "🧹 Deleting old workloads..."
kubectl delete -f ingress.yml --ignore-not-found=true
kubectl delete -f frontend.yml --ignore-not-found=true
kubectl delete -f chat-service.yml --ignore-not-found=true
kubectl delete -f iot-service.yml --ignore-not-found=true
kubectl delete -f core-service.yml --ignore-not-found=true
kubectl delete -f metric-servo-service.yml --ignore-not-found=true
kubectl delete -f auth-service.yml --ignore-not-found=true
kubectl delete -f chatbot.yml --ignore-not-found=true
kubectl delete -f mongodb.yml --ignore-not-found=true
kubectl delete -f redis.yml --ignore-not-found=true
kubectl delete -f tls-secret.yml --ignore-not-found=true
kubectl delete -f secret.yml --ignore-not-found=true
kubectl delete -f config-map.yml --ignore-not-found=true

echo "⏳ Waiting for old pods to terminate..."
sleep 4

echo "📦 Applying infrastructure..."
kubectl apply -f storage-class.yml
kubectl apply -f namespace.yml
kubectl apply -f mongo-init-job.yml
echo "🔐 Applying configs..."
kubectl apply -f config-map.yml
kubectl apply -f secret.yml
kubectl apply -f tls-secret.yml

echo "🗄️ Deploying database..."
kubectl apply -f mongodb.yml

echo "⏳ Waiting for MongoDB rollout..."
kubectl rollout status -n hospital-ns statefulset/mongodb-sfs --timeout=120s  || ture
kubectl exec -it -n hospital-ns mongodb-sfs-0 -- mongosh --eval 'rs.initiate({_id: "rs0", members: [{_id: 0, host: "mongodb-sfs-0.mongodb-headless-srv:27017", priority: 2}, {_id: 1, host: "mongodb-sfs-1.mongodb-headless-srv:27017"}, {_id: 2, host: "mongodb-sfs-2.mongodb-headless-srv:27017"}]})' || true

echo "🗄️ Deploying redis..."
kubectl apply -f redis.yml
kubectl rollout status -n hospital-ns deployment/redis-dep --timeout=120s  || ture

echo "🤖 Deploying backend services..."
kubectl apply -f chatbot.yml
kubectl apply -f auth-service.yml
kubectl apply -f core-service.yml
kubectl apply -f metric-servo-service.yml
kubectl apply -f iot-service.yml
kubectl apply -f chat-service.yml

echo "⏳ Waiting for backend rollouts..."
kubectl rollout status -n hospital-ns deployment/auth-service-dep --timeout=120s || true
kubectl rollout status -n hospital-ns deployment/core-service-dep --timeout=120s || true
kubectl rollout status -n hospital-ns deployment/metric-servo-service-dep --timeout=120s || true
kubectl rollout status -n hospital-ns deployment/iot-service-dep --timeout=120s || true
kubectl rollout status -n hospital-ns deployment/chat-service-dep --timeout=120s || true
kubectl rollout status -n hospital-ns deployment/chatbot-dep --timeout=120s || true

echo "🌐 Deploying frontend..."
kubectl apply -f frontend.yml
kubectl rollout status -n hospital-ns deployment/frontend-dep --timeout=120s || true

echo "🔗 Applying ingress..."
kubectl apply -f ingress.yml

echo "⏳ Waiting for ingress to stabilize..."
sleep 4

echo "===================================="
echo "✅ Deployment completed successfully"
echo "🌍 App should be available at:"
echo "https://nabd-hospital.nabawi.me/"
echo "===================================="