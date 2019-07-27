# Advanced

Congratulations to you made to this chapter.

With configurations examples availabe in basic chapters, you are fulfill needs of bypass the internet cersorship. However, V2Ray has many additional features that can lead to a better internet experience. In this chapter we would bring a brief introduction to functions and configuration while it may not be complete, and it will not be as detailed as the basics chapter. Some necessary comments will still appear.

V2Ray has a big advantage over other tools as it has a separated transport layer that allow users choose different ways that packets transmitted between the V2Ray server and the client. For example, we can choose to obfuscate to be HTTP (TCP) traffic, and if you use mKCP, you can also obfuscate to BT download, video call, WeChat video call. You can also choose to use WebSokcs or TLS. All of them is defined by the configuration of the transport layer.

Transport protocol is choosed in the `transport` object, also in `streamSettings` obejct of  `inbound/outbound` term. The main difference is the `streamSettings` of `inbound/outbound` only valid for one of `inbound/outbound`. But in `transport` term it will affect all of `inbounds/outbounds`. This setting will not inherit to the specific `inbound` or `outbound` object.

In this chapter, many of contents are about transport protocol. It is set in `streamSettings` object. So you are encouraged to use them by a single `inbound/outbound` term, as they are different in general.
