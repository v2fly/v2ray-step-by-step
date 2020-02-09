# Docker 部署 V2Ray

Docker 技術是一種新的虛擬化技術，和傳統的虛擬化技術不同。V2Ray 同樣提供 Docker 部署方式，並且通過 Docker 來部署 V2Ray 會非常輕鬆高效。

**Docker 只能部署在 KVM 或者 XEN 架構的 VPS中**

首先安裝 Docker：

```
$ sudo apt-get install -y docker
```

安裝完 Docker 後我們從 [DockerHub](https://hub.docker.com/) 通過搜索找到 V2Ray 官方提供的鏡像， 鏈接[在此](https://hub.docker.com/r/v2ray/official/). 找到拉取鏡像的的命令並複製下來，在網頁右側我們可以看到命令爲 `docker pull v2ray/official` ，我們將其複製下來回到命令行中粘貼並執行：

```
$ sudo docker pull v2ray/official
```

待 V2Ray 的 Docker 鏡像拉取完成後就可以進入下一個部署階段. 在此之前，你需要在 /etc 目錄下新建一個文件夾 v2ray， 並把你的配置寫好後命名爲 config.json 放入 v2ray 文件夾內. 待配置文件準備就緒後鍵入以下命令進行部署，部署前請記下配置文件中你所設置的端口號，在部署時需要將其映射到宿主機上. 否則將無法訪問. 此處假設設定的端口號爲8888，需要映射到宿主機的8888端口上. 則命令爲：

```
$ sudo docker run -d --name v2ray -v /etc/v2ray:/etc/v2ray -p 8888:8888 v2ray/official  v2ray -config=/etc/v2ray/config.json
```

鍵入以上命令後，命令行會出現一串字符，代表容器部署成功，可以立即通過客戶端連接並開始使用了. 如果還不放心，鍵入以下命令來查看容器的運行狀態：

```
$ sudo docker container ls
```

如果看到輸出的結果中有以下字段代表容器成功運行：

```
$ docker container ls
CONTAINER ID        IMAGE                 COMMAND                  CREATED             STATUS              PORTS                     NAMES
2a7sdo87kdf3        v2ray/official        "v2ray -config=/et..."   3 minutes ago       Up 3 minutes        0.0.0.0:8888->8888/tcp    v2ray
```

通過以下命令來啓動 V2Ray：

```
$ sudo docker container start v2ray
```

停止 V2Ray：

```
$ sudo docker container stop v2ray
```

重啓 V2Ray：

```
$ sudo docker container restart v2ray
```

查看日誌：
```
$ sudo docker container logs v2ray
```

更新配置後，需要重新部署容器，命令如下：

```
$ sudo docker container stop v2ray
$ sudo docker container rm v2ray
$ sudo docker run -d --name v2ray -v /etc/v2ray:/etc/v2ray -p 8888:8888 v2ray/official  v2ray -config=/etc/v2ray/config.json
```

假如你的配置換了端口號，那麼相應的端口映射也要更改，假如你在配置文件中把監聽端口改爲了9999，則'-p'參數應該這樣寫：
```
-p  9999:9999
```

假如你想將容器中的端口映射到本機的端口，則命令應該這樣寫

```
-p 127.0.0.1:端口號:端口號
```

如果 V2Ray 用的傳輸層協議是 mKCP，由於 mKCP 基於 UDP，那麼需要指定映射的端口是 UDP：

```
-p  9999:9999/udp
```

**除非你打算使用Nginx來轉發Websocket否則不需要映射到本地，直接填寫`端口號:端口號`的形式即可**

另外，如果開啓了動態端口，-p 標記可以多次使用來綁定多個端口. 具體用法是在指令中再加上多個 -p 標記即可。

更新 V2Ray 的 Docker 鏡像：
```
$ docker pull v2ray/official
```
更新完之後，你需要重新部署容器，方法見上。

-------

#### 更新歷史

* 2018-04-05 Update
* 2018-09-06 UDP 說明
