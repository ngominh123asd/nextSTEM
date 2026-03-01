import React, { useState } from 'react';
import GlassSurface from '../../../components/GlassSurface';
import { UserData } from '../types';
import { BlobDecor, GlassCard, GlassHeader, PageTitle } from '../components/SharedUI';

interface RoadmapStep {
  id: number;
  title: string;
  desc: string;
  icon: string;
  color: string;
  duration: string;
  tasks: { text: string; done: boolean }[];
}

export default function RoadmapTab({ userData }: { userData: UserData }) {
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);
  const [generating, setGenerating] = useState(false);

  const generateRoadmap = () => {
    setGenerating(true);
    setTimeout(() => {
      setRoadmap([
        {
          id: 1, title: 'Khám phá & Định hướng', desc: 'Tìm hiểu bản thân, xác định mục tiêu du học và ngành học phù hợp.',
          icon: 'explore', color: 'from-blue-500 to-blue-600', duration: 'Tháng 1 – 2',
          tasks: [
            { text: 'Hoàn thành bài trắc nghiệm định hướng nghề nghiệp', done: false },
            { text: 'Nghiên cứu 5 ngành học tiềm năng', done: false },
            { text: 'Lập danh sách 10 trường mục tiêu', done: false },
          ],
        },
        {
          id: 2, title: 'Nâng cao Năng lực', desc: 'Chuẩn bị bài thi chuẩn hoá và phát triển kỹ năng cần thiết.',
          icon: 'trending_up', color: 'from-indigo-500 to-indigo-600', duration: 'Tháng 3 – 5',
          tasks: [
            { text: 'Đăng ký lớp luyện thi IELTS / TOEFL', done: false },
            { text: 'Ôn tập và thi SAT / AP', done: false },
            { text: 'Tham gia ít nhất 1 khóa học online chuyên ngành', done: false },
            { text: 'Xây dựng dự án STEM cá nhân', done: false },
          ],
        },
        {
          id: 3, title: 'Xây dựng Hồ sơ', desc: 'Hoàn thiện các hoạt động ngoại khoá và bắt đầu viết luận.',
          icon: 'description', color: 'from-violet-500 to-purple-500', duration: 'Tháng 6 – 8',
          tasks: [
            { text: 'Viết bản thảo đầu tiên Personal Statement', done: false },
            { text: 'Cập nhật Portfolio với dự án và thành tích', done: false },
            { text: 'Xin thư giới thiệu từ 2 giáo viên', done: false },
            { text: 'Tham gia hoạt động tình nguyện / leadership', done: false },
          ],
        },
        {
          id: 4, title: 'Nộp hồ sơ & Học bổng', desc: 'Hoàn tất hồ sơ ứng tuyển và tìm kiếm cơ hội học bổng.',
          icon: 'send', color: 'from-emerald-500 to-teal-500', duration: 'Tháng 9 – 11',
          tasks: [
            { text: 'Hoàn thiện bài luận cuối cùng', done: false },
            { text: 'Nộp hồ sơ Early Decision / Early Action', done: false },
            { text: 'Nộp đơn xin ít nhất 3 học bổng', done: false },
            { text: 'Chuẩn bị hồ sơ Regular Decision', done: false },
          ],
        },
        {
          id: 5, title: 'Chuẩn bị Khởi hành', desc: 'Hoàn tất thủ tục visa, chỗ ở và chuẩn bị cho cuộc sống mới.',
          icon: 'flight_takeoff', color: 'from-amber-500 to-orange-500', duration: 'Tháng 12 – 1',
          tasks: [
            { text: 'Xin visa du học', done: false },
            { text: 'Đặt chỗ ở (ký túc xá / nhà trọ)', done: false },
            { text: 'Mua vé máy bay và chuẩn bị hành lý', done: false },
            { text: 'Tham gia orientation online của trường', done: false },
          ],
        },
      ]);
      setGenerating(false);
    }, 1500);
  };

  const toggleTask = (stepId: number, taskIdx: number) => {
    setRoadmap(prev => prev.map(s =>
      s.id === stepId ? { ...s, tasks: s.tasks.map((t, i) => i === taskIdx ? { ...t, done: !t.done } : t) } : s
    ));
  };

  const getStepProgress = (step: RoadmapStep) => {
    if (step.tasks.length === 0) return 0;
    return Math.round((step.tasks.filter(t => t.done).length / step.tasks.length) * 100);
  };

  return (
    <>
      <PageTitle icon="map" title="Lộ Trình Học Tập" subtitle="Kế hoạch cá nhân hóa cho mục tiêu của bạn" />

      {roadmap.length === 0 ? (
        /* Empty state */
        <GlassCard>
          <div className="flex flex-col items-center py-16 relative z-10">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm flex items-center justify-center border border-white/60 mb-6">
              <span className="material-symbols-outlined text-4xl text-blue-400">map</span>
            </div>
            <h3 className="text-xl font-bold text-[#1E3A8A] mb-2">Chưa có lộ trình</h3>
            <p className="text-slate-500 text-center max-w-md mb-8">
              Hãy để AI tạo lộ trình học tập cá nhân hóa dựa trên mục tiêu<br />và năng lực của bạn
            </p>
            <GlassSurface
              width="auto"
              height={48}
              borderRadius={16}
              className="cursor-pointer hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
              onClick={generateRoadmap}
            >
              <span className="text-white font-semibold px-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
                {generating ? 'Đang tạo...' : 'Tạo lộ trình với AI'}
              </span>
            </GlassSurface>
          </div>
        </GlassCard>
      ) : (
        /* Roadmap content */
        <div className="space-y-6">
          {/* Progress overview */}
          <GlassCard>
            <BlobDecor className="w-48 h-48 -top-16 -right-16 bg-blue-200/20" />
            <GlassHeader icon="analytics" title="Tiến độ tổng quan" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
              <div className="text-center p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60">
                <p className="text-2xl font-extrabold text-[#1E3A8A]">{roadmap.length}</p>
                <p className="text-xs text-slate-500 font-medium">Giai đoạn</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60">
                <p className="text-2xl font-extrabold text-[#1E3A8A]">{roadmap.reduce((a, s) => a + s.tasks.length, 0)}</p>
                <p className="text-xs text-slate-500 font-medium">Nhiệm vụ</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60">
                <p className="text-2xl font-extrabold text-emerald-600">{roadmap.reduce((a, s) => a + s.tasks.filter(t => t.done).length, 0)}</p>
                <p className="text-xs text-slate-500 font-medium">Hoàn thành</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60">
                <p className="text-2xl font-extrabold text-amber-600">
                  {Math.round(roadmap.reduce((a, s) => a + s.tasks.filter(t => t.done).length, 0) / roadmap.reduce((a, s) => a + s.tasks.length, 0) * 100) || 0}%
                </p>
                <p className="text-xs text-slate-500 font-medium">Tổng tiến độ</p>
              </div>
            </div>
          </GlassCard>

          {/* Steps timeline */}
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-indigo-200 via-violet-200 via-emerald-200 to-amber-200 hidden sm:block" />

            <div className="space-y-5">
              {roadmap.map((step, idx) => {
                const progress = getStepProgress(step);
                return (
                  <div key={step.id} className="sm:pl-16 relative">
                    <div className={`hidden sm:flex absolute left-0 top-6 w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} items-center justify-center text-white font-bold text-lg shadow-lg z-10`}>
                      {idx + 1}
                    </div>

                    <GlassCard className="hover:shadow-[0_12px_40px_rgba(30,58,138,0.1)] transition-all duration-300">
                      <BlobDecor className="w-32 h-32 -top-10 -right-10 bg-blue-200/20" />
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-md sm:hidden`}>
                              <span className="text-white font-bold text-sm">{idx + 1}</span>
                            </div>
                            <div>
                              <h3 className="font-bold text-[#1E3A8A] text-lg">{step.title}</h3>
                              <p className="text-sm text-slate-500">{step.desc}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-400 bg-white/50 px-3 py-1 rounded-full border border-white/60">{step.duration}</span>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${progress === 100 ? 'bg-emerald-50/60 text-emerald-600' : progress > 0 ? 'bg-blue-50/60 text-blue-600' : 'bg-slate-50/60 text-slate-400'}`}>
                              {progress}%
                            </span>
                          </div>
                        </div>

                        <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden mb-4">
                          <div className={`h-full rounded-full bg-gradient-to-r ${step.color} transition-all duration-500`} style={{ width: `${progress}%` }} />
                        </div>

                        <div className="space-y-2">
                          {step.tasks.map((task, tIdx) => (
                            <button
                              key={tIdx}
                              onClick={() => toggleTask(step.id, tIdx)}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${task.done ? 'bg-emerald-50/40 border border-emerald-200/40' : 'bg-white/40 border border-white/60 hover:bg-white/60'}`}
                            >
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${task.done ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm' : 'border-2 border-slate-300'}`}>
                                {task.done && <span className="material-symbols-outlined text-white text-sm">check</span>}
                              </div>
                              <span className={`text-sm font-medium ${task.done ? 'text-emerald-700 line-through' : 'text-[#1E3A8A]'}`}>{task.text}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Regenerate button */}
          <div className="flex justify-center pt-4">
            <GlassSurface
              width="auto"
              height={44}
              borderRadius={16}
              className="cursor-pointer hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
              onClick={generateRoadmap}
            >
              <span className="text-white text-sm font-semibold px-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">refresh</span>Tạo lại lộ trình
              </span>
            </GlassSurface>
          </div>
        </div>
      )}
    </>
  );
}
