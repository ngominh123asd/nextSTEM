export interface LandingProps {
  onStartDemo: () => void;
  onOpenAuth: () => void;
  onOpenAbout: () => void;
  onOpenSpeed: () => void;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  highlighted: boolean;
}

export const stackingCardsData = [
  { number: "01", title: "AI Advisor", desc: "Gợi ý định hướng ngành học, quốc gia, trường dựa trên GPA và sở thích của bạn một cách cá nhân hoá. Công nghệ LLM fine-tune theo học bổng + ngành học giúp bạn có lộ trình tối ưu nhất.", image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop" },
  { number: "02", title: "Project Builder", desc: "Hướng dẫn xây dựng dự án STEM từng bước để tạo điểm nhấn độc đáo cho hồ sơ du học. Phương pháp Bloom + Design Thinking giúp CV nổi bật với các dự án nghiên cứu mini.", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop" },
  { number: "03", title: "Portfolio Dashboard", desc: "Lưu toàn bộ hoạt động – kỹ năng – chứng chỉ. Tự động sinh CV và Personal Statement theo chuẩn CommonApp, UCAS chỉ với vài cú click dễ dàng.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop" },
  { number: "04", title: "Essay & Interview Coach", desc: "AI Coach phản hồi bài luận, phỏng vấn và câu chuyện cá nhân với phân tích sâu sắc. LLM Scoring + Sentiment Analysis giúp cải thiện liên tục kỹ năng viết và giao tiếp.", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop" },
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
