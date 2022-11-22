# Docker 部署 V2Ray

Docker 技术是一种新的虚拟化技术，和传统的虚拟化技术不同。V2Ray 同样提供 Docker 部署方式，并且通过 Docker 来部署 V2Ray 会非常轻松高效。

**Docker 只能部署在 KVM 或者 XEN 架构的 VPS 中**

首先安装 Docker：

```plain
$ sudo apt-get install -y docker
```

安装完 Docker 后我们从 [DockerHub](https://hub.docker.com/) 通过搜索找到 [V2Ray 官方提供的镜像](https://hub.docker.com/r/v2fly/v2fly-core)。找到拉取镜像的命令并复制下来，在网页右侧我们可以看到命令为 `docker pull v2fly/v2fly-core`，我们将其复制下来回到命令行中粘贴并执行：

```plain
$ sudo docker pull v2fly/v2fly-core
```

待 V2Ray 的 Docker 镜像拉取完成后就可以进入下一个部署阶段。在此之前，你需要在 `/etc` 目录下新建一个文件夹 `v2ray`（也可以在其他路径，Docker 有读写权限即可），并把你的配置写好后命名为 `config.json` 放入 `v2ray` 文件夹内。配置文件可以参考[这里的模板](https://github.com/v2fly/v2ray-examples)。待配置文件准备就绪后键入以下命令进行部署。部署前请记下配置文件中你所设置的端口号，在部署时需要将其映射到宿主机上，否则将无法访问。此处假设设定的端口号为 8888，需要映射到宿主机的 8888 端口上。`TZ` 变量根据你所在的时区设置。如果你的 `config.json` 不在 `/etc/v2ray` 下，则把 `-v /etc/v2ray:/etc/v2ray` 第一个路径改成你的 `config.json` 所在目录。完整命令为：

```plain
$ sudo docker run -d --name v2ray -e TZ=Asia/Shanghai -v /etc/v2ray:/etc/v2ray -p 8888:8888 --restart always v2fly/v2fly-core run -c /etc/v2ray/config.json
```

键入以上命令后，命令行会出现一串字符，代表容器部署成功，可以立即通过客户端连接并开始使用了。如果还不放心，键入以下命令来查看容器的运行状态：

```plain
$ sudo docker container ls
```

如果看到输出的结果中 `STATUS` 有 `UP` 字样则代表容器正在运行：

```plain
$ docker container ls
CONTAINER ID        IMAGE                 COMMAND                  CREATED             STATUS              PORTS                     NAMES
2a7sdo87kdf3        v2fly/v2fly-core      "/usr/bin/v2ray run …"   3 minutes ago       Up 3 minutes        0.0.0.0:8888->8888/tcp    v2ray
```

通过以下命令来启动 V2Ray：

```plain
$ sudo docker container start v2ray
```

停止 V2Ray：

```plain
$ sudo docker container stop v2ray
```

重启 V2Ray：

```plain
$ sudo docker container restart v2ray
```

查看日志：
```plain
$ sudo docker container logs v2ray
```

更新配置后，需要重新部署容器，命令如下：

```plain
$ sudo docker container stop v2ray
$ sudo docker container rm v2ray
$ sudo docker run -d --name v2ray -e TZ=Asia/Shanghai -v /etc/v2ray:/etc/v2ray -p 8888:8888 --restart always v2fly/v2fly-core run -c /etc/v2ray/config.json
```

假如你的配置换了端口号，那么相应的端口映射也要更改，假如你在配置文件中把监听端口改为了 9999，则 `-p` 参数应该这样写：
```plain
-p 9999:9999
```

假如你想将容器中的端口映射到本机的端口，则命令应该这样写

```plain
-p 127.0.0.1:端口号:端口号
```

如果 V2Ray 用的传输层协议是 mKCP，由于 mKCP 基于 UDP，那么需要指定映射的端口是 UDP：

```
-p 9999:9999/udp
```

**除非你打算使用 Nginx 来转发 Websocket 否则不需要映射到本地，直接填写`端口号:端口号`的形式即可**

另外，如果开启了动态端口，`-p` 标记可以多次使用来绑定多个端口。具体用法是在指令中再加上多个 `-p` 标记即可。

## 更新策略

### 手动更新

更新 V2Ray 的 Docker 镜像：
```
$ docker pull v2fly/v2fly-core
```
更新完之后，你需要重新部署容器，方法见上。

### 自动更新

如果你想让自己的 V2Ray 容器自动更新，无需手动部署。可以尝试 [watchtower](https://github.com/containrrr/watchtower).

**注意**：以下命令会让你的所有容器自动更新。如果想只更新 V2Ray，请参考 [containrrr.dev](https://containrrr.dev/watchtower/arguments/)
```
docker run -d \
    --name watchtower \
    -v /var/run/docker.sock:/var/run/docker.sock \
    containrrr/watchtower
```
