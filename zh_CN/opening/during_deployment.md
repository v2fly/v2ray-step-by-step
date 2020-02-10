# 部署进行时

本节将说明如何部署 V2Ray，内容包含服务端和客户端。

需要注意的是，与 Shadowsocks 不同，从软件上 V2Ray 不区分服务器版本和客户端版本，也就是说，在服务端和客户端运行的 V2Ray 是同一个软件，区别只是配置文件的不同。

因此，V2Ray 的安装在服务端和客户端上是一样的，但通常情况下，VPS 使用的是 Linux，而 PC 使用的是 Windows，因此本章默认服务端系统为 Linux，客户端系统为 Windows。

如果 PC 使用的是 Linux 发行版，最好的方法是从该发行版的软件源安装，如果该发行版及其社区不提供支援，那么请参考本文的服务端安装。

如果服务端使用的是 Windows，请参考本文的客户端安装。

如果 PC 使用的是 Mac OS，请先自行研究怎么安装吧，安装完了继续往下看。

## 检查时钟是否相对准确

很多人认为 V2Ray 对于时钟有比较严格的要求，但笔者认为，仅仅是要求服务端和客户端的时钟差绝对值不能超过 2 分钟，不能算是严格的，但最好还是要保证时钟相对，甚至是足够准确。

V2Ray 并不要求时区一致。比如说自个儿电脑上的时区是东 8 区，为北京时间，并假设当前时钟为 2017-07-31 12:08:31，而 VPS 上的时区是东 9 区，为东京时间，那么，VPS 上的时钟应该是 2017-07-31 13:06:31 到 2017-07-31 13:10:31 之间，而这依然可以正常使用 V2Ray。当然，也可以自行改成自己想要的时区。

### 时钟同步方案

事实上，保证时钟准确并不困难，我们可以使用 [NTP（网络时钟协议）](https://zh.wikipedia.org/wiki/%E7%B6%B2%E8%B7%AF%E6%99%82%E9%96%93%E5%8D%94%E5%AE%9A)来解决这个问题。

#### systemd-timesyncd

无论是服务端还是客户端，目前大多 Linux 发行版已经用上了 systemd，而如果没有特殊需求的话，直接用 systemd 提供的 systemd-timesyncd，一个用于跨网络同步系统时钟的守护服务，就能解决哦。

##### 启用 systemd-timesyncd 服务

只需执行一次哦，即便是重启系统也会自动启动了呢。

```shell
# timedatectl set-ntp true
```

##### 查看 systemd-timesyncd 服务状态

```shell
$ timedatectl
# timedatectl timesync-status
# timedatectl show-timesync --all
```

##### 关于 systemd-timesyncd 服务的一些其它操作

如果只是想要试一试，不希望系统启动后自动启动该服务的话，可以仅仅是启动 systemd-timesyncd 服务：

```shell
# timedatectl set-ntp start
```

如果只是想暂时关闭一下 systemd-timesyncd 服务（无论启用／启动）：

```shell
# timedatectl set-ntp stop
```

如果希望不再使用该服务的话，就可以禁用 systemd-timesyncd 服务：

```shell
# timedatectl set-ntp false
```

## 服务端安装 V2Ray

在 Linux 发行版，V2Ray 的安装方式有：

* 该发行版提供支援的软件源安装。
* 官方脚本安装。
* 非官方脚本安装。
* 手动安装已编译版本。
* 手动安装未编译版本。
* 部署 Docker 容器安装。

选择以上其中一种即可，本节提供使用官方脚本安装的方法，该脚本可在使用 systemd 的 Debian 系列发行版，CentOS 发行版，或者其它支持 systemd 的 Linux 发行版使用。

本指南默认使用 Debian 8.7 系统作为示范。

### 官方脚本安装

使用 cURL：

```shell
# curl -o- https://install.direct/go.sh | bash
```

使用 Wget：

```shell
# wget -qO- https://install.direct/go.sh | bash
```

如果安装不成功，脚本会有红色的提示语句，这个时候你应当按照提示除错，除错后再重新执行一遍。

对于错误提示，如果看不懂的话，使用 Google 翻译一类翻译一下就好。

安装完 V2Ray 之后，部署就算是完成一半啦，但我们还没有修改配置呢，具体请在阅读完「开篇」后，继续阅读「基本篇」。

在使用官方脚本安装后，V2Ray 已经启用，但不会自动启动，需要手动执行启动命令：

```shell
# systemctl start v2ray.service
```

而在已经运行 V2Ray 的服务端上再次执行官方安装脚本，会停止当前 V2Ray 进程，并升级 V2Ray 版本，然后重新启动 V2Ray。在升级过程中，配置文件不会被修改。

### 更新策略

V2Ray 的更新策略是快速迭代，每周更新（无意外的情况下）。版本号的格式是 vX.Y.Z，如 v2.44.0。

字母 v 是固定的，是 version 的首字母。

X，Y，Z 都是数字，X 是大版本号，每年更新一个大版本（现在是 v4.Y.Z，V2Ray 已经走到了第四个年头），Y 是小版本，每周五更新一个小版本，Z 是区分正式版和测试版，为 0 说明是正式版，不为 0 说明是测试版。例如，v4.7.0 是正式版，v4.7.1 是测试版，建议只使用正式版，不手动指定的情况下，V2Ray 的官方安装脚本也只会安装最新的正式版。

有些细心的朋友可能会注意到，有时候周五，V2Ray 刚发布了一个新版本，次日或过两日又更新一个正式版。出现这种情况是因为周五发布的正式版出现了影响使用的严重 BUG，需要立即发布一个新版本。

这种情况比较烦，但是为了保证兼容性，性能优化等，又需要保证版本不要太老旧，所以比较建议在周四更新，选这么一个日子是因为，如果出现严重的 BUG，大机率在前面几天就已经修复了，小问题（恐怕都不知道有）的话不会影响使用，而且版本号与最新版相比迟那么一两个也没什么关系。

## 客户端安装 V2Ray

点 [这里](https://github.com/v2ray/v2ray-core/releases) 下载 V2Ray 的 Windows 压缩包，如果是 32 位系统，下载 v2ray-windows-32.zip，如果是 64 位系统，下载 v2ray-windows-64.zip（下载速度慢或无法下载请考虑使用已有的翻墙软件来下载）。下载并且解压后会有下面这些文件：


* `v2ray.exe`：运行 V2Ray 的程序文件。
* `wv2ray.exe`：同 v2ray.exe，区别在于 wv2ray.exe 是后台运行的，不像 v2ray.exe 会有类似于 cmd 控制台的窗口。运行 V2Ray 时从 v2ray.exe 和 wv2ray.exe 中任选一个即可。
* `config.json`：V2Ray 的配置文件，后面我们对 V2Ray 修改配置其实就是修改这个文件。
* `v2ctl.exe`：V2Ray 的工具，有多种功能，除特殊用途外，一般由 v2ray.exe 来调用，用户不用太关心。
* `geosite.dat`：用于路由功能的域名文件。
* `geoip.dat`：用于路由功能的 IP 文件。
* 其它：除上面提到的文件外，其它的不是运行 V2Ray 的必要文件。更详细的说明可以看 doc 文件夹下的 README.md 文件，可以通过记事本或其它的文本编辑器打开查看。

实际上，双击 v2ray.exe（或wv2ray.exe）就可以运行 V2Ray 了，V2Ray 会读取 config.json 中的配置来与服务器连接。

~~默认的配置文件包含 V2Ray 官方服务器的配置，也就是说，你可以不搭建自己的服务端而直接使用 V2Ray 官方提供的服务端来翻墙~（纪念已下线 V2Ray 官方服务器）。

![](../resource/images/v2rayrunnig.png)

V2Ray 将选择权交给用户，它不会自动设置系统代理，因此还需要在浏览器里设置代理。以火狐（Firefox）为例，点菜单 -> 选项 -> 高级 -> 设置 -> 手动代理设置，在 SOCKS Host 填上 127.0.0.1，后面的 Port 填 1080，再勾上使用 SOCKS v5 时代理 DNS (这个勾选项在旧的版本里叫做远程 DNS)。

需要注意的是，实际 Port 视 V2Ray 配置而定。

操作图见下：

![](../resource/images/firefox_proxy_setting1.png)

![](../resource/images/firefox_proxy_setting2.png)

![](../resource/images/firefox_proxy_setting3.png)

![](../resource/images/firefox_proxy_setting4.png)

如果使用的是其它的浏览器，请自行在网上搜一下怎么设置 Socks 代理。

## V2Ray 配置文件

V2Ray 的配置文件为 JSON 格式，Shadowsocks 的配置文件同为 JSON 格式，但 V2Ray 由于支持许多功能，不可避免的导致配置相对复杂一些，因此在实际配置前还是建议了解一下 [配置文件·Project V 官方网站](https://www.v2ray.com/chapter_02/)，里面的说明简单明了。
