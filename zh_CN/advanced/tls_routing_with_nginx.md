# 基于 Nginx 的简单 TLS 分流
本节提供了基于协议数据的统一的代理分流方案，其使用 Nginx 作为前端对基于 TLS 承载的数据进行分流，简化了现有的 TCP+TLS+Web 方案并同时支持分流到 Trojan 或 V2Ray 的 HTTP2。

## 目的
看到有人根据 Trojan 原理基于 V2Ray 做了个类似功能的定制即 TCP + TLS + Web，就是在 TLS 层上传输 VMess 或者其他比如 http Web 流量。
本人好奇，遂群里有如下互动：

> Q: TCP + TLS + Web 为啥需要 Web 前需要 HAProxy 啊，nginx 也有这种功能啊 非要前面 HAProxy，后面再弄个 nginx/httpd。 对于个人使用没必要吧。 当然你搭建商业的除外
> 
> A: 不要再问这种问题了，你觉得可以就自己搭，搭成了可以写给教程 pr
> 
> Q: nginx 的 stream 块不行吗
> 
> A: 不要再问这种问题了，你觉得可以就自己搭，搭成了可以写给教程 pr

所以目的很简单，就是去掉那个 HAProxy，只用 Nginx 来分流，这样更适用于个人 vps 的搭建。
另外的一个目的，也作为 Trojan 的前端，即 Nginx 也可以分流到 Trojan 后端。

## 可行性分析
所有的 TLS 处理在 Nginx 截止，后端代理只进行明文协议的解析。有些域名既可以指向网站，也可以放到我们的代理客户端的 SNI 中处理，故本篇不考虑 SNI 的分流。

## 基于 TLS 握手后的数据包分流
由于原理是根据 TLS 握手后的数据进行分流，对 Nginx 采用 stream 的配置方式，具体如下：
 - 如果是 HTTP/1.1，直接路由到某个正常的网站，这要求我们没有把代理协议承载在 HTTP/1.1 上；
 - 如果是 HTTP/2，就路由到 HTTP/2 代理后端比如 V2Ray 或 Trojan。尽管 Trojan-Go 支持 HTTP2，但鉴于 Trojan-GFW 项目组对引入 HTTP/2 的反对，所以我们的实现也不考虑 Trojan-Go 的 HTTP/2 实现。这就要求 V2Ray 支持对其他来源的 HTTP/2 网站请求的返回即自动回落，但目前尚没有支持。
 - 如果是纯 VMess 协议数据即常说的 TCP+TLS+VMess+Web，直接转发到 V2Ray，这同样需要 V2Ray 在解析失败的情况下返回一个普通网页以实现伪装，算是另一种自动回落机制。目前 V2Ray 没有相关实现，但有个[开源实现](https://gist.github.com/liberal-boy/04f875b86a5e54cb4e1752d24077f2be) 可供参考或使用。
 - 如果是纯 Trojan 协议数据，直接转发到 Trojan 后端，这里 Trojan 实现了协议自动回落。

## 与 Trojan 的比较
### 主动探测
对于 Trojan，所有没有提供正确数据结果或密码的请求都会被转至一个预设的出口，包括普通 HTTPS 流量或重放、伪造的流量；但是目前 V2Ray 没有这样的功能，即上面所提的 *协议自动回落* 功能，不过社区在做了。
### 被动探测
Trojan 对抗被动探测方法和本篇所描述的方案基本一致，即所有代理流量表现形如 HTTPS 或 WebSocket。本方案中所有 TLS 的功能都被放到了 Nginx 上，其他功能还在后端 Trojan 或 V2Ray 上。

## 具体实现
::: warning
本节提供的安装示例基于 Debian，请酌情做必要的修改。
:::

### 安装 OpenResty （Nginx 分支）
我们采用 luajit 来实现，OpenResty 安装参考详见[官方指导](https://openresty.org/en/installation.html)。

```bash
sudo systemctl disable nginx
sudo systemctl stop nginx
sudo apt-get -y install --no-install-recommends wget gnupg ca-certificates
wget -O - https://openresty.org/package/pubkey.gpg | sudo apt-key add -

# add this to /etc/apt/sources.list
codename=`grep -Po 'VERSION="[0-9]+ \(\K[^)]+' /etc/os-release`

echo "deb http://openresty.org/package/debian $codename openresty" \
    | sudo tee /etc/apt/sources.list.d/openresty.list

# end
sudo apt-get update
sudo apt-get -y install openresty
```

### Nginx 配置
```plain
{
worker_processes  auto;
error_log  logs/error.log  info;
events {
    worker_connections  1024;
    use epoll;
    multi_accept on;
}
stream {
    resolver 127.0.0.1;
    lua_add_variable $VMess;

    server {
        listen  443 ssl reuseport backlog=4096;
        listen [::]:443 ssl reuseport;

        ssl_certificate_key   /privatekey.pem;
        ssl_certificate       /fullchain.pem;


        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:20m;
        ssl_protocols TLSv1.1 TLSv1 TLSv1.2;
        ssl_ciphers ALL:!ADH:!EXPORT56:RC4+RSA:+HIGH:+MEDIUM:+LOW:+SSLv3:+EXP;
        ssl_prefer_server_ciphers on;

        # 16k
        proxy_buffer_size 256k;
        # 16k
        # preread_buffer_size 4k;
        preread_buffer_size 58;

        preread_by_lua_block {
            local sock, err = ngx.req.socket()
            if sock then
               -- ngx.say("got the request socket")
            else
                ngx.say("failed to get the request socket: ", err)
            end

            local data, err = sock:peek(16)
            local datal, err = sock:peek(58)
            if string.match(data, "HTTP/2.0") then
                -- maybe faked http2 to detect us ,so need parse the body to 协议自动回落 to normal url
                -- or by VMess
                -- maybe we use Trojan-go http2,but now giveup

        -- for V2Ray's tcp +TLS +h2c
                ngx.var.VMess = "10008"
            elseif string.match(data, "HTTP") then
            -- for normal http req
                ngx.var.VMess = "8080"
            elseif string.byte(datal:sub(57), 1, 2) == 13 then
            -- for Trojan
                ngx.var.VMess = "453"
            else
            -- for V2Ray's tcp+TLS +web
                ngx.var.VMess = "10007"
            end
        }
         proxy_pass 127.0.0.1:$VMess;
  }# server block
}

```

### 创建 Nginx 目录 'a'
修改 a 中 `conf/nginx.conf` 为如上配置，这样可以不污染 `/usr/local/openresty/nginx` 下的内容。
```bash
rsync -av /usr/local/openresty/nginx/[conf,html,logs] a
cd a
sudo openresty -p .
sudo openresty -p . -s reload
```

### V2Ray 配置
可以参考 [HTTP2+TLS+Web](https://guide.v2fly.org/advanced/h2_tls_web.html#%E7%BC%BA%E9%99%B7) 和 [TCP+TLS+Web](https://guide.v2fly.org/advanced/tcp_tls_web.html#%E8%83%8C%E6%99%AF) 的服务器配置。
对于 HTTP2+TLS+Web，注意这里 HTTP2 的 TLS 在 Nginx 实现，即 h2c 配置。本篇的改动是采用了 Nginx 作为前端。

对于 TCP+TLS+Web，不同的是去掉 HAProxy，并且基于协议内容分流而不是 SNI。相对 [TCP+TLS 分流器](https://guide.v2fly.org/advanced/tcp_tls_shunt_proxy.html)，本方案更简洁。

### Trojan-Go
关闭了 TLS 处理的 Trojan-Go 版本目前位于 [dev 分支](https://github.com/p4gefau1t/Trojan-go/commits/dev)，需要自行编译相应架构的客户端或者服务器端。

Trojan-Go 服务端配置如下：
```json
{
    "run_type": "server",
    "local_addr": "127.0.0.1",
    "local_port": 453,
    "remote_addr": "127.0.0.1",
    "remote_port": 80,
    "password": [
        "xxxx"
    ],
    "ssl": {
        "serve_plain_text": true
    }
}
```

客户端使用正常的 Trojan 配置即可。

## 性能测试
### vmessping 延迟测试
```
TCP+TLS+Web
--- VMess ping statistics ---
10 requests made, 10 success, total time 26.515340739s
rtt min/avg/max = 993/1748/2544 ms

TLS+WebSocket+CDN
--- VMess ping statistics ---
10 requests made, 10 success, total time 30.647379082s
rtt min/avg/max = 1215/2161/7160 ms

TLS+h2c
--- VMess ping statistics ---
10 requests made, 10 success, total time 20.977310488s
rtt min/avg/max = 616/1194/3263 ms
```
可见延迟表现最佳的是 TLS + h2c。
按理说 TCP+TLS （即 TCP+TLS+Web，没有 HTTP 开销） 应该比 TLS+h2c 更好，这里为什么性能还弱呢？

## 参考
[Trojan Design discussion #14](https://github.com/Trojan-gfw/Trojan/issues/14)

[The Trojan Protocol](https://Trojan-gfw.github.io/Trojan/protocol)

[VMess + TCP + TLS 方式的 HTTP 分流和网站伪装](https://gist.github.com/liberal-boy/f3db4e413a96fa80719db1414f011325)

[VMess Fail-Redirect 简单实现](https://gist.github.com/liberal-boy/04f875b86a5e54cb4e1752d24077f2be)
