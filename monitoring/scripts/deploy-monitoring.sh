#!/bin/bash

# تأمين السكريبت: التوقف فوراً عند حدوث أي خطأ
set -e
set -o pipefail

echo "🚀 Starting Full Monitoring Deployment (with SealedSecrets)..."

# 1. تعريف المسارات
PROJECT_ROOT="../../monitoring-project"
K8S_DIR="$PROJECT_ROOT/kubernetes"
DASH_DIR="$PROJECT_ROOT/dashboards-json"
MON_NAMESPACE="monitoring"

# 2. تحديث AWS EBS CSI Driver
echo "Step 1: Updating AWS EBS CSI Driver..."
helm repo add aws-ebs-csi-driver https://kubernetes-sigs.github.io/aws-ebs-csi-driver || true
helm repo update
helm upgrade --install aws-ebs-csi-driver aws-ebs-csi-driver/aws-ebs-csi-driver --namespace kube-system

# 3. إنشاء البنية التحتية الأساسية
echo "Step 2: Applying Namespaces and StorageClasses..."
kubectl apply -f "$K8S_DIR/namespace.yaml"
kubectl apply -f "$K8S_DIR/storage-class.yaml"
kubectl apply -f "$K8S_DIR/tls-secret.yml"
kubectl apply -f "$K8S_DIR/ingress.yml"

# ---------------------------------------------------------
# 4. التعامل مع SealedSecrets و Helm Ownership
# ---------------------------------------------------------
echo "Step 3: Handling SealedSecrets..."

# تطبيق الـ SealedSecrets
kubectl apply -f "$K8S_DIR/grafana-credentials-sealed-secret.yaml"
kubectl apply -f "$K8S_DIR/alert-manager-sealed-secret.yaml"

echo "Waiting for SealedSecret controller to generate secrets..."
sleep 10  # ننتظر قليلاً لضمان تحويل SealedSecret إلى Secret عادي

echo "Labeling secrets to allow Helm to use them..."

# تعريف قائمة الأسرار التي تم نقلها لـ SealedSecrets
SECRETS=("monitoring-secrets" "alertmanager-monitoring-stack-kube-prom-alertmanager")

for SECRET in "${SECRETS[@]}"; do
  # إضافة الـ Label الذي يخبر Helm أن هذا السر يخصه
  kubectl label secret "$SECRET" -n "$MON_NAMESPACE" "app.kubernetes.io/managed-by=Helm" --overwrite

  # إضافة الـ Annotations التي تربط السر بإصدار Helm الحالي
  kubectl annotate secret "$SECRET" -n "$MON_NAMESPACE" "meta.helm.sh/release-name=monitoring-stack" --overwrite
  kubectl annotate secret "$SECRET" -n "$MON_NAMESPACE" "meta.helm.sh/release-namespace=$MON_NAMESPACE" --overwrite
done

# ---------------------------------------------------------
# 5. تحديث الـ Monitoring Stack
# ---------------------------------------------------------
echo "Step 4: Deploying Monitoring Stack..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts || true
helm repo update

# سيتم الآن التثبيت بنجاح لأن Helm سيعتقد أنه يمتلك الأسرار مسبقاً
helm upgrade --install monitoring-stack prometheus-community/kube-prometheus-stack \
  --namespace "$MON_NAMESPACE" \
  -f "$K8S_DIR/main-values.yaml" \
  -f "$K8S_DIR/alerts-rules.yaml"

# 6. ربط الأبلكيشن
echo "Step 5: Linking Hospital App via ServiceMonitor..."
kubectl apply -f "$K8S_DIR/app-metrics-monitor.yaml"

# 7. رفع الـ Dashboards
echo "Step 6: Provisioning Custom Dashboards..."
kubectl delete configmap hospital-dashboards -n "${MON_NAMESPACE}" --ignore-not-found
kubectl create configmap hospital-dashboards --from-file="${DASH_DIR}/" -n "${MON_NAMESPACE}"
kubectl label configmap hospital-dashboards grafana_dashboard=1 -n "${MON_NAMESPACE}"

echo "-------------------------------------------------------"
echo "✅ Deployment completed successfully with SealedSecrets!"
echo "-------------------------------------------------------"