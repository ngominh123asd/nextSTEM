export interface LandingProps {
  onStartDemo: () => void;
  onOpenAuth: () => void;
  onOpenAbout: () => void;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  highlighted: boolean;
}

export const stackingCardsData = [
  { number: "01", title: "AI Advisor", desc: "Gợi ý định hướng ngành học, quốc gia, trường dựa trên GPA và sở thích của bạn một cách cá nhân hoá.", image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop" },
  { number: "02", title: "Project Builder", desc: "Hướng dẫn xây dựng dự án STEM từng bước để tạo điểm nhấn độc đáo cho hồ sơ du học.", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop" },
  { number: "03", title: "Portfolio Dashboard", desc: "Lưu toàn bộ hoạt động – kỹ năng – chứng chỉ. Tự động sinh CV và bài luận cá nhân theo chuẩn CommonApp, UCAS chỉ với vài cú click dễ dàng.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop" },
  { number: "04", title: "Essay & Interview Coach", desc: "AI Coach phản hồi bài luận, phỏng vấn và câu chuyện cá nhân với phân tích sâu sắc.", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop" },
  { number: "05", title: "Mentor Hub", desc: "Kết nối với mentor thật từ Ivy League, A*STAR và các trường top thế giới. Học hỏi kinh nghiệm thực tế, nhận lời khuyên cá nhân hoá cho hành trình du học của bạn.", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop" },
];

export const testimonials: Testimonial[] = [
  {
    quote: "nextSTEM giúp mình định hướng rõ ràng hơn về ngành học và quốc gia phù hợp. AI Advisor gợi ý chính xác lộ trình cá nhân hoá.",
    name: "Minh Anh",
    role: "Học sinh lớp 12",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
    highlighted: false,
  },
  {
    quote: "Mình đã xây dựng được dự án STEM hoàn chỉnh chỉ trong 2 tuần nhờ Project Builder. Hồ sơ nổi bật hơn hẳn so với trước.",
    name: "Đức Huy",
    role: "SV năm nhất — RMIT",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
    highlighted: false,
  },
  {
    quote: "Portfolio Dashboard tự động sinh CV và Personal Statement chuẩn CommonApp. Mình tiết kiệm rất nhiều thời gian và công sức.",
    name: "Thảo Nguyên",
    role: "Du học sinh — NUS",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
    highlighted: true,
  },
  {
    quote: "Essay Coach phân tích bài luận rất chi tiết, chỉ ra điểm mạnh và điểm cần cải thiện. Bài luận của mình tốt hơn rõ rệt sau mỗi lần sửa.",
    name: "Quốc Bảo",
    role: "Học sinh lớp 11",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop",
    highlighted: false,
  },
  {
    quote: "Một nền tảng giáo dục rất tiềm năng. nextSTEM giải quyết được bài toán định hướng du học và phát triển hồ sơ cá nhân.",
    name: "TS. Hồng Nhung",
    role: "Giảng viên ĐH",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=100&auto=format&fit=crop",
    highlighted: false,
  },
  {
    quote: "Mentor Hub kết nối mình với anh chị du học sinh Ivy League. Những lời khuyên thực tế giúp mình tự tin hơn rất nhiều.",
    name: "Khánh Linh",
    role: "Học sinh lớp 12",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
    highlighted: true,
  },
];

export interface Mentor {
  id: string;
  name: string;
  role: string;
  school: string;
  images: string[];
  bio: string;
  achievements: string[];
}

export const mentorsData: Mentor[] = [
  {
    id: "m1",
    name: "Biện Đức Tiến",
    role: "Software Engineer",
    school: "MIT",
    images: ["/images/mentor/Biện Đức Tiến.jpg"],
    bio: "Tiến hiện là kỹ sư phần mềm tại một tập đoàn công nghệ lớn ở Mỹ. Từng chinh phục học bổng toàn phần MIT, Tuấn có nhiều kinh nghiệm trong việc xây dựng hồ sơ và viết luận ngành Khoa học Máy tính.",
    achievements: [
      "Học bổng toàn phần MIT 2019",
      "Quán quân Hackathon toàn quốc",
      "Top 10 Sinh viên tiêu biểu"
    ]
  },
  {
    id: "m2",
    name: "Bùi Hồng Anh",
    role: "Data Scientist",
    school: "Harvard University",
    images: ["/images/mentor/Bùi Hồng Anh.jpg"],
    bio: "Hồng Anh hướng dẫn tư duy phân tích dữ liệu và xây dựng dự án Khoa học Dữ liệu nổi bật. Với background mạnh về Toán và Khoa học, Vy giúp học sinh định hình rõ ràng lộ trình.",
    achievements: [
      "Ivy League Merit Scholar",
      "Tác giả bài báo khoa học về AI",
      "Cựu chủ tịch Data Science Club"
    ]
  },
  {
    id: "m3",
    name: "Dương Anh Đức",
    role: "AI Researcher",
    school: "Stanford University",
    images: ["/images/mentor/Dương Anh Đức.jpg"],
    bio: "Nghiên cứu sinh về Trí tuệ Nhân tạo tại Stanford. Anh Đức rất tâm huyết với việc kết nối và chia sẻ kiến thức về học máy cho cộng đồng du học sinh Việt.",
    achievements: [
      "Stanford Graduate Fellowship",
      "Speaker tại hội nghị AI quốc tế",
      "Lãnh đạo dự án AI cho giáo dục"
    ]
  },
  {
    id: "m4",
    name: "Lê Thị Ngà",
    role: "Product Manager",
    school: "National University of Singapore (NUS)",
    images: ["/images/mentor/Lê Thị Ngà.jpg"],
    bio: "Từng đạt học bổng ASEAN và có trải nghiệm đa dạng tại các startup công nghệ châu Á. Ngà chuyên hỗ trợ các bạn muốn theo học hệ STEM tại Singapore.",
    achievements: [
      "Học bổng ASEAN (A*STAR)",
      "Top 5 Product Hackathon",
      "Mentee xuất sắc nhất năm"
    ]
  },
  {
    id: "m5",
    name: "Lương Đức Dũng",
    role: "Biomedical Engineer",
    school: "Johns Hopkins University",
    images: ["/images/mentor/Lương Đức Dũng.jpg"],
    bio: "Đam mê kết nối y tế và công nghệ, Dũng có thành tích xuất sắc trong các dự án công nghệ sinh học và sẵn sàng hướng dẫn các bạn xây dựng portfolio chuyên môn.",
    achievements: [
      "Quán quân Biomedical Innovation",
      "Đại sứ sinh viên quốc tế",
      "Học bổng JHU Excellence"
    ]
  },
  {
    id: "m6",
    name: "Nguyễn Khánh Huyền",
    role: "Mechanical Engineer",
    school: "UC Berkeley",
    images: ["/images/mentor/Nguyễn Khánh Huyền.jpg"],
    bio: "Thành viên chủ chốt trong CLB Robotics của Berkeley. Khánh Huyền thường xuyên mentor cho các dự án STEM và giúp học sinh thiết kế các project ấn tượng.",
    achievements: [
      "Học bổng kỹ sư xuất sắc Mĩ",
      "Giải nhì cuộc thi Robotics toàn cầu",
      "Chủ tịch CLB Kỹ sư đổi mới"
    ]
  },
  {
    id: "m7",
    name: "Nguyễn Thành Công",
    role: "Cybersecurity Analyst",
    school: "Carnegie Mellon University",
    images: ["/images/mentor/Nguyễn Thành Công.jpg"],
    bio: "Chuyên gia về an toàn thông tin, Công mang đến góc nhìn sâu sắc về một ngành học đòi hỏi tính bảo mật cao và tư duy logic nhạy bén.",
    achievements: [
      "Cybersecurity Scholar Award",
      "Speaker tại DEF CON (Sinh viên)",
      "Giải thưởng nghiên cứu hệ thống mạng"
    ]
  },
  {
    id: "m8",
    name: "Nguyễn Thái Anh",
    role: "UI/UX Designer",
    school: "Parsons School of Design",
    images: ["/images/mentor/Nguyễn Thái Anh.jpg"],
    bio: "Một designer cá tính, làm cầu nối giữa Art và STEM (STEAM). Thái Anh đã giúp nhiều bạn xây dựng hồ sơ thiết kế tương tác rất mạnh để apply vào trường top.",
    achievements: [
      "Giải thiết kế tương tác quốc tế",
      "Học bổng Parsons Design",
      "Cố vấn sáng tạo cho quỹ đầu tư"
    ]
  },
  {
    id: "m9",
    name: "Lại Minh Thông",
    role: "Quantitative Analyst",
    school: "Columbia University",
    images: ["/images/mentor/Lại Minh Thông 1.jpg", "/images/mentor/Lại Minh Thông.jpg"],
    bio: "Thông có chuyên môn sâu về phân tích định lượng và mô hình hóa tài chính. Anh sẵn sàng hỗ trợ các bạn đam mê Toán ứng dụng và Khoa học dữ liệu chinh phục các trường Ivy League.",
    achievements: [
      "Học bổng toàn phần Columbia",
      "Quán quân Math Olympiad Quốc gia",
      "Thực tập sinh tại quỹ quant hàng đầu"
    ]
  },
  {
    id: "m10",
    name: "Nguyễn Linh Trang",
    role: "Marketing Analyst",
    school: "UCLA",
    images: ["/images/mentor/Nguyễn Linh Trang.jpg"],
    bio: "Sự kết hợp giữa sáng tạo và tư duy phân tích giúp Linh Trang có góc nhìn đa chiều trong việc xây dựng profile hồ sơ ngoại khóa ngành Business/Marketing.",
    achievements: [
      "Học bổng Presidential UCLA",
      "Sáng lập chiến dịch Marketing cộng đồng",
      "Top 10 Business Case Competition"
    ]
  },
  {
    id: "m11",
    name: "Nguyễn Thị Minh Huyền",
    role: "Environmental Engineer",
    school: "Yale University",
    images: ["/images/mentor/Nguyễn Thị Minh Huyền.jpg"],
    bio: "Là một người nghiên cứu các giải pháp biến đổi khí hậu, Minh Huyền rất giỏi định hướng học sinh cấp 3 xây dựng các dự án cộng đồng về hệ sinh thái và năng lượng sạch.",
    achievements: [
      "Yale Sustainability Scholar",
      "Tác giả nghiên cứu về nước sạch",
      "Lãnh đạo dự án Môi trường trẻ VN"
    ]
  },
  {
    id: "m12",
    name: "Nguyễn Trường Nam",
    role: "Aerospace Engineer",
    school: "Caltech",
    images: ["/images/mentor/Nguyễn Trường Nam.jpg"],
    bio: "Đam mê khám phá vũ trụ và công nghệ hàng không, Nam chia sẻ kinh nghiệm quý báu cho các bạn muốn theo đuổi ngành học yêu cầu kỹ thuật và toán học đỉnh cao.",
    achievements: [
      "Nghiên cứu sinh tại NASA Jet Propulsion",
      "Học bổng toàn phần Caltech",
      "Đại diện tham dự Science Fair toàn cầu"
    ]
  },
  {
    id: "m13",
    name: "Ngô Linh Trang",
    role: "Bioinformatics Data Scientist",
    school: "University of Cambridge",
    images: ["/images/mentor/Ngô Linh Trang.jpg"],
    bio: "Chuyên công tác nghiên cứu tin sinh học, Trang hướng dẫn học sinh kết hợp bộ đôi Sinh học - Khoa học Máy tính để tạo ra những bài luận sắc bén ở hệ Anh.",
    achievements: [
      "Học bổng Gates Cambridge",
      "Báo cáo viên tại hội nghị Gen",
      "Trưởng nhóm dự án Tech in Bio"
    ]
  },
  {
    id: "m14",
    name: "Đỗ Minh Trang",
    role: "Financial Technology (FinTech)",
    school: "Imperial College London",
    images: ["/images/mentor/Đỗ Minh Trang.jpg"],
    bio: "Minh Trang có nền tảng vững vàng về tài chính và công nghệ, luôn tiên phong giúp đàn em khối tự nhiên tìm đường rẽ nhánh vào các ngành FinTech đang cực hot tại London.",
    achievements: [
      "Imperial Excellence Scholarship",
      "Giải nhất FinTech Innovation Series",
      "Chuyên viên ngân hàng số tập đoàn Anh"
    ]
  }
];
