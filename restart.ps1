
#.\restart.ps1

Write-Host "Starting Minikube..."
& "C:\Program Files\Kubernetes\Minikube\minikube.exe" start

Write-Host "Setting Docker to use Minikube's internal daemon..."
& "C:\Program Files\Kubernetes\Minikube\minikube.exe" -p minikube docker-env --shell powershell | Invoke-Expression

Write-Host "Rebuilding Docker images (if needed)..."
docker build -t tweet-service ./tweet-service
docker build -t timeline-service ./timeline-service

kubectl apply -f k8s/dev/auth0-secret.yaml

Write-Host "Reapplying Kubernetes manifests..."
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/rabbitmq.yaml
kubectl apply -f k8s/dev/tweet-service-deployment-local.yaml
kubectl apply -f k8s/tweet-service.yaml
kubectl apply -f k8s/dev/timeline-service-deployment-local.yaml
kubectl apply -f k8s/timeline-service.yaml
kubectl apply -f k8s/ingress.yaml

Write-Host ""
Write-Host "Final Step: Start 'minikube tunnel' in a SEPARATE PowerShell window:"
Write-Host "------------------------------------------------------------"
Write-Host "& 'C:\Program Files\Kubernetes\Minikube\minikube.exe' tunnel"
Write-Host "------------------------------------------------------------"
Write-Host ""
Write-Host "Then visit: http://microservices.local/timeline/jaimy"

#curl http://microservices.local/timeline/jaimy
#curl -X POST http://microservices.local/tweets -H "Authorization: Bearer test" -H "Content-Type: application/json" -d "{\"text\":\"Hello from Minikube!\", \"author\":\"jaimy\"}"


