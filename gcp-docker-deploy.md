# 🚀 GCP Deploy with Docker Compose (Images only)

## 🎯 เป้าหมาย
- ไม่เอา source code ขึ้น VM  
- Build image ที่ Local / Cloud Shell → push เข้า Artifact Registry  
- บน VM แค่ `docker compose pull && up -d`  

> **Tip:** frontend ควรกำหนด `BASE_URL = /api` หรือเรียก API แบบ relative path เพื่อให้ผ่าน Nginx proxy

---

## 0) เตรียมฝั่ง Local (Windows / PowerShell)

### ติดตั้ง
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)  
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)  

### ตรวจสอบ
```powershell
gcloud version
docker version
```

### เลือก Project และ Login
```powershell
gcloud auth login
gcloud config set project my-project-308492-gcp
```

### เปิดใช้ Artifact Registry
```powershell
gcloud services enable artifactregistry.googleapis.com
gcloud artifacts repositories create my-repo --repository-format=docker --location=asia-southeast1
gcloud auth configure-docker asia-southeast1-docker.pkg.dev
```

### Build & Push Images
```powershell
docker build -t asia-southeast1-docker.pkg.dev/my-project-308492-gcp/my-repo/frontend:1.0 ./frontend
docker build -t asia-southeast1-docker.pkg.dev/my-project-308492-gcp/my-repo/backend:1.0  ./backendNest

docker push asia-southeast1-docker.pkg.dev/my-project-308492-gcp/my-repo/frontend:1.0
docker push asia-southeast1-docker.pkg.dev/my-project-308492-gcp/my-repo/backend:1.0
```

---

## 1) สร้าง VM + Firewall

```bash
gcloud compute instances create webstack-1 \
  --machine-type=e2-medium \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --boot-disk-size=30GB \
  --boot-disk-type=pd-balanced \
  --tags=web \
  --zone=asia-southeast1-b
```

เปิดพอร์ต:
```bash
gcloud compute firewall-rules create allow-http-https \
  --allow=tcp:80,tcp:443 \
  --target-tags=web
```

เข้า VM:
```bash
gcloud compute ssh webstack-1 --zone=asia-southeast1-b
```

---

## 2) ติดตั้ง Docker บน VM

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \\
https://download.docker.com/linux/debian $(lsb_release -cs) stable" | \\
sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

sudo usermod -aG docker $USER
newgrp docker
```

Auth:
```bash
gcloud auth login --no-launch-browser
gcloud config set project my-project-308492-gcp
gcloud auth configure-docker asia-southeast1-docker.pkg.dev
```

---

## 3) เตรียมไฟล์ Compose + Nginx บน VM

```bash
mkdir -p ~/app/nginx
cd ~/app
nano docker-compose.prod.yml
```

**docker-compose.prod.yml**
```yaml
services:
  frontend-prod:
    image: asia-southeast1-docker.pkg.dev/my-project-308492-gcp/my-repo/frontend:1.0
    restart: unless-stopped
    networks: [ webnet ]

  backend-prod:
    image: asia-southeast1-docker.pkg.dev/my-project-308492-gcp/my-repo/backend:1.0
    restart: unless-stopped
    networks: [ webnet ]

  nginx-prod:
    image: nginx:1.27-alpine
    ports: [ "80:80" ]
    volumes:
      - ./nginx/default.prod.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - frontend-prod
      - backend-prod
    restart: unless-stopped
    networks: [ webnet ]

networks:
  webnet:
```

**nginx/default.prod.conf**
```nginx
upstream frontend_upstream { server frontend-prod:80; }
upstream backend_upstream  { server backend-prod:4001; }

map $http_upgrade $connection_upgrade {
  default upgrade;
  ''      close;
}

server {
  listen 80;
  server_name _;

  location /api/ {
    proxy_pass http://backend_upstream;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /ws {
    proxy_pass http://backend_upstream;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
  }

  location / {
    proxy_pass http://frontend_upstream;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

---

## 4) ดึงภาพและรัน

```bash
cd ~/app
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker ps
```

หา IP:
```bash
gcloud compute instances list
```

เปิดเบราว์เซอร์ → `http://<EXTERNAL_IP>`

---

## 5) อัปเดตเวอร์ชันใหม่

Local:
```powershell
docker build -t asia-southeast1-docker.pkg.dev/my-project-308492-gcp/my-repo/frontend:1.1 ./frontend
docker push  asia-southeast1-docker.pkg.dev/my-project-308492-gcp/my-repo/frontend:1.1
```

VM:
```bash
cd ~/app
nano docker-compose.prod.yml   # เปลี่ยน tag frontend → 1.1
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

---

## 6) Debug & ตรวจสอบ

```bash
docker compose -f docker-compose.prod.yml ps
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'

curl -I http://localhost/
curl -I http://localhost/api/auth/login || true

docker logs -n 200 $(docker ps --format '{{.Names}}' | grep nginx)
docker exec -it app-backend-prod-1 ss -tlnp
```
