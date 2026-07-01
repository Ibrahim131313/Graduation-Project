helm uninstall monitoring-stack -n monitoring || true

kubectl delete namespace monitoring --ignore-not-found
kubectl delete sealedsecret --all -n monitoring --ignore-not-found