import React from 'react';
import { ImpactCard } from '../components/SharedUI';

export default function ImpactSection() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-semibold uppercase tracking-wide">Impact & Vision</span>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-2 mb-4">Hành trình từ học sinh Việt đến công dân toàn cầu</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <ImpactCard 
            title="Giáo dục Việt Nam"
            subtitle="Education Impact"
            desc="Giúp học sinh hình thành tư duy khoa học và nghiên cứu sớm thông qua các dự án STEM thực tế và hướng dẫn cá nhân hoá."
          />
          <ImpactCard 
            title="Kinh tế – Khởi nghiệp"
            subtitle="Economic Impact"
            desc="Mô hình AI EdTech đầu tiên áp dụng chuyên xây hồ sơ du học thông minh dành cho STEM, tạo nền tảng cho thế hệ khởi nghiệp công nghệ mới."
          />
          <ImpactCard 
            title="Phát triển cá nhân"
            subtitle="Personal Growth"
            desc="Giúp học sinh hiểu rõ bản thân, chọn hướng đi phù hợp, tự tin ra thế giới với hồ sơ cá nhân độc đáo và năng lực STEAM vững chắc."
          />
        </div>
      </div>
    </section>
  );
}
