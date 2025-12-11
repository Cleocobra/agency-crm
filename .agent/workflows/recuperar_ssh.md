---
description: Como recuperar acesso SSH via Recovery Console na Digital Ocean
---

# Recuperando Acesso SSH (Digital Ocean)

O suporte informou que a porta 22 (SSH) está fechada. Vamos reabri-la usando o painel da Digital Ocean.

## 1. Abrir o Console de Emergência
1. Acesse sua conta na [Digital Ocean](https://cloud.digitalocean.com).
2. Clique no seu servidor (**Droplet**).
3. No menu lateral esquerdo, clique em **Access**.
4. Clique no botão azul **Launch Recovery Console** (ou "Launch Droplet Console").

Isso abrirá uma nova janela preta, simulando um monitor conectado direto no servidor.

## 2. Logar no Sistema
1. Na tela preta, ele pedirá `login:`. Digite `root` e tecle **Enter**.
2. Ele pedirá `Password:`. Digite sua senha de root (ela não aparece enquanto digita) e tecle **Enter**.

> **Nota:** Se você não lembra a senha de root, terá que resetá-la na aba "Access" do painel da Digital Ocean, opção "Reset Root Password".

## 3. Reiniciar o Serviço SSH
Uma vez logado, execute o comando para forçar o reinício do serviço de conexão:

```bash
systemctl restart sshd
```

Se não der erro, verifique o status:

```bash
systemctl status sshd
```
Você deve ver uma bolinha verde ou o texto **"Active: active (running)"**.

## 4. Verificar se a porta abriu (Opcional)
Se quiser ter certeza que a porta 22 está ouvindo, rode:
```bash
ss -tuln | grep 22
```
Se aparecer algo como `LISTEN ... :22`, está funcionando.

## 5. Testar Conexão do seu PC
Agora feche a janela do console e tente conectar do seu computador novamente:

```bash
ssh root@167.71.157.166
```

---
**Problemas comuns:**
- Se o comando `systemctl restart sshd` der erro, o arquivo de configuração pode estar corrompido.
- Nesse caso (ainda no console), edite o arquivo com `nano /etc/ssh/sshd_config`, verifique se não há caracteres estranhos e salve. Depois tente reiniciar de novo.
