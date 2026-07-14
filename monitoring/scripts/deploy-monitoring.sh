#!/bin/bash

set -e
set -o pipefail

echo "🚀 Starting Full Monitoring Deployment..."

PROJECT_ROOT="$(dirname "$(readlink -f "$0")")/.."
K8S_DIR="$PROJECT_ROOT/kubernetes"
DASH_DIR="$PROJECT_ROOT/dashboards-json"
MON_NAMESPACE="monitoring"

# Load secrets if available
if [ -f "$(dirname "$0")/secrets.sh" ]; then
    source "$(dirname "$0")/secrets.sh"
fi

if [ -z "$SLACK_WEBHOOK_URL" ]; then
    echo "❌ ERROR: SLACK_WEBHOOK_URL is not configured."
    echo "Please create scripts/secrets.sh"
    exit 1
fi

############################################
# Step 1 - AWS EBS CSI Driver
############################################

echo "Step 1: Installing AWS EBS CSI Driver..."

helm repo add aws-ebs-csi-driver https://kubernetes-sigs.github.io/aws-ebs-csi-driver || true
helm repo update

helm upgrade --install aws-ebs-csi-driver \
  aws-ebs-csi-driver/aws-ebs-csi-driver \
  --namespace kube-system

############################################
# Step 2 - Namespace & Base Resources
############################################

echo "Step 2: Creating Namespace and Storage..."

kubectl apply -f "$K8S_DIR/namespace.yaml"
kubectl apply -f "$K8S_DIR/storage-class.yaml"
kubectl apply -f "$K8S_DIR/tls-secret.yml"

############################################
# Step 3 - Sealed Secrets
############################################

echo "Step 3: Deploying Sealed Secrets..."

kubectl apply -f "$K8S_DIR/grafana-credentials-sealed-secret.yaml"
kubectl apply -f "$K8S_DIR/alert-manager-sealed-secret.yaml"

echo "Waiting for SealedSecrets to be unsealed..."
sleep 10

############################################
# Step 4 - Slack Webhook Secret
############################################

echo "Step 4: Creating Slack Webhook Secret..."

kubectl create secret generic slack-webhook-secret \
  --from-literal=webhook-url="$SLACK_WEBHOOK_URL" \
  -n "$MON_NAMESPACE" \
  --dry-run=client -o yaml | kubectl apply -f -

############################################
# Step 5 - Allow Helm to manage secrets
############################################

echo "Step 5: Preparing Existing Secrets for Helm..."

SECRETS=(
  "monitoring-secrets"
  "alertmanager-monitoring-stack-kube-prom-alertmanager"
)

for SECRET in "${SECRETS[@]}"; do

  kubectl label secret "$SECRET" \
    -n "$MON_NAMESPACE" \
    app.kubernetes.io/managed-by=Helm \
    --overwrite

  kubectl annotate secret "$SECRET" \
    -n "$MON_NAMESPACE" \
    meta.helm.sh/release-name=monitoring-stack \
    --overwrite

  kubectl annotate secret "$SECRET" \
    -n "$MON_NAMESPACE" \
    meta.helm.sh/release-namespace="$MON_NAMESPACE" \
    --overwrite

done

############################################
# Step 6 - Deploy kube-prometheus-stack
############################################

echo "Step 6: Deploying Monitoring Stack..."

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts || true
helm repo update

helm upgrade --install monitoring-stack \
  prometheus-community/kube-prometheus-stack \
  --namespace "$MON_NAMESPACE" \
  --create-namespace \
  -f "$K8S_DIR/main-values.yaml" \
  -f "$K8S_DIR/alerts-rules.yaml"

############################################
# Step 7 - Wait for Operator
############################################

echo "Waiting for Prometheus Operator..."

kubectl rollout status deployment/monitoring-stack-kube-prom-operator \
  -n "$MON_NAMESPACE" \
  --timeout=300s

############################################
# Step 8 - ServiceMonitor
############################################

echo "Step 8: Deploying ServiceMonitor..."

kubectl apply -f "$K8S_DIR/app-metrics-monitor.yaml"

############################################
# Step 9 - AlertmanagerConfig
############################################

echo "Step 9: Deploying AlertmanagerConfig..."

kubectl apply -f "$K8S_DIR/hospital-config-fixed.yaml"

############################################
# Step 10 - Ingress
############################################

echo "Step 10: Deploying Ingress..."

kubectl apply -f "$K8S_DIR/ingress.yml"

############################################
# Step 11 - Grafana Dashboards
############################################

echo "Step 11: Provisioning Grafana Dashboards..."

kubectl delete configmap hospital-dashboards \
  -n "$MON_NAMESPACE" \
  --ignore-not-found

kubectl create configmap hospital-dashboards \
  --from-file="$DASH_DIR/" \
  -n "$MON_NAMESPACE"

kubectl label configmap hospital-dashboards \
  grafana_dashboard=1 \
  -n "$MON_NAMESPACE" \
  --overwrite

############################################
# Done
############################################

echo ""
echo "-----------------------------------------------------------"
echo "✅ Monitoring Stack deployed successfully!"
echo "-----------------------------------------------------------"
echo ""
echo "Grafana:"
echo "https://nabd-hospital.nabawi.me/grafana-dashboard"
echo ""
echo "Prometheus:"
echo "https://nabd-hospital.nabawi.me/prom-dashboard"
echo ""
echo "Alertmanager:"
echo "https://nabd-hospital.nabawi.me/alert-dashboard"
echo ""
