# Docker 部署 V2Ray

> 原文档请移步 [Docker 部署 V2Ray](https://toutyrater.github.io/app/docker-deploy-v2ray.html)

在阅读本内容时，本文档假定你已经熟悉 Docker，同时准备好了 Docker 环境。如果你还不熟悉 Docker ，请阅读 [Docker Engine overview](https://docs.docker.com/engine/) 。如果你还没有 Docker 环境，请参考 [Install Docker Engine](https://docs.docker.com/engine/install/) 。本文档不再阐述 Docker 的安装步骤和 Docker 的基础操作，因为这些内容并不符合该篇的主题。

## 1、社区 Docker 镜像

社区已经提供了预编译 Docker Image ：

[v2fly/v2ray-core](https://hub.docker.com/r/v2fly/v2fly-core)：其中 latest 标签会跟随 [v2fly](https://github.com/v2fly/docker) 编译仓库提交保持最新，而各个版本以 tag 方式发布，比如 `4.27.0` 。

Docker Image 的文件结构：

- `/etc/v2ray/config.json`：配置文件
- `/usr/bin/v2ray/v2ray`：V2Ray 主程序
- `/usr/bin/v2ray/v2ctl`：V2Ray 辅助工具
- `/usr/bin/share/v2ray/geoip.dat`：IP 数据文件
- `/usr/bin/share/v2ray/geosite.dat`：域名数据文件

## 2、Docker 部署服务

**注意：**以下示例操作环境为 Linux ，Windows 下可能会有区别。

### 2.1 拉取 V2Ray 镜像

从 [Docker Hub](https://hub.docker.com/r/v2fly/v2fly-core) 拉取镜像。默认是最新版本镜像( `v2fly/v2ray-core:latest` )，如需使用老版本，请在镜像名称后面加版本号，如 `v2fly/v2ray-core:4.27.0`

```bash
docker pull v2fly/v2ray-core
```

说明：`docker pull` 为拉取镜像命令，后接镜像名称。如果拉取过程特别慢，请自行配置 Docker 国内加速源。

查看已拉取到的镜像

```bash
docker images | grep v2ray
```

说明：

- `docker images` ：是查看已拉取的 Docker 镜像
- `| grep v2ray` ：是从上一条命令的输出结果中过滤带有 `v2ray` 关键词的行。

### 2.2 运行 V2Ray 服务

由于需要将配置传入容器中，所以请先准备好你的配置文件，然后在运行 Docker 容器的时，将其挂在到 Docker 容器中。

演示配置文件 `config.json`：

```json
{
    "log": {
        "loglevel": "warnning"
    },
    "inbounds": [
        {
            "port": 1080, // SOCKS 代理端口，在浏览器中需配置代理并指向这个端口
            "listen": "127.0.0.1",
            "protocol": "socks",
            "settings": {
                "udp": true
            }
        }
    ],
    "outbounds": [
        {
            "protocol": "vmess",
            "settings": {
                "vnext": [
                    {
                        "address": "server", // 服务器地址，请修改为你自己的服务器 ip 或域名
                        "port": 10086, // 服务器端口
                        "users": [
                            {
                                "id": "b831381d-6324-4d53-ad4f-8cda48b30811"
                            }
                        ]
                    }
                ]
            }
        },
        {
            "protocol": "freedom",
            "tag": "direct"
        }
    ],
    "routing": {}
}
```

**警告：**上述配置文件内容是演示示例，请勿在真实中使用！

**注意：**配置文件建议开启 `log` ，同时将日志调整到 `warnning` 级别。方便后续调试。

运行 Docker 容器

```bash
docker run \
    -d \
    --name v2ray \
    -v /usr/local/etc/v2ray/config.json:/etc/v2ray/config.json \
    -p 10086:10086 \
    v2fly/v2ray-core
```

说明：

- `docker run` ：是运行一个 Docker 容器
- `-d` ：是指定该容器在后台运行。没有该参数，容器会以前台运行。
- `--name v2ray` ：是指定这个容器的名称为 `v2ray`
- `-v /usr/local/etc/v2ray/config.json:/etc/v2ray/config.json` ：是将本地文件 `/usr/local/etc/v2ray/config.json` 通过卷（volumn）的方式挂在到容器内部，以便容器内的 `v2ray` 命令能读取用户配置。根据 [v2fly/v2ray-core](https://hub.docker.com/r/v2fly/v2fly-core) 镜像中的文件结构，容器启动时默认读取配置文件是 `/etc/v2ray/config.json` ，所以需要将配置文件挂在到此位置。冒号 `:` 用来分割容器内外文件路径位置。如果你的配置文件在 `/etc/v2ray/config.json` ，则需要修改为 `-v /etc/v2ray/config.json:/etc/v2ray/config.json` 。
- `-p 1080:10086` ：是指将本机的 `1080` 端口映射到容器内部的 `10086` 端口。配置文件中指定服务的端口为 `10086` 。冒号右边是容器中服务启动的端口，即你配置文件中指定的端口，冒号左边是你需要在本机开放的端口。如果你的浏览器需要访问 `8080` 来使用代理，则需要修改参数为 `-p 8080:10086` 。如果你修改了配置文件中的端口为 `9090` ，则需要修改参数为 `-p 8080:9090` 。如果使用了 udp 协议，则需要修改为 `-p 8080:9090/udp` 。
- `v2fly/v2ray-core` ：为启动服务的镜像名称。

启动完成后，可以查看已启动的容器：

```bash
docker ps
```

如果发现没有名称为 v2ray 的容器，可以查看所有容器：

```bash
docker ps -a
```

说明：

- `docker ps` ：列出容器
- `-a` ：列出所有容器
- 输出结果容器有 `CONTAINER ID` 、 `NAMES` 、 `STATUS` 等列，在查看容器时，可以通过传入容器 id 或者容器名称。

### 2.3 停止 V2Ray 服务

如需停止 V2Ray 服务，直接将容器停止即可。

```bash
docker stop v2ray
```

说明：停止命令后面可以跟容器名称，或者容器 id 。请使用 `docker ps` 列出所有运行的容器，如果容器没有启动，需要使用 `docker ps -a` 列出所有容器。

如果不需要 V2Ray 可以将其删除。

```bash
docker rm v2ray
```

### 2.4 重启 V2Ray 服务

在修改过配置文件内容后，直接重启容器，即可重启服务。

```bash
docker restart v2ray
```

说明：停止命令后面可以跟容器名称，或者容器 id 。

### 2.5 更新程序

首先强制删除容器：

```bash
docker rm -f v2ray
```

然后拉取最新版本容器：

```bash
docker pull v2fly/v2ray-core
```

最后再运行容器：

```bash
docker run \
    -d \
    --name v2ray \
    -v /usr/local/etc/v2ray/config.json:/etc/v2ray/config.json \
    -p 10086:10086 \
    v2fly/v2ray-core
```

### 2.6 常见问题

在根据下列常见问题中的步骤操作前，请在配置文件中启用 [Log](https://www.v2fly.org/config/overview.html#logobject) 。指定 `loglevel` 为 `debug`，不需要设置访问路径。

#### 2.6.1 服务无法启动

**问题表现：**

- 容器无法启动

容器无法启动，多半是由于配置文件错误引起的。也可能是挂载出了问题。

**可能出现的情况：**

```plain
docker run \
    -d \
    --name v2ray \
    -v config.json:/etc/v2ray/config.json \  
    -p 10086:10086 \
    v2fly/v2ray-core

V2Ray 4.21.4 (v4.21.5-7-g63b7eeac) docker-fly
A unified platform for anti-censorship.
main: failed to load config: /etc/v2ray/config.json > v2ray.com/core/main/confloader/external: failed to load config file: /etc/v2ray/config.json > read /etc/v2ray/config.json: is a directory
```

上述问题为 `-v` 使用了相对路径，导致容器内的程序找不到挂载的配置文件。

**解决方法：**

首先删除启动失败的容器：

```bash
docker rm v2ray
```

使用绝对路径 `-v /etc/v2ray/config.json:/etc/v2ray/config.json` 挂载文件。

```bash
docker run \
    -d \
    --name v2ray \
    -v /usr/local/etc/v2ray/config.json:/etc/v2ray/config.json \
    -p 10086:10086 \
    v2fly/v2ray-core
```

#### 2.6.2 服务正常启动，但代理不能用

**问题表现：**

- 容器正常启动 `docker ps` ，有该容器
- 浏览器代理配置正确
- 浏览器无法通过代理访问网页。

这种情况可能是由于配置问题导致的，查看服务日志尝试排查。

启用配置文件[日志]((https://www.v2fly.org/config/overview.html#logobject))，将日志级别调整为 `debug` 。查看近 100 行日志。

```bash
docker logs --tail 100 v2ray
```

说明：`--tail 100` 为查看进 100 行日志。如果要持续查看输入日志，可以使用 `docker logs -f v2ray` 。

根据日志，诊断问题，如果调整了配置文件，则需要重启服务。

如果发现使用代理时，没有日志输出，则需要检查启动容器时，命令中指定的容器的端口是否和配置文件中指定的端口一致。

其他未解决问题可在社区发起讨论。

## 3. docker-compose 部署服务

**注意：**以下示例操作环境为 Linux ， Windows 下可能会有区别。

本文假定你熟悉 Compose 并且已经有了 Compose 环境。如果你还不了解 Compose ，请阅读 [Overview of Docker Compose](https://docs.docker.com/compose/) 。如果你还没有 Docker Compose 环境，请参阅 [Install Docker Compose](https://docs.docker.com/compose/install/) 内容安装。

### 3.1 编写 docker-compose 文件

关于如何编写 compose 文件，请参阅 [Compose file version 3 reference](https://docs.docker.com/compose/compose-file/)

编写 `docker-compose.yaml` 文件

```yaml
version: "3.7"

services:
  v2ray:
    image: v2fly/v2fly-core
    container_name: v2ray
    volumes:
      - /usr/local/etc/v2ray/config.json:/etc/v2ray/config.json
    ports:
      - 1080:10086

networks:
  default:
    name: v2ray
```

说明：

- `volumes` ：表示要挂载到容器内的卷，意思是将本地 `/usr/local/etc/v2ray/config.json` 配置文件挂载到容器内 `/etc/v2ray/config.json` 位置。
- `ports` ：表示将本地端口 `1080` 映射到容器内的 `10086` 端口。容器内的端口应该和传入配置文件中的端口一致。

演示配置文件 `config.json`：

```json
{
    "log": {
        "loglevel": "warnning"
    },
    "inbounds": [
        {
            "port": 1080, // SOCKS 代理端口，在浏览器中需配置代理并指向这个端口
            "listen": "127.0.0.1",
            "protocol": "socks",
            "settings": {
                "udp": true
            }
        }
    ],
    "outbounds": [
        {
            "protocol": "vmess",
            "settings": {
                "vnext": [
                    {
                        "address": "server", // 服务器地址，请修改为你自己的服务器 ip 或域名
                        "port": 10086, // 服务器端口
                        "users": [
                            {
                                "id": "b831381d-6324-4d53-ad4f-8cda48b30811"
                            }
                        ]
                    }
                ]
            }
        },
        {
            "protocol": "freedom",
            "tag": "direct"
        }
    ],
    "routing": {}
}
```

**警告：**上述配置文件内容是演示示例，请勿在真实中使用！

**注意：**配置文件建议开启 `log` ，同时将日志调整到 `warnning` 级别。方便后续调试。

### 3.2 启动 V2Ray 服务

在 `docker-compose.yaml` 文件所在目录执行：

```bash
docker-compose up -d
```

如果在其他位置执行也可以使用 `docker-compose -f /tmp/v2ray/docker-compose.yaml up -d`

### 3.3 停止 V2Ray 服务

在 `docker-compose.yaml` 文件所在目录执行：

```bash
docker-compose stop
```

如果不需要 V2Ray 了，可以将其删除

```bash
docker-compose down
```

### 3.4 重启 V2Ray 服务

修改配置文件后，可以重启服务生效。

```bash
docker-compose restart
```
