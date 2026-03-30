export interface MBTIQuestion {
  id: number;
  category: string;
  text: string;
  options: { id: string; text: string }[];
}

export const mbtiQuestions: MBTIQuestion[] = [
  // PHẦN 1: TÌNH HUỐNG TÍNH CÁCH
  {
    id: 1,
    category: 'TÌNH HUỐNG TÍNH CÁCH',
    text: 'Trong một buổi làm việc nhóm để xây dựng ý tưởng cho dự án STEM, nhóm của bạn chưa thống nhất được hướng đi. Bạn sẽ:',
    options: [
      { id: 'A', text: 'Chủ động đề xuất cách phân chia nhiệm vụ rõ ràng để nhóm bắt đầu làm việc' },
      { id: 'B', text: 'Quan sát, lắng nghe các ý kiến rồi mới đóng góp khi cần thiết' },
      { id: 'C', text: 'Đưa ra một ý tưởng mới mang tính đột phá để mọi người cùng thảo luận' },
      { id: 'D', text: 'Phân tích các phương án hiện có để tìm ra hướng tối ưu nhất' }
    ]
  },
  {
    id: 2,
    category: 'TÌNH HUỐNG TÍNH CÁCH',
    text: 'Khi được giao một nhiệm vụ hoàn toàn mới mà bạn chưa từng làm trước đây, bạn thường:',
    options: [
      { id: 'A', text: 'Tìm kiếm hướng dẫn hoặc ví dụ tương tự để làm theo' },
      { id: 'B', text: 'Dành thời gian tự nghiên cứu và hiểu rõ trước khi bắt đầu' },
      { id: 'C', text: 'Nghĩ ra một cách tiếp cận khác biệt để thử nghiệm' },
      { id: 'D', text: 'Phân tích cấu trúc nhiệm vụ để xác định cách làm hiệu quả nhất' }
    ]
  },
  {
    id: 3,
    category: 'TÌNH HUỐNG TÍNH CÁCH',
    text: 'Trong quá trình học một kiến thức khó, bạn cảm thấy mình tiến bộ nhanh nhất khi:',
    options: [
      { id: 'A', text: 'Có lộ trình và tài liệu hướng dẫn cụ thể từng bước' },
      { id: 'B', text: 'Tự học theo tốc độ của bản thân và tự rút ra kết luận' },
      { id: 'C', text: 'Được thử nghiệm và sáng tạo trong quá trình học' },
      { id: 'D', text: 'Hiểu rõ bản chất và nguyên lý phía sau vấn đề' }
    ]
  },
  {
    id: 4,
    category: 'TÌNH HUỐNG TÍNH CÁCH',
    text: 'Khi dự án gặp lỗi hoặc không đạt kết quả mong muốn, bạn sẽ:',
    options: [
      { id: 'A', text: 'Kiểm tra lại từng bước theo quy trình đã làm' },
      { id: 'B', text: 'Tạm dừng để suy nghĩ và đánh giá lại cách tiếp cận' },
      { id: 'C', text: 'Thử một hướng hoàn toàn mới' },
      { id: 'D', text: 'Phân tích nguyên nhân cốt lõi để khắc phục triệt để' }
    ]
  },
  {
    id: 5,
    category: 'TÌNH HUỐNG TÍNH CÁCH',
    text: 'Bạn cảm thấy môi trường học tập lý tưởng nhất là:',
    options: [
      { id: 'A', text: 'Có cấu trúc rõ ràng, mục tiêu cụ thể' },
      { id: 'B', text: 'Yên tĩnh, cho phép tập trung cá nhân' },
      { id: 'C', text: 'Năng động, khuyến khích sáng tạo và thử nghiệm' },
      { id: 'D', text: 'Mang tính học thuật cao, đề cao tư duy logic' }
    ]
  },
  {
    id: 6,
    category: 'TÌNH HUỐNG TÍNH CÁCH',
    text: 'Khi phải đưa ra một quyết định quan trọng liên quan đến học tập hoặc dự án, bạn thường:',
    options: [
      { id: 'A', text: 'Dựa trên các quy tắc, tiêu chí rõ ràng' },
      { id: 'B', text: 'Dựa trên cảm nhận cá nhân và trải nghiệm' },
      { id: 'C', text: 'Dựa trên ý tưởng và khả năng đổi mới' },
      { id: 'D', text: 'Dựa trên phân tích dữ liệu và lập luận logic' }
    ]
  },
  {
    id: 7,
    category: 'TÌNH HUỐNG TÍNH CÁCH',
    text: 'Trong quá trình làm việc nhóm, vai trò bạn thường đảm nhận là:',
    options: [
      { id: 'A', text: 'Người tổ chức, đảm bảo tiến độ và kế hoạch' },
      { id: 'B', text: 'Người hỗ trợ, kết nối các thành viên' },
      { id: 'C', text: 'Người đưa ra ý tưởng sáng tạo' },
      { id: 'D', text: 'Người phân tích và tối ưu giải pháp' }
    ]
  },
  {
    id: 8,
    category: 'TÌNH HUỐNG TÍNH CÁCH',
    text: 'Khi tiếp cận một vấn đề mới, bạn thường quan tâm nhiều hơn đến:',
    options: [
      { id: 'A', text: 'Các bước cụ thể để giải quyết' },
      { id: 'B', text: 'Trải nghiệm và cảm nhận khi thực hiện' },
      { id: 'C', text: 'Những khả năng mới có thể khai phá' },
      { id: 'D', text: 'Cấu trúc và logic của vấn đề' }
    ]
  },
  {
    id: 9,
    category: 'TÌNH HUỐNG TÍNH CÁCH',
    text: 'Khi làm việc trong một dự án dài hạn, bạn cảm thấy thoải mái nhất khi:',
    options: [
      { id: 'A', text: 'Có kế hoạch rõ ràng từ đầu đến cuối' },
      { id: 'B', text: 'Có không gian linh hoạt để điều chỉnh' },
      { id: 'C', text: 'Có cơ hội thử nghiệm nhiều ý tưởng' },
      { id: 'D', text: 'Có thời gian để nghiên cứu sâu' }
    ]
  },
  {
    id: 10,
    category: 'TÌNH HUỐNG TÍNH CÁCH',
    text: 'Khi phải hoàn thành một nhiệm vụ gần deadline, bạn thường:',
    options: [
      { id: 'A', text: 'Đã hoàn thành phần lớn công việc theo kế hoạch' },
      { id: 'B', text: 'Điều chỉnh tiến độ để kịp hoàn thành' },
      { id: 'C', text: 'Tăng tốc và sáng tạo để hoàn thiện' },
      { id: 'D', text: 'Tập trung tối ưu và hoàn thiện chất lượng' }
    ]
  },
  {
    id: 11,
    category: 'TÌNH HUỐNG TÍNH CÁCH',
    text: 'Khi đánh giá một sản phẩm (app, dự án…), bạn thường chú ý nhất đến:',
    options: [
      { id: 'A', text: 'Tính hiệu quả và khả năng vận hành' },
      { id: 'B', text: 'Trải nghiệm người dùng' },
      { id: 'C', text: 'Mức độ sáng tạo và khác biệt' },
      { id: 'D', text: 'Độ chính xác và logic' }
    ]
  },
  {
    id: 12,
    category: 'TÌNH HUỐNG TÍNH CÁCH',
    text: 'Khi đối mặt với sự thay đổi bất ngờ trong kế hoạch, bạn:',
    options: [
      { id: 'A', text: 'Cố gắng điều chỉnh để vẫn giữ cấu trúc ban đầu' },
      { id: 'B', text: 'Chấp nhận và thích nghi dần' },
      { id: 'C', text: 'Hứng thú vì có cơ hội thử cái mới' },
      { id: 'D', text: 'Phân tích kỹ trước khi thay đổi' }
    ]
  },
  {
    id: 13,
    category: 'TÌNH HUỐNG TÍNH CÁCH',
    text: 'Bạn cảm thấy tự tin nhất khi:',
    options: [
      { id: 'A', text: 'Làm việc theo quy trình quen thuộc' },
      { id: 'B', text: 'Làm việc độc lập' },
      { id: 'C', text: 'Đưa ra ý tưởng mới' },
      { id: 'D', text: 'Giải quyết vấn đề phức tạp' }
    ]
  },
  {
    id: 14,
    category: 'TÌNH HUỐNG TÍNH CÁCH',
    text: 'Khi học một kỹ năng mới, bạn thích:',
    options: [
      { id: 'A', text: 'Có người hướng dẫn từng bước' },
      { id: 'B', text: 'Tự khám phá' },
      { id: 'C', text: 'Vừa học vừa sáng tạo' },
      { id: 'D', text: 'Hiểu sâu nguyên lý' }
    ]
  },
  {
    id: 15,
    category: 'TÌNH HUỐNG TÍNH CÁCH',
    text: 'Bạn đánh giá một công việc "tốt" khi:',
    options: [
      { id: 'A', text: 'Hoàn thành đúng mục tiêu' },
      { id: 'B', text: 'Mang lại cảm giác thoải mái' },
      { id: 'C', text: 'Có sự sáng tạo' },
      { id: 'D', text: 'Có độ chính xác cao' }
    ]
  },
  {
    id: 16,
    category: 'TÌNH HUỐNG TÍNH CÁCH',
    text: 'Trong một dự án, bạn muốn:',
    options: [
      { id: 'A', text: 'Hoàn thành đúng kế hoạch' },
      { id: 'B', text: 'Làm theo cách phù hợp với mình' },
      { id: 'C', text: 'Tạo ra điều mới' },
      { id: 'D', text: 'Tối ưu hóa tốt nhất có thể' }
    ]
  },

  // PHẦN 2: LỰA CHỌN & SỞ THÍCH
  {
    id: 17,
    category: 'LỰA CHỌN & SỞ THÍCH',
    text: 'Khi tham gia một dự án giải quyết vấn đề thực tế, bạn cảm thấy hứng thú nhất với việc:',
    options: [
      { id: 'A', text: 'Thực hiện thí nghiệm hoặc khảo sát để tìm ra nguyên nhân khoa học' },
      { id: 'B', text: 'Xây dựng một ứng dụng hoặc hệ thống công nghệ để giải quyết vấn đề' },
      { id: 'C', text: 'Thiết kế chiến dịch truyền thông hoặc sản phẩm sáng tạo để nâng cao nhận thức' },
      { id: 'D', text: 'Thu thập và phân tích dữ liệu để tìm ra quy luật và dự đoán xu hướng' }
    ]
  },
  {
    id: 18,
    category: 'LỰA CHỌN & SỞ THÍCH',
    text: 'Nếu được tham gia một cuộc thi học thuật, bạn sẽ chọn vai trò mà mình cảm thấy phù hợp nhất:',
    options: [
      { id: 'A', text: 'Người nghiên cứu và kiểm chứng các giả thuyết' },
      { id: 'B', text: 'Người xây dựng giải pháp kỹ thuật hoặc sản phẩm' },
      { id: 'C', text: 'Người phát triển ý tưởng sáng tạo và cách trình bày' },
      { id: 'D', text: 'Người phân tích số liệu và tối ưu chiến lược' }
    ]
  },
  {
    id: 19,
    category: 'LỰA CHỌN & SỞ THÍCH',
    text: 'Khi xem một video hoặc nội dung học tập, bạn thường bị thu hút nhất bởi:',
    options: [
      { id: 'A', text: 'Những khám phá khoa học về thế giới tự nhiên' },
      { id: 'B', text: 'Các công nghệ mới, cách hoạt động của phần mềm hoặc AI' },
      { id: 'C', text: 'Những ý tưởng sáng tạo, thiết kế độc đáo' },
      { id: 'D', text: 'Các phân tích logic, số liệu và mô hình' }
    ]
  },
  {
    id: 20,
    category: 'LỰA CHỌN & SỞ THÍCH',
    text: 'Bạn cảm thấy hài lòng nhất khi:',
    options: [
      { id: 'A', text: 'Tìm ra lời giải thích cho một hiện tượng tự nhiên' },
      { id: 'B', text: 'Khi chương trình hoặc sản phẩm bạn tạo ra hoạt động thành công' },
      { id: 'C', text: 'Khi bạn tạo ra một sản phẩm độc đáo, mang dấu ấn cá nhân' },
      { id: 'D', text: 'Khi bạn giải quyết được một bài toán hoặc vấn đề phức tạp' }
    ]
  },
  {
    id: 21,
    category: 'LỰA CHỌN & SỞ THÍCH',
    text: 'Khi bắt đầu một dự án mới, bạn thường muốn:',
    options: [
      { id: 'A', text: 'Hiểu rõ bản chất khoa học hoặc nguyên lý phía sau' },
      { id: 'B', text: 'Xây dựng một sản phẩm cụ thể có thể sử dụng được' },
      { id: 'C', text: 'Tạo ra một ý tưởng khác biệt so với những gì đã có' },
      { id: 'D', text: 'Phân tích vấn đề để tìm ra hướng tiếp cận tối ưu' }
    ]
  },
  {
    id: 22,
    category: 'LỰA CHỌN & SỞ THÍCH',
    text: 'Nếu được chọn một khóa học dài hạn, bạn sẽ ưu tiên:',
    options: [
      { id: 'A', text: 'Các môn khoa học tự nhiên như Sinh, Hóa, Lý' },
      { id: 'B', text: 'Các khóa về lập trình, AI, phát triển phần mềm' },
      { id: 'C', text: 'Các khóa về thiết kế, sáng tạo nội dung, multimedia' },
      { id: 'D', text: 'Các khóa về toán học, dữ liệu, phân tích' }
    ]
  },
  {
    id: 23,
    category: 'LỰA CHỌN & SỞ THÍCH',
    text: 'Khi đối mặt với một vấn đề lớn, câu hỏi đầu tiên bạn thường đặt ra là:',
    options: [
      { id: 'A', text: '"Hiện tượng này xảy ra do nguyên nhân nào?"' },
      { id: 'B', text: '"Làm thế nào để xây dựng giải pháp cho vấn đề này?"' },
      { id: 'C', text: '"Có cách nào làm nó trở nên mới mẻ hoặc khác biệt không?"' },
      { id: 'D', text: '"Dữ liệu nói gì và quy luật nằm ở đâu?"' }
    ]
  },
  {
    id: 24,
    category: 'LỰA CHỌN & SỞ THÍCH',
    text: 'Bạn cảm thấy mình phù hợp nhất với vai trò nào trong tương lai:',
    options: [
      { id: 'A', text: 'Nhà khoa học hoặc nhà nghiên cứu' },
      { id: 'B', text: 'Kỹ sư, lập trình viên hoặc nhà phát triển công nghệ' },
      { id: 'C', text: 'Nhà sáng tạo, designer hoặc người làm sản phẩm' },
      { id: 'D', text: 'Nhà phân tích dữ liệu, nhà toán học' }
    ]
  },

  // PHẦN 3: NĂNG LỰC & PHONG CÁCH HỌC
  {
    id: 25,
    category: 'NĂNG LỰC & PHONG CÁCH HỌC',
    text: 'Khi gặp một vấn đề khó mà chưa có lời giải rõ ràng, bạn thường:',
    options: [
      { id: 'A', text: 'Tìm lại kiến thức đã học để áp dụng vào' },
      { id: 'B', text: 'Tự mày mò và thử nhiều cách khác nhau' },
      { id: 'C', text: 'Nghĩ ra những hướng tiếp cận mới, dù chưa chắc chắn' },
      { id: 'D', text: 'Phân tích kỹ vấn đề để tìm ra bản chất' }
    ]
  },
  {
    id: 26,
    category: 'NĂNG LỰC & PHONG CÁCH HỌC',
    text: 'Trong quá trình học, bạn nhận thấy mình tiến bộ nhanh nhất khi:',
    options: [
      { id: 'A', text: 'Có hướng dẫn cụ thể và lộ trình rõ ràng' },
      { id: 'B', text: 'Tự học theo tốc độ của mình' },
      { id: 'C', text: 'Được thực hành và sáng tạo liên tục' },
      { id: 'D', text: 'Hiểu sâu nguyên lý và hệ thống kiến thức' }
    ]
  },
  {
    id: 27,
    category: 'NĂNG LỰC & PHONG CÁCH HỌC',
    text: 'Bạn cảm thấy thế mạnh nổi bật của mình là:',
    options: [
      { id: 'A', text: 'Ghi nhớ và áp dụng kiến thức' },
      { id: 'B', text: 'Khả năng tự học và thích nghi' },
      { id: 'C', text: 'Sáng tạo và đưa ra ý tưởng mới' },
      { id: 'D', text: 'Tư duy logic và phân tích' }
    ]
  },
  {
    id: 28,
    category: 'NĂNG LỰC & PHONG CÁCH HỌC',
    text: 'Khi xử lý một lượng thông tin lớn, bạn thường:',
    options: [
      { id: 'A', text: 'Sắp xếp theo từng bước rõ ràng' },
      { id: 'B', text: 'Lọc ra những gì quan trọng với mình' },
      { id: 'C', text: 'Kết nối thành các ý tưởng mới' },
      { id: 'D', text: 'Phân tích để tìm ra cấu trúc và quy luật' }
    ]
  },

  // PHẦN 4: ĐỘNG LỰC & MỤC TIÊU
  {
    id: 29,
    category: 'ĐỘNG LỰC & MỤC TIÊU',
    text: 'Điều khiến bạn cảm thấy tự hào nhất trong học tập hoặc công việc là:',
    options: [
      { id: 'A', text: 'Đạt được thành tích cao hoặc kết quả rõ ràng' },
      { id: 'B', text: 'Phát triển được kỹ năng và hiểu biết của bản thân' },
      { id: 'C', text: 'Tạo ra một sản phẩm hoặc ý tưởng mang dấu ấn riêng' },
      { id: 'D', text: 'Giải quyết được một vấn đề khó hoặc phức tạp' }
    ]
  },
  {
    id: 30,
    category: 'ĐỘNG LỰC & MỤC TIÊU',
    text: 'Nếu có cơ hội tham gia một chương trình lớn trong tương lai, bạn sẽ chọn:',
    options: [
      { id: 'A', text: 'Kỳ thi học thuật hoặc thi học sinh giỏi' },
      { id: 'B', text: 'Một dự án thực tế hoặc chương trình đào tạo kỹ năng' },
      { id: 'C', text: 'Một cuộc thi sáng tạo hoặc khởi nghiệp' },
      { id: 'D', text: 'Một chương trình học bổng hoặc nghiên cứu chuyên sâu' }
    ]
  }
];
