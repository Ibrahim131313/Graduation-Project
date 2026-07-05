#!/bin/bash
echo "🛑 Cleaning up monitoring stack..."


helm uninstall monitoring-stack -n monitoring --ignore-not-found


kubectl delete namespace monitoring --ignore-not-found

echo "✅ Cleanup completed successfully."
