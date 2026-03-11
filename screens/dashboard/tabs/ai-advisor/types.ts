export type ThinkingStep = {
  id: string;
  label: string;
  icon: string;
  status: 'active' | 'done';
  timestamp: number;
};

export type ChatMessage = {
  id?: string;
  role: 'user' | 'ai';
  text: string;
  thinkingSteps?: ThinkingStep[];
};

export type ChatMode = 'career' | 'university' | 'essay' | 'general';

export const MODES = [
  { id: 'general' as const, icon: 'smart_toy', label: 'Tư vấn chung', desc: 'Hỏi bất kỳ câu hỏi nào về du học', color: 'from-blue-500 to-indigo-500' },
  { id: 'career' as const, icon: 'work', label: 'Định hướng nghề nghiệp', desc: 'AI phân tích năng lực & gợi ý ngành', color: 'from-violet-500 to-purple-500' },
  { id: 'university' as const, icon: 'school', label: 'Tìm trường phù hợp', desc: 'So sánh & đề xuất trường đại học', color: 'from-emerald-500 to-teal-500' },
  { id: 'essay' as const, icon: 'edit_note', label: 'Hỗ trợ viết luận', desc: 'AI Coach giúp viết Personal Statement', color: 'from-amber-500 to-orange-500' },
] as const;

export const QUICK_PROMPTS: Record<ChatMode, { text: string; icon: string; desc: string }[]> = {
  general: [
    { text: 'Phân tích hồ sơ của tôi', icon: 'person_search', desc: 'AI đánh giá điểm mạnh, yếu & gợi ý cải thiện' },
    { text: 'Lập kế hoạch du học 12 tháng', icon: 'calendar_month', desc: 'Lộ trình chi tiết từng tháng cho hành trình du học' },
    { text: 'So sánh du học Mỹ vs Singapore', icon: 'compare_arrows', desc: 'Phân tích chi phí, cơ hội & yêu cầu đầu vào' },
    { text: 'Học bổng nào phù hợp với tôi?', icon: 'workspace_premium', desc: 'Gợi ý học bổng dựa trên hồ sơ cá nhân' },
  ],
  career: [
    { text: 'Ngành nào phù hợp với tôi?', icon: 'psychology', desc: 'AI phân tích năng lực & đề xuất ngành học' },
    { text: 'Xu hướng nghề nghiệp STEM 2026', icon: 'trending_up', desc: 'Cập nhật thị trường lao động & cơ hội mới' },
    { text: 'So sánh CS vs Data Science', icon: 'balance', desc: 'So sánh chương trình, cơ hội & mức lương' },
    { text: 'Cơ hội việc làm sau du học', icon: 'work', desc: 'Triển vọng nghề nghiệp tại các quốc gia' },
  ],
  university: [
    { text: 'Top trường STEM châu Á', icon: 'school', desc: 'Xếp hạng & thông tin tuyển sinh chi tiết' },
    { text: 'Trường nào có học bổng cao?', icon: 'paid', desc: 'Trường hỗ trợ tài chính tốt nhất cho sinh viên quốc tế' },
    { text: 'Yêu cầu đầu vào MIT', icon: 'checklist', desc: 'Điểm số, bài thi & hoạt động ngoại khoá cần thiết' },
    { text: 'So sánh NUS vs NTU', icon: 'compare', desc: 'Chương trình, chi phí & cơ hội nghề nghiệp' },
  ],
  essay: [
    { text: 'Viết mở bài Personal Statement', icon: 'edit_note', desc: 'AI gợi ý cách mở đầu ấn tượng & thu hút' },
    { text: 'Review bài luận của tôi', icon: 'rate_review', desc: 'Nhận xét chi tiết & gợi ý chỉnh sửa từ AI' },
    { text: 'Cách kể câu chuyện cá nhân', icon: 'auto_stories', desc: 'Kỹ thuật storytelling hiệu quả cho bài luận' },
    { text: 'Lỗi thường gặp khi viết luận', icon: 'error_outline', desc: 'Tránh những sai lầm phổ biến khi viết essay' },
  ],
};

export function mapEventToStep(event: string, data: any): { label: string; icon: string } | null {
  switch (event) {
    case 'start':
      return { label: 'Đang kết nối...', icon: 'cloud_sync' };
    case 'query_classified':
      return { label: `Phân tích câu hỏi${data.complexity ? ` ${data.complexity}` : ''}`, icon: 'psychology' };
    case 'planning':
      return { label: 'Đang lập kế hoạch...', icon: 'event_note' };
    case 'plan_created':
      return { label: `Kế hoạch sẵn sàng (${data.total_agents || data.agents?.length || '?'} chuyên gia)`, icon: 'checklist' };
    case 'executing':
      return { label: 'Bắt đầu thực thi...', icon: 'play_circle' };
    case 'agent_start':
      return { label: `Gọi chuyên gia: ${data.agent_name || data.agent || 'agent'}`, icon: 'support_agent' };
    case 'agent_stage':
      return { label: `${data.agent_name || 'Agent'} đang xử lý...`, icon: 'pending' };
    case 'agent_stage_result':
      return { label: `${data.agent_name || 'Agent'}: hoàn thành bước`, icon: 'task_alt' };
    case 'tool_call':
      return { label: `${data.agent_name || 'Agent'}: ${data.tool_name || data.tool || 'tool'}`, icon: 'build' };
    case 'tool_result':
      return { label: `Kết quả công cụ${data.tool_name ? `: ${data.tool_name}` : ''}`, icon: 'inventory' };
    case 'agent_completed':
      return { label: `${data.agent_name || 'Chuyên gia'} hoàn thành`, icon: 'check_circle' };
    case 'agent_error':
      return { label: `${data.agent_name || 'Agent'}: lỗi`, icon: 'error' };
    case 'synthesizing':
      return { label: 'Đang tổng hợp câu trả lời...', icon: 'auto_awesome' };
    default:
      return null;
  }
}