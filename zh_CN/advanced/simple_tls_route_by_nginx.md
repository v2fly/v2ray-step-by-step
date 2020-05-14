# 一、摘要
基于协议数据的统一的代理分流工具。nignx 作为前端，tls 终止并基于 tls 承载的数据进行分流。简单易安装，仅仅添加 21 行代码。简化官方 TCP + TLS + Web 方案；去掉了 / 替换 tls 分流器；也可以分流到 trojan；让 nginx 可以路由到 v2 的 http2 方案。
# 二、目的
看到有人根据 trojan 原理基于 v2ray 做了个类似功能的定制即 TCP + TLS + Web，就是在 TLS 层上传输 vmess 或者其他比如 http web 流量。
本人好奇，遂群里有如下互动：

Q:TCP + TLS + Web 为啥需要 web 前需要 hproxy 啊，nginx 也有这种功能啊 非要前面 hproxy，后面再弄个 nginx/httpd。 对于个人使用没必要吧。 当然你搭建商业的除外
A: 不要再问这种问题了，你觉得可以就自己搭，搭成了可以写给教程 pr
Q:nginx 的 stream 块不行吗
A: 不要再问这种问题了，你觉得可以就自己搭，搭成了可以写给教程 pr

所以目的很简单，就是去掉那个 haproxy, 只用 nginx 来分流，这样更适用于个人 vps 的搭建。
另外的一个目的，也作为 trojan 的前端，即 nginx 也可以分流到 trojan 后端。




# 三、方案的可行性分析
所有的 tls 在 nginx 终止，后端代理只进行明文协议的解析和处理，不做 tls 处理。
## 基于 SNI
有些域名既可以放我们的博客或网站，也可以放到我们的代理客户端的 SNI 里，所以不考虑 SNI 的分流。
## 基于 SSL 握手后的 app 数据分流
根据 TSL 握手后的数据进行分流，这里从 tcp/udp 层面考虑，tls 之上的数据都是需要我们分流的。所以对于 nginx，我们采用 stream 的配置方式。
如果是 HTTP1.1，就让直接到某个正常的网站，这里要求我们没有把代理协议承载在 https 上。
如果是 HTTP2， 就让路由到 h2 代理后端比如 v2ray 或者 trojan. 虽然 trojan-go 支持 http2，但考虑到 trojangfw 反对 http2 的引入，所以我们的实现也不考虑 trojan-go 的 http2. 这里要求 v 端的实现可以考虑到正常 http2 req 的网站的返回即 failback（目前没有实现）。
如果是裸的 vmess 协议数据即常说的 TCP+TLS+VMESS+WEB，直接转发到 v 后端，这里要求 v 后端在解析失败的情况下可以返回错误页面以便伪装，也是另一种 failback（目前 v 官方没有实现，倒是有个[开源实现](https://gist.github.com/liberal-boy/04f875b86a5e54cb4e1752d24077f2be)).
如果是裸的 trojan 协议数据，直接转发到 tj 后端。 这里 trojan 实现了 failback。

# 四、此方案与 trojan 的区别
* Active Detection
对于 tj，All connection without correct structure and password will be redirected to a preset endpoint,including normal https traffic and  faked traffic。 但是对于 v2ray 却没有这样的功能，即上面所提的 failback 功能。当然社区有人在做了。
* Passive Detection
Tj 的被动检测方法是 if you are not visiting an HTTP site, then the traffic looks the same as HTTPS kept alive or WebSocket. Because of this, trojan can also bypass ISP QoS limitations. 对于我们这么部署 v2ray 的方式，也是具有这样的功能的。
这样部署的 trojgan-go 只不过把所有 tls 的功能放到 nginx 上，其他功能还在后端 tj 上。

# 五、实现
## install nginx distribution Openresty
我们采用 luajit 来实现。Openresty 安装参考[官方指导](https://openresty.org/en/installation.html).
Debian 上的安装方法：
```
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
## nginx config file
```
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
    lua_add_variable $vmess;

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
        proxy_buffer_size          256k;
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
                -- maybe faked http2 to detect us ,so need parse the body to failback to normal url
                -- or by vmess
                -- maybe we use trojan-go http2,but now giveup

		-- for v2ray's tcp +tls +h2c
                ngx.var.vmess = "10008"
            elseif string.match(data, "HTTP") then
	        -- for normal http req
                ngx.var.vmess = "8080"
            elseif string.byte(datal:sub(57), 1, 2) == 13 then
	        -- for trojan
                ngx.var.vmess = "453"
            else
	        -- for v2ray's tcp+tls +web
                ngx.var.vmess = "10007"
            end
        }
         proxy_pass 127.0.0.1:$vmess;
  }# server block
}

```
## 创建 nginx 目录 a
rsync -av /usr/local/openresty/nginx/[conf,html,logs] a
cd a
修改 a 下 conf/nginx.conf 为如上配置。
sudo openresty -p .
sudo openresty -p . -s reload
这样可以不污染 /usr/local/openresty/nginx 下的配置。

## v's tcp +tls +h2c  config
见 [HTTP/2+TLS+WEB](https://guide.v2fly.org/advanced/h2_tls_web.html#%E7%BC%BA%E9%99%B7)
注意这里 h2 的 tls 在 nginx 实现，即 h2c 配置。
对此参考的改进是采用了 nginx 作为前端。
android v2rayng version 1.2.6 有个 bug： 设置 allowsecure=true 不起作用，当然如果你的服务器 cert 正常，一般就设置为 false 就好。


## v's tcp+tls +web  config
可以参考 [TCP + TLS + Web](https://guide.v2fly.org/advanced/tcp_tls_web.html#%E8%83%8C%E6%99%AF) 的服务器配置。
与此参考不同的是去掉 haproxy。并且基于协议内容分流而不是 SNI。相对 [TCP+TLS 分流器](https://guide.v2fly.org/advanced/tcp_tls_shunt_proxy.html), 这个方案更简单了。

## trojan-go
禁止 tls 的处理的 trojan-go 版本目前处于 github 的 [dev 分支](https://github.com/p4gefau1t/trojan-go/commits/dev). 需要自行编译相应架构的客户端或者服务器端。
server config
```
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
client config 如正常的 tj 配置。

# 六、性能
* vmessping 延迟 benchmark
```
tcp+tls+web
--- vmess ping statistics ---
10 requests made, 10 success, total time 26.515340739s
rtt min/avg/max = 993/1748/2544 ms

tls+ws+cdn
--- vmess ping statistics ---
10 requests made, 10 success, total time 30.647379082s
rtt min/avg/max = 1215/2161/7160 ms

tls+h2c
--- vmess ping statistics ---
10 requests made, 10 success, total time 20.977310488s
rtt min/avg/max = 616/1194/3263 ms
```
最好的延迟是 tls+ h2c .
按理说 tcp+tls （即 tcp+tls+web，没有 http 开销） 应该比 tls+h2c 好点吧，这里为什么性能还弱呢？
* 浏览器 client 性能 benchmark
todo


# 七、todo 和讨论
## ssl 的 nginx 配置
不要用提供的，请尽量使用推荐的配置
## 可否做不同后端的负载均衡
## v2ray 的 failback 实现
不合适在 nginx 上实现，因为需要解析对应的协议。
只能在 v2ray 上实现。




# 八、参考

https://github.com/trojan-gfw/trojan/issues/14
https://trojan-gfw.github.io/trojan/protocol
[Vmess + TCP + TLS 方式的 HTTP 分流和网站伪装](https://gist.github.com/liberal-boy/f3db4e413a96fa80719db1414f011325)
[Vmess Fail Redirect 简单实现](https://gist.github.com/liberal-boy/04f875b86a5e54cb4e1752d24077f2be)

