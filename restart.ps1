# .\restart.ps1

Write-Host "Starting Minikube..."
& "C:\Program Files\Kubernetes\Minikube\minikube.exe" start

Write-Host "Setting Docker to use Minikube's internal daemon..."
& "C:\Program Files\Kubernetes\Minikube\minikube.exe" -p minikube docker-env --shell powershell | Invoke-Expression

Write-Host "Rebuilding Docker images (if needed)..."
docker build -t tweet-service ./tweet-service
docker build -t timeline-service ./timeline-service
docker build -t user-service ./user-service
docker build -t api-gateway ./api-gateway

Write-Host "Applying Kubernetes secrets..."
kubectl apply -f k8s/dev/auth0-secret.yaml
kubectl apply -f k8s/dev/tweet-db-secret.yaml

Write-Host "Reapplying Kubernetes service & deployment manifests..."
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/rabbitmq.yaml

kubectl apply -f k8s\dev\api-gateway-deployment-local.yaml
kubectl apply -f k8s\api-gateway-service.yaml

kubectl apply -f k8s/dev/tweet-service-deployment-local.yaml
kubectl apply -f k8s/tweet-service.yaml

kubectl apply -f k8s/dev/timeline-service-deployment-local.yaml
kubectl apply -f k8s/timeline-service.yaml

kubectl apply -f k8s/dev/user-service-deployment-local.yaml
kubectl apply -f k8s/user-service.yaml

kubectl apply -f k8s/ingress.yaml

Write-Host "------------------------------------------------------------"
Write-Host "C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe tunnel"
Write-Host "------------------------------------------------------------"

# Example CURL tests (uncomment to run)
# curl http://microservices.local/timeline/jaimy
# curl -X POST http://microservices.local/tweets -H "Authorization: Bearer test" -H "Content-Type: application/json" -d "{\"text\":\"Hello from Minikube!\"}"
# curl http://microservices.local/user/consent -H "Authorization: Bearer <JWT>"
# curl -X POST http://microservices.local/user/consent -H "Authorization: Bearer <JWT>"
