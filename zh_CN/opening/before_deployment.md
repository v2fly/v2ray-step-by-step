# 在部署之前

本节将说明在部署 V2Ray 的过程中需要注意的一些细节，看似无关紧要，但有些许差错可能就会造成部署失败。所以请大家请仔细阅读，在部署的过程如果遇到问题了，也请检查一下是不是哪些地方做得不到位。

## 你的阅读方式是否高效

无论是在网络上，还是现实生活中，不少人很喜欢跳跃式看文章／书／教程，自以为只看关键的东西就足够了，似乎这样子非常高效。实际上这样子做，大多会花更多的时间才能达到同样的效果。

如果你对此感到困惑，笔者在此向各位推荐一些相关资料：

* [《如何阅读一本书》——书评及内容纲要 @ 编程随想的博客](https://program-think.blogspot.com/2013/04/how-to-read-book.html)
* [如何【系统性学习】——从“媒介形态”聊到“DIKW 模型” @ 编程随想的博客](https://program-think.blogspot.com/2019/10/Systematic-Learning.html)

如果你现在对此没有什么困惑了，并且刚接触 V2Ray，又不太会使用，建议按照本指南的顺序并看完。

## 本指南中命令组成要素指北

本指南当中，所有命令都以 `$` 或 `#` 开头，`$` 表示非 root 用户，`#` 表示 root 用户，在实际输入命令时，不需要将 `$` 或 `#` 输进去。

## 为服务器选择 Linux 发行版的问题

感谢 Golang 编程语言提供的特性和 V2Ray 原作者的精心设计，V2Ray 可以不依赖其它软件（库）而运行，并且提供了跨平台支持（Windows，Mac OS，Linux，BSD 等）。但是，由于新手在学习使用的过程中可能会遇到各种问题，却缺乏相应解决问题的能力，因此在 VPS 上建议使用 Debian，Ubuntu，CentOS 等 Linux 发行版，要注意的是，尽可能选择一个较新的发布版本。请不要盲目相信像是 Debian 7，Debian 8，Ubuntu 14.04，CentOS 5，CentOS 6 这样过于老旧的版本。

笔者在此特别向各位推荐 Debian，并提供一些可以帮助到你的相关信息。

* Debian 参考手册：
    * 简体：
        * HTML：[https://www.debian.org/doc/manuals/debian-reference/index.zh-cn.html](https://www.debian.org/doc/manuals/debian-reference/index.zh-cn.html)
        * 纯文字：[https://www.debian.org/doc/manuals/debian-reference/debian-reference.zh-cn.txt](https://www.debian.org/doc/manuals/debian-reference/debian-reference.zh-cn.txt)
        * PDF：[https://www.debian.org/doc/manuals/debian-reference/debian-reference.zh-cn.pdf](https://www.debian.org/doc/manuals/debian-reference/debian-reference.zh-cn.pdf)
    * 繁体：
        * HTML：[https://www.debian.org/doc/manuals/debian-reference/index.zh-tw.html](https://www.debian.org/doc/manuals/debian-reference/index.zh-tw.html)
        * 纯文字：[https://www.debian.org/doc/manuals/debian-reference/debian-reference.zh-tw.txt](https://www.debian.org/doc/manuals/debian-reference/debian-reference.zh-tw.txt)
        * PDF：[https://www.debian.org/doc/manuals/debian-reference/debian-reference.zh-tw.pdf](https://www.debian.org/doc/manuals/debian-reference/debian-reference.zh-tw.pdf)
* Debian 中文社区：[https://www.debiancn.org/](https://www.debiancn.org/)
* Debian 中文论坛：[https://forums.debiancn.org/](https://forums.debiancn.org/)
* Debian Telegram 中文群组：[https://telegram.debiancn.org/](https://telegram.debiancn.org/)

## 防火墙问题

一些 Linux 发行版，VPS 商家，以及某些云计算平台默认提供并运行了防火墙／安全组等功能，因此正确部署了 V2Ray 之后因为错误的防火墙／安全组设置，会导致 V2Ray 无法连接成功。这时候你就要检查一下是否可能是防火墙的问题。具体情况你可以发工单问客服或 Google 一下。

## V2Ray 配置文件的格式问题

因为 V2Ray 的配置文件比较长，层级也多，导致编辑时很容易出错，也难检查。如果使用在线的 JSON 工具（当然也有离线的），可以检查文件格式是否正确。这种在线工具一搜一大把，就不打广告了。

## 服务端的 V2Ray 启用／启动问题

使用官方脚本安装 V2Ray 后已经启用，但不会自动启动，而是要自己手动启动。另外，如果修改了配置文件，重新启动 V2Ray 后新的配置才会生效。

## 代理设置问题

在指南中使用的 Firefox 浏览器，设置的是 Socks 代理。但是有的朋友喜欢用其它浏览器，那么提示一下，客户端的 inbound 可以使用 HTTP 协议，并在 IE 选项中设置代理。或者也可以使用浏览器插件，如 SwitchyOmega 等。

## 绝技！最终解决问题

很遗憾，我们没有能力预测所有可能出现的问题。但是，一般来说，你遇到的所有问题都有人早就遇到了，并且还给出了相应的解决办法（除非你是该行业的顶尖人才，遇到的是需要调用浩瀚的资源才有希望解决的问题）。

所以，如果遇到问题，可以通过搜索引擎搜索解决，到社区里提问是迫不得已的办法。在部署 V2Ray 的过程中，有 90% 以上的问题可以通过使用搜索引擎或查看相关文档解决的，要社区提问才能解决的不足 5%。

如果不能自行解决问题这 90% 以上的问题，那么只能说明，你的综合能力还需提高（比如查阅资料的能力、阅读理解的能力）。

当然，我们并不反对到社区提问，而是希望提问的内容能够更有意义，谁也不愿意自己就像个复读机一样天天回答网友们千篇一律的问题。

如果有提问的需要，强烈建议先认真学习一下：

* 提问的智慧：「[繁体](https://github.com/ryanhanwu/How-To-Ask-Questions-The-Smart-Way/blob/master/README.md)」、「[简体](https://github.com/ryanhanwu/How-To-Ask-Questions-The-Smart-Way/blob/master/README-zh_CN.md)」。
