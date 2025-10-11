# 🐳 Docker Installation Notes — Ubuntu 24.04 (Noble Numbat)

## 📘 Overview
- **OS:** Ubuntu 24.04 LTS (Noble Numbat)
- **Installation Method:** Manual repository setup (using Ubuntu Jammy repo)
- **User:** `sciusadmin`
- **Privileges:** Member of `sudo` and `docker`

---

## ⚙️ 1. Prepare the System

Update packages and install dependencies:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release
```

Create a keyring directory for Docker:

```bash
sudo mkdir -m 0755 -p /etc/apt/keyrings
```

---

## 🔐 2. Add Docker’s Official GPG Key

```bash
curl -fsSL https://download.docker.com/linux/debian/gpg | \
sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```

> Note: The key for Debian works for Ubuntu because Docker has not yet released a separate key for Ubuntu 24.04.

---

## 🧭 3. Add Docker Repository (Ubuntu Jammy)

Docker has not yet released a repository for Ubuntu “noble”,  
so we use the **“jammy” (22.04)** repository instead:

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu jammy stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

Update package index again:

```bash
sudo apt-get update
```

---

## 🧩 4. Install Docker Engine and Components

```bash
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

---

## 🔄 5. Enable and Start Docker Daemon

```bash
sudo systemctl enable docker
sudo systemctl start docker
```

Check status:
```bash
sudo systemctl status docker
```
Expected result: `active (running)`

---

## 👤 6. Allow Current User to Run Docker Without `sudo`

```bash
sudo usermod -aG docker $USER
newgrp docker
```

If still not effective, log out and log back in.  
Then verify:

```bash
groups
```

Expected output:
```
sciusadmin : sciusadmin sudo docker
```

---

## 🧪 7. Test Docker Installation

Run a test container:

```bash
docker run hello-world
```

Expected message:
```
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

---

## 🧰 8. Verify Versions

```bash
docker version
docker compose version
```

---

## ⚡ 9. (Optional) Reboot After Kernel Upgrade

If you see a “Pending kernel upgrade” message:

```bash
sudo reboot
```

---

## ✅ Final Summary

| Step | Description | Key Commands |
|------|--------------|--------------|
| 1 | Prepare dependencies | `apt-get update`, `apt-get install -y ca-certificates curl gnupg lsb-release` |
| 2 | Add Docker GPG key | `curl ... | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg` |
| 3 | Add Docker repo (Jammy) | `echo "deb [arch=...] ... jammy stable"` |
| 4 | Install Docker Engine | `apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin` |
| 5 | Enable and start daemon | `systemctl enable docker && systemctl start docker` |
| 6 | Add user to docker group | `usermod -aG docker $USER && newgrp docker` |
| 7 | Test Docker | `docker run hello-world` |
| 8 | Check versions | `docker version`, `docker compose version` |

---

### 🧾 Notes
- The `jammy` repository works well on Ubuntu 24.04 (noble) as a temporary workaround.
- Once Docker officially supports Ubuntu 24.04, you can safely switch the repository path from `jammy` → `noble`.

---

**Installation complete — Docker is now ready for use! 🐋**
