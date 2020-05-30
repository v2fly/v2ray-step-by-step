# 挂载 Tinc 局域网节点
::: warning
本篇配置示例基于 CentOS 8，请酌情修改。
:::
现在普遍使用 Cloudflare 的 CDN 来防止 GFW 对 IP 屏蔽，但是目前 Cloudflare 已经对这种用途流量转发早已不堪重负，特别是到晚上的时候频繁出现 CDN 节点爆炸的问题，提供个新方式来缓解 Cloudflare 晚上常年缓慢的问题。

这种架构 V2Ray 方案的方式是利用内网穿透软件，把所有手里的 VPS 当作网络节点来选出没有被 GFW 屏蔽的 IP 作为主节点，所有的 V2Ray 数据都请求该主节点来分流到其他 VPS；当 GFW 将主节点的 IP  屏蔽阻断的时候，让其他节点上升为主节点，而原来的主节点则下降为负载节点。

> 这种模式类似于 `Follwer/Leader` 模式，`Leader` 选取最优 VPS 来代理所有 V2ray 流量从而转发给 `Follwer`。

请注意：这个教程提供的思路和手段必须最少对 Linux 系统有一定水平的操作能力，如果没有较清晰的认识请务必不要自行乱来！

这里的方案需求有以下要求:
* 至少有两台服务器
* 基于 Nginx 的 upstream
* 基于 Tinc 的内网穿透节点功能

这里主要配置用途：
   服务器 IP 被封，直接使用另一个服务器参与节点转发；一般 GFW 封禁 IP 有时限，随便开穿透节点转发等封禁周期过了继续使用原来 IP 轮换着用。

## Tinc 安装
在配置开始前必须要开启内核的 `ip_foward` 功能，如果没有开启请手动开启转发.
```bash
$ sudo sysctl -a|grep ip_forward # 查看 ip_forward 转发是否开启 [ net.ipv4.ip_forward=1 ]
```

本例之所以使用 Tinc 来作为穿透软件是因为足够简单和基于 C 语言程序的性能依赖，且 Tinc 的 IPv6 支持还算不错，且配置相对简单不是那么复杂，其他 frp、ngrok 等都可以按照个人习惯来选择。

有的发行版的源已经内置了 Tinc，但本篇使用编译安装来部署 Tinc。
Tinc 最新版的下载地址见[官网](https://www.tinc-vpn.org/)：

### Tinc 编译安装
```bash
$ cd /tmp # 我常用惯例是在 /tmp 目录进行下载和编译，防止下载和编译到处散乱在其他目录
$ wget https://www.tinc-vpn.org/packages/tinc-1.0.36.tar.gz -O tinc.tar.gz # 下载获取最新版的源码包
$ tar -xf tinc.tar.gz --one-top-level --strip-components=1 # 解压压缩包
$ cd tinc # 进入文件夹
```

在开始编译工作之前，需要安装相应的依赖库：
```bash
$ sudo dnf install gcc cmake make openssl-devel zlib-devel lzo-devel # CentOS 的安装，其他发行版按照名称搜索安装即可
```

依赖库确认安装之后就开始编译安装工作：
```bash
$ ./configure
$ make
$ sudo make install # 这里需要用到 root 权限安装
$ tincd --version # 安装之后测试打印版本号即可
```

### systemd 服务文件修改

这里下载的压缩包本身带了两个系统服务，实际上修修改改就行:
* /tmp/tinc/systemd/tinc.service.in
* /tmp/tinc/systemd/tinc@.service.in

`tinc.service.in` 文件配置：

内容修改:
```ini
# 屏蔽 `WorkingDirectory=@sysconfdir@/tinc`
# 新增以下内容
WorkingDirectory=/usr/local/etc/tinc
```

复制到 systemd 文件夹：
```bash
$ sudo cp /tmp/tinc/systemd/tinc.service.in /lib/systemd/system/tinc.service # 复制到系统服务文件夹
$ sudo vi /lib/systemd/system/tinc.service # 修改内容
```

`tinc@.service.in` 文件配置：

内容修改：
```ini
# 屏蔽以下内容
# WorkingDirectory=@sysconfdir@/tinc/%i
# ExecStart=@sbindir@/tincd -n %i -D
# ExecReload=@sbindir@/tincd -n %i -kHUP
# 新增以下内容
WorkingDirectory=/usr/local/etc/tinc/%i
ExecStart=/usr/local/sbin/tincd -n %i -D
ExecReload=/usr/local/sbin/tincd -n %i -kHUP
```

复制到 systemd 文件夹：
```bash
$ sudo cp /tmp/tinc/systemd/tinc@.service.in /lib/systemd/system/tinc@.service # 复制到系统服务文件夹
$ sudo vi /lib/systemd/system/tinc@.service # 修改内容
```

### 收尾工作

完成配置复制和修改之后没问题就准备最后的系统配置加载流程
```bash
$ sudo mkdir -p /usr/local/var/run/ # 创建运行 PID 目录
$ sudo mkdir -p /usr/local/etc/tinc # 创建服务配置加载的配置目录
$ sudo ln -s /usr/local/etc/tinc /etc/tinc # 设置 /etc 配置文件的软链接
$ sudo systemctl unmask tinc # 刷新刚刚加载的 Systemctl 系统服务
```

## 搭建 Tinc 节点

在这里需要说明需要明确以下规范:
* 10.0.0.1 是主要接受客户端 V2ray 数据的主节点
* 10.0.0.2~n 是代理转发过来过来的负载节点
* 主节点使用 Nginx 来转发数据流量到 10.0.0.2~n 到其他服务器
* 所有的节点都需要安装 Tinc 和 Nginx

### 主节点的搭建

创建节点的搭建信息：
```bash
$ cd /etc/tinc # 进入配置目录
$ sudo mkdir -p /etc/tinc/v2ray/hosts # 创建 V2ray 的穿透节点并且设置允许访问主机配置目录
```

编辑配置文件（/etc/tinc/v2ray/tinc.conf）：
```ini
## 这里Name就是配置文件名称,这个文件节点我一般喜欢起名 `master-slave`/`node_01-node_02` 之类
## 默认端口监听665,这里设置20665,一般我都不喜欢直接使用默认端口,很容易被机器人扫出对应服务
## 这里路由模式使用交换器模式 [ Switch ] ，其他模式可以参考官网配置
Name = master
Interface = v2ray
Port=20065
Mode=switch
```

编写主节点的详细信息：
```bash
$ sudo vi /etc/tinc/v2ray/hosts/master
```

主节点链路信息内容：
```ini
## 这里 Address 代表了自己地址 IP 和端口开放信息
## 如果服务器 IP 被 Ban ,需要把主节点切换成负载节点记得把该 IP 修改成主节点 IP
## Subnet 代表了内网穿透节点的地址
Address = VPS自己IP 20665
Subnet = 10.0.0.1/32
```

完成之后就需要生成连接密钥,他会在 master 文件最后附上密钥信息
::: tip
这里一般格式 tincd -n 节点名称 -K [2048/4096,加密程度不推荐太高,本身 V2Ray 就是带有加密没必要数据再进行太过复杂加密]
:::

```bash
$ sudo /usr/local/sbin/tincd -n v2ray -K 2048
```

编写启动虚拟交换器脚本（/etc/tinc/v2ray/tinc-up），内容如下：
```bash
#!/bin/bash

# 10.0.0.1 代表了该节点占用的节点地址，必须是唯一性
ifconfig $INTERFACE 10.0.0.1 netmask 255.255.255.0
```

编写错误关闭的脚本（/etc/tinc/v2ray/tinc-down）如下：
```bash
#!/bin/bash
ifconfig $INTERFACE down
```


收尾工作,最后赋予脚本执行权限和手动开放端口/服务即可：
```bash
$ sudo chmod +x /etc/tinc/v2ray/tinc-* # 赋予脚本启动权限,
$ sudo systemctl start tinc@v2ray # 启动系统服务
$ sudo firewall-cmd --zone=public --add-port=20665/tcp --permanent # 如果有防火墙记得开启对外端口
$ sudo firewall-cmd --reload # 更新防火墙配置
$ sudo systemctl enable tinc@v2ray # 开机自动启动服务,这个实际上推荐最后调试没问题再启用
```

### 负载点的搭建

安装和配置方式基本上和主节点一致，这里下面大致理下流程，只对重点配置节点地方注明。
```bash
$ sudo mkdir /etc/tinc/v2ray/hosts # 确认和主节点一致的配置文件目录
```

这里配置节点信息（/etc/tinc/v2ray/tinc.conf）稍微不同，参考如下例子：
```ini
# Name 代表了负载节点的配置文件名称 [ hosts/slave_01 ] ,这个文件后续要放入主节点的 hosts 目录
# ConnectTo 代表接入穿透的内网节点配置文件 [ hosts/master ] ,这个文件是拷贝主节点的 hosts 的配置文件
#   这里需要知道的点:
#     * Name 不能和其他节点冲突
#     * ConnectTo 必须是主节点附加带有密钥的配置文件
#     * Interface/Mode 必须和主节点配置保持一致
Name = slave_01
Interface = v2ray
ConnectTo = master
Mode=switch
```

配置链路（/etc/tinc/v2ray/hosts/slave_01），内容如下：
```ini
# 注意这里必须对应服务端的 10.0.0.2～255
# 这是作为节点的内网IP
Subnet = 10.0.0.2/32
```

最后配置完之后生成密钥信息：
```bash
$ sudo /usr/local/sbin/tincd -n v2ray -K
```

负载节点的启动脚本内容有所不同 [ /etc/tinc/v2ray/tinc-up ]
```bash
#!/bin/bash

# 这里的 IP 地址改为该节点选择的地址
ifconfig $INTERFACE 10.0.0.2 netmask 255.255.255.0
```

在启动的时候，请千万记得复制主节点/负载节点下的 hosts 文件到各自目录下保证,保证双方 hosts 目录有以下对应内容：
```plain
$ ls -l /etc/v2ray/hosts
  master [主节点文件]
  slave_01 [负载节点01]
  slave_02 [负载节点02]
  ...
```

这里负载节点不需要开放什么端口，所有连接信息都记录在 master 主节点信息（公网 IP 和端口信息）。
但是需要手动配置防火墙，所有的负载节点开放内部的 10.0.0.1 的放行（后面章节会提到）。

Tinc 没有日志文件功能，这里推荐个调试连接思路，利用 SSH 连接来测试是否联通：
```bash
$ ssh root@10.0.0.1 # 负载节点测试 ssh 是否能够通过挂起的 10.0.0.1 接入到主节点
```

## 负载节点 V2Ray 搭建 (10.0.0.2~n)

这里安装的 V2Ray 直接参考其他配置，只需要说明的是不推荐使用任何转发/伪装协议来处理；
直接用 TCP 转发数据，因为本身 Tinc 就是带有数据安全加密功能，如果选用其他 V2ray 的其他伪装协议，性能会出现大幅降低。
所有的负载节点都需要安装 V2Ray，同时配置文件基本上没什么大的区别：
```json
{
    "log": {
        "access": "/var/log/v2ray/access.log",
        "error": "/var/log/v2ray/error.log",
        "loglevel": "warning"
    },
    "inbounds": [
    {
        "port": 10000，//这里随便启动个 V2ray 端口,直接按照负载节点请求 10.0.0.2:10000/10.0.0.3:10000
        "listen":"0.0.0.0",//这里开放公网,记得 firewall-cmd 我一般使用 firewal-cmd 管理端口,这里外部是没办法通过公网访问的.
        "protocol": "vmess",
        "settings": {
        "clients": [
            {
            "id": "b831381d-6324-4d53-ad4f-8cda48b30811",
            "alterId": 64
            }
        ]
        }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "settings": {}
    }
  ]
}
```

启动 V2Ray 之后需要对 10.0.0.x 地址进行针对性放行，port 记得改成负载节点下的 V2Ray 服务器端口信息：
```bash
$ sudo firewall-cmd --permanent --add-rich-rule="rule family="ipv4" source address="10.0.0.1" port protocol="tcp" port="[V2Ray 的服务器端口]" accept"
```

这样 V2Ray 的负载节点也就完成配置了。

## 主节点反向代理 (10.0.0.1)

我这里使用 Nginx 的 upstream 来反向代理到其他负载节点流量 （/etc/nginx/nginx.conf），配置如下：
```plain
events {
    # 这个系统会自动选择,可有可无
    use epoll;
    # 这个看机器配置的最大连接 [ sudo ulimit -n # 命令查看最大]
    worker_connections 65535;
}

//主要是添加配置该选项
stream{
  include /etc/nginx/stream.d/*.conf;
}

http{
  //........
}
```

编写 Nginx 反向代理的配置（ /etc/nginx/stream.d/v2ray.conf ），内容如下：
```plain
upstream v2ray {

  hash $remote_addr consistent;
  server 10.0.0.2:10000 weight=5;
  server 10.0.0.3:10000 weight=5;
  server 10.0.0.4:10000 weight=5;
  //.......
  //主节点按照平均权重不断转发对应的内网穿透节点下
}

# 挂起 TCP 反向代理服务
server {
  # 设置对外访问 V2ray 端口
  # v2ray 的客户端全部请求主节点:6666 端口，之后由节点内网穿透转发到指定的内网节点
  listen 6666;

  # 这里直接转发到上面配置的数据配置
  proxy_pass v2ray;
}
```

完成之后启动主节点，连接 V2ray 查看是否能够正确转发数据数据.
::: tip
 如果有防火墙请记得打开允许 Nginx 对应的端口进行访问。
:::
## 常见问题

Q: 如果主节点的 IP 被封了，怎么将负载节点转化主节点？
A: 直接复制主节点的 /etc/tinc/v2ray 目录下到可用负载节点（记得备份），将所有节点 /etc/tinc/vpn/hosts/master 文件的公网 IP 修改成新的节点 IP ，复制 Nginx 启动配置即可，同时开放 Tinc 或 Nginx 的端口。


Q: 可以通过中国服务器参与节点吗?
A: 目前测试如果中国服务器节点参与负载转发会有频繁的超时、卡顿等现象，效率不如直连海外服务器，但是速度比 WSS+CDN 快，稳定性却很差。


Q: 可以不选择 TCP 而使用更加高级的伪装协议吗?
A: 可以用但是不推荐，本身 Tinc 是附带的安全加密数据功能，大量加密套壳过程会导致性能锐减。

