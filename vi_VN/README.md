# Hướng dẫn cấu hình V2Ray

## Khước từ

Kho lưu trữ này là một nhánh của `ToutyRater / v2ray-guide`, cảm ơn bạn đã giúp nhiều người vượt qua GFW.

Vì chúng tôi muốn làm cho [hướng dẫn ban đầu của V2Ray] (https://github.com/ToutyRater/v2ray-guide) được duy trì tốt hơn và cập nhật hơn, cũng như đa ngôn ngữ, chúng tôi đã chia sẻ kho lưu trữ mới này . Bạn được hoan nghênh đóng góp kinh nghiệm, dịch thuật và chỉnh sửa tài liệu này bằng cách mở một vấn đề. Ngoài ra, nếu bạn muốn giúp chúng tôi đọc lại bản dịch này, xin đừng ngần ngại mở một vấn đề.

Các tài liệu hiện được cấp phép theo [BY-CC 4.0] (`LICENSE.md`).

## Giới thiệu

V2Ray là một công cụ thuộc Project V. Project V là một dự án bao gồm một bộ công cụ để xây dựng các môi trường mạng cụ thể và V2Ray là công cụ cốt lõi. Hướng dẫn Project V cho biết `Project V là một bộ công cụ giúp bạn xây dựng mạng riêng tư của mình qua internet. Cốt lõi của Project V, được đặt tên là V2Ray, chịu trách nhiệm về các giao thức và truyền thông mạng. Nó có thể hoạt động độc lập, cũng như kết hợp với các công cụ khác.` Tuy nhiên, về thời gian khởi chạy, Project V được ưu tiên hơn V2Ray. Nếu bạn vẫn không hiểu, thì chúng tôi chỉ đơn giản nói, V2Ray là một phần mềm proxy tương tự như Shadowsocks. V2Ray có thể được sử dụng để truy cập internet (qua kiểm duyệt) để tìm hiểu khoa học và công nghệ tiên tiến từ internet miễn phí.

Hướng dẫn sử dụng V2Ray:
 - [https://www.v2ray.com](https://www.v2ray.com) (Has been blocked in China)
 - [https://v2fly.org](https://v2fly.org)

Địa chỉ kho lưu trữ V2Ray: [https://github.com/v2ray/v2ray-core[(https://github.com/v2ray/v2ray-core) Địa chỉ kho lưu trữ V2Ray (kho lưu trữ V2Fly): [https://github.com /v2ray/v2ray-core[(https://github.com/v2fly/v2ray-core)

Nhóm thảo luận người dùng V2Ray Telegram: [https://t.me/projectv2ray[(https://t.me/v2fly_chat)


## Câu hỏi thường gặp: Hỏi &amp; Đáp


#### Sự khác biệt giữa V2Ray và Shadowsocks là gì?

Sự khác biệt vẫn là Shadowsocks chỉ là một công cụ proxy đơn giản; nó là một giao thức mã hóa. Tuy nhiên, V2Ray được thiết kế như một nền tảng và bất kỳ nhà phát triển nào cũng có thể sử dụng các mô-đun được cung cấp bởi V2Ray để phát triển phần mềm proxy mới.

Bất cứ ai quen thuộc với lịch sử của Shadowsocks đều nên biết rằng đây là một phần mềm tự sử dụng được phát triển bởi clowwindy. Mục đích ban đầu của sự phát triển là làm cho nó dễ dàng và hiệu quả để vượt qua tường lửa và kiểm duyệt. Trước khi clowwindy thực hiện mã nguồn mở Shadowsocks, nó đã được sử dụng như một giao thức proxy riêng trong một thời gian dài. Trong khi V2Ray được phát triển sau khi clowwindy nhận được mối đe dọa từ chính phủ Trung Quốc, nhóm Project V đã phát triển như một cuộc biểu tình.

Do nền tảng lịch sử khác nhau khi sinh, chúng có những đặc điểm khác nhau.

Nói một cách đơn giản, Shadowsocks là một giao thức proxy đơn và V2Ray phức tạp hơn một proxy giao thức đơn. Nghe có vẻ hơi ảm đạm với Shadowsocks? Tất nhiên là không! Từ quan điểm khác, Shadowsocks dễ triển khai và V2Ray có cấu hình phức tạp hơn trong khi triển khai.

#### Vì V2Ray phức tạp hơn, tại sao chúng tôi sử dụng nó?

Những lợi thế và bất lợi của một cái gì đó luôn luôn đi cùng. Chẳng hạn, V2Ray có những ưu điểm sau:

* ** Giao thức mới và mạnh mẽ: ** V2Ray sử dụng giao thức VMess tự phát triển mới, giúp cải thiện một số thiếu sót hiện có của Shadowsocks và khó phát hiện hơn bởi tường lửa.
* ** Hiệu suất tốt hơn: ** Hiệu suất mạng tốt hơn, có thể xem dữ liệu cụ thể [Blog chính thức của V2Ray] (https://steemit.com/cn/@v2ray/3cjiux)
* ** Các tính năng khác: ** Sau đây là một số tính năng của V2Ray:
    * mKCP: Triển khai giao thức KCP trên V2Ray, bạn không cần phải cài đặt một kcptun khác.
    * Cổng động: thay đổi linh hoạt cổng giao tiếp để chống lại giới hạn tốc độ của cổng giao thông lớn dài hạn
    * Các tính năng định tuyến: bạn có thể tự do đặt hướng luồng của gói dữ liệu đã chỉ định, để chặn quảng cáo và bật tính năng chống theo dõi
    * Proxy ngoài, hay còn gọi là proxy chuỗi, sử dụng nhiều liên kết để bảo mật tốt hơn
    * Obfuscation: tương tự như obfuscation của ShadowsocksR, và gói dữ liệu cho mKCP cũng có thể bị xáo trộn. Làm xáo trộn các gói lưu lượng giao thông khác, làm cho việc kiểm tra trở nên khó khăn hơn
    * Giao thức WebSocket: Chỉ sử dụng proxy WebSocket hoặc cho proxy trung gian CDN (chống chặn tốt hơn)
    * Mux: Ghép kênh, cải thiện hơn nữa hiệu năng đồng thời của proxy

#### Không có viên đạn bạc

Hiện tại, V2Ray có những nhược điểm sau:
- Cấu hình phức tạp
- Thiếu khách hàng và dịch vụ của bên thứ 3

#### Có vẻ như V2Ray tốt, nhưng tôi chỉ muốn vượt qua kiểm duyệt internet, không muốn lãng phí thời gian quá lâu. Làm thế nào tôi có thể làm được?

Bất kể bạn làm gì, có một nỗ lực. Nỗ lực không có nghĩa là thành công, nhưng không có nỗ lực chắc chắn đề nghị không có lợi. Nhưng nếu yêu cầu của bạn tương đối đơn giản, bạn có thể tìm thấy VPN thay vì triển khai V2Ray là chính mình.

#### Tôi đã quyết định thử triển khai V2Ray, vậy làm thế nào tôi có thể làm theo hướng dẫn này?

Hướng dẫn sử dụng của V2Ray giải thích mọi thứ rất chi tiết. Hướng dẫn này chủ yếu giải thích các tính năng của V2Ray từ dễ đến khó trong các cấu hình thực tế có sẵn và cố gắng giảm bớt khó khăn cho người mới sử dụng V2Ray.

** Người dùng của hướng dẫn này nên có một số trải nghiệm về vỏ Linux, như cách mua VPS, cách đăng nhập vào VPS bằng SSH, cách sử dụng nano (hoặc vim) để chỉnh sửa văn bản và một số lệnh Linux cơ bản. Có rất nhiều hướng dẫn trực tuyến. Không cần phải lặp lại chúng và viết một hướng dẫn. Nếu bạn không có bất kỳ kinh nghiệm nào, bạn được khuyến khích rằng bạn nên tìm hiểu chúng trước, sau đó triển khai V2Ray. **

Hướng dẫn này có thể được xem là một phiên bản đơn giản của hướng dẫn sử dụng V2Ray hoặc là một hướng dẫn thực tế cho V2Ray.

Bạn có thể làm theo các hướng dẫn trong hướng dẫn này để xây dựng V2Ray mà không cần đọc hướng dẫn sử dụng này, nhưng chúng tôi không khuyến nghị điều đó. Bởi vì hướng dẫn này chỉ để hướng dẫn bạn cách định cấu hình V2Ray. Có một số phím tắt nhất định so với hướng dẫn sử dụng, và một cái gì đó bị bỏ qua. Vì vậy, chúng tôi hy vọng mọi người dành để đọc hướng dẫn sử dụng V2Ray.

#### Mới bắt đầu sử dụng V2Ray, tôi cần chú ý điều gì?

Vì nhiều người dùng V2Ray có kinh nghiệm với Shadowsocks, về cơ bản họ có thể sử dụng V2Ray như Shadowsocks. Tuy nhiên, V2Ray không hoàn toàn giống với Shadowsocks nên chúng tôi sẽ giới thiệu sự khác biệt trong cách sử dụng. Xin lưu ý rằng sự khác biệt không có nghĩa là tốt hay xấu. Bạn nên chọn cấu hình phù hợp với môi trường mạng của bạn.

- Máy khách: V2Ray chính nó chỉ là một hạt nhân. Máy khách GUI của V2Ray chủ yếu là một vỏ được gọi là kernel V2Ray, tương tự như mối quan hệ giữa nhân Linux và hệ điều hành Linux. Nhưng nhiều khách hàng của Shadowsocks được tác giả triển khai lại giao thức. Nội dung của bài viết này không liên quan đến việc sử dụng máy khách GUI tại thời điểm này.
- Proxy chính sách: Có lẽ trí tưởng tượng đầu tiên là PAC. Cho dù bản thân Shadowsocks (cụ thể là Shadowsocks-libev) hay V2Ray đều không hỗ trợ PAC, nó được điều khiển bởi ứng dụng khách. Trong khi Shadowsocks sử dụng ACL, V2Ray sử dụng chức năng định tuyến của nó và chúng tôi không nói cái nào tốt hay xấu. Bạn có thể chọn cái tốt hơn, tùy thuộc vào bạn.

- Chia sẻ liên kết / Mã QR: V2Ray không có định dạng URL thống nhất như Shadowsocks, do đó, liên kết / mã QR được chia sẻ của mỗi máy khách đồ họa V2Ray không nhất thiết phải phổ biến. Tuy nhiên, chúng tôi đang nghiên cứu triển khai giao thức của giao thức điểm cuối V2Ray. Nó sẽ cung cấp một liên kết phổ quát cho các khách hàng V2Ray.
- Mã hóa: V2Ray (cụ thể là giao thức VMess) không thích Shadowsocks, trong đó nhấn mạnh đến sự lựa chọn mã hóa và mã hóa VMess được chỉ định bởi máy khách, máy chủ có thể thích nghi.
- Thời gian: Khi sử dụng giao thức VMess từ V2Ray, bạn cần đảm bảo thời gian chính xác cho cả máy khách và máy chủ, vì đây là thiết kế an toàn.
- Mật khẩu: V2Ray (VMesss) chỉ sử dụng UUID, hoạt động như mật khẩu của Shadowsocks, nhưng tính ngẫu nhiên tốt hơn nhiều so với mật khẩu của Shadowsocks, nhưng không thuận tiện để nhớ (mâu thuẫn về an toàn và thuận tiện).
- Chuyển tiếp UDP: VMess là giao thức truyền phát dựa trên TCP. Đối với các gói UDP, VMess sẽ được chuyển đổi thành luồng TCP và sau đó chuyển tiếp các gói, tức là UDP qua TCP. Để bật UDP, bạn có thể bật UDP trong giao thức vớ của khách hàng. Tuy nhiên, lưu ý rằng điều này không tốt cho việc tăng tốc chơi game.
- Gateway proxy: Trên thực tế, chúng không khác nhau. Đừng nghĩ rằng bạn không thể sử dụng chúng trên bộ định tuyến mà không có plugin.
