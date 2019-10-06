# Deploying V2Ray by Docker

Docker is a new virtualization technology that is different from traditional virtualization platform. V2Ray also provides a Docker deployment and it is very easy and efficient to deploy V2Ray via Docker.

** Docker can only be deployed in VPS based on KVM or XEN virtualisation platform **

Firstly, we need to install Docker: 

```
$ sudo apt-get install -y docker
```

After installing Docker, we found the official V2Ray image from [DockerHub](https://hub.docker.com/), the link [here](https://hub.docker.com/r/v2ray/ Official/). Find the command to pull the image and copy it. On the right side of the page, we can see the command as `docker pull v2ray/official`. We will copy it back to the command line and paste it and execute it:

```
$ sudo docker pull v2ray/official
```

After V2Ray's Docker image pulling is complete, you can proceed to the next deployment step. Before that, you need to create a new folder v2ray in the `/etc` directory, and write your configuration and name it `config.json` into v2ray path. In the folder. After the configuration file is ready, type the following command to deploy. Please remember the inbound port you set in the configuration file as you will need to map it to the host during deployment. Otherwise, it will not be accessible. Assuming the port number is set to `8888`, it needs to be mapped to port `8888` of the host. The command is:

```
$ sudo docker run -d --name v2ray -v /etc/v2ray:/etc/v2ray -p 8888:8888 v2ray/official  v2ray -config=/etc/v2ray/config.json
```

After typing the command above, a string of characters will appear on the command line, indicating that the container is successfully deployed, and can be immediately connected through the client and started to use. If you are not sure, type the following command to view the running status of the container:

```
$ sudo docker container ls
```

If you see the following sentences from the output prompt, the container runs successfully:

```
$ docker container ls
CONTAINER ID        IMAGE                 COMMAND                  CREATED             STATUS              PORTS                     NAMES
2a7sdo87kdf3        v2ray/official        "v2ray -config=/et..."   3 minutes ago       Up 3 minutes        0.0.0.0:8888->8888/tcp    v2ray
```

Start V2Ray by the following command:

```
$ sudo docker container start v2ray
```

Stop V2Ray:

```
$ sudo docker container stop v2ray
```

Restart V2Ray:

```
$ sudo docker container restart v2ray
```

Check logs:
```
$ sudo docker container logs v2ray
```

Once your configuration updated, you need deploy the container, by the following commands:

```
$ sudo docker container stop v2ray
$ sudo docker container rm v2ray
$ sudo docker run -d --name v2ray -v /etc/v2ray:/etc/v2ray -p 8888:8888 v2ray/official  v2ray -config=/etc/v2ray/config.json
```

If your configuration changes the port number, then the corresponding port mapping should also be changed. If you change the listening port to 9999 in the configuration file, the '-p' parameter should be written like this:
```
-p  9999:9999
```

If you want to map the port in the container to the port of the machine, the command should be written like this:

```
-p 127.0.0.1:{your port}:{your port}
```

If the transport layer protocol used by V2Ray is mKCP, since mKCP is based on UDP, the port to be mapped is UDP:

```
-p  9999:9999/udp
```

** Unless you want to use Nginx to forward Websocket, you don't need to map to local. Just fill in the form of `{your port}:{you port}`. **

In addition, if the dynamic port is enabled, the -p flag can be used multiple times to bind multiple ports. The specific usage is to add multiple -p tags to the instruction.

Update the Docker mirror of V2Ray:
```
$ docker pull v2ray/official
```
Once updated, you need to deploy this container again as forementioned.

-------

#### Updates

* 2018-04-05 Update
* 2018-09-06 Add the UDP delay description
