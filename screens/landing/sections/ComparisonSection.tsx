import React from 'react';
import { CompareItem } from '../components/SharedUI';

interface ComparisonSectionProps {
  onStartDemo: () => void;
}

export default function ComparisonSection({ onStartDemo }: ComparisonSectionProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Vì sao nextSTEM khác biệt?</h2>
          <p className="text-slate-600 text-lg">So sánh nextSTEM với các phương pháp tư vấn truyền thống</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Traditional */}
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
            <div className="text-center mb-6">
              <p className="text-sm font-medium text-slate-500 mb-2">Tư vấn truyền thống</p>
              <p className="text-lg font-normal">Chi phí <span className="text-3xl font-bold text-slate-800">đắt đỏ</span></p>
            </div>
            <ul className="space-y-4 mb-8">
              <CompareItem icon="close" negative text="Không có AI gợi ý dự án" />
              <CompareItem icon="warning" warning text="Chỉ mentor hoặc chỉ tài liệu" />
              <CompareItem icon="close" negative text="Chủ yếu tiếng Anh" />
              <CompareItem icon="warning" warning text="Portfolio rời rạc" />
            </ul>
            <button className="w-full py-3 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-100 transition-colors">
              Phương pháp cũ
            </button>
          </div>
          
          {/* nextSTEM */}
          <div className="bg-primary rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
              Khuyên dùng
            </div>
            <div className="text-center mb-6">
              <p className="text-sm font-medium text-white/80 mb-2">nextSTEM</p>
              <p className="text-3xl font-bold">Tiết kiệm <span className="text-lg font-normal">chi phí</span></p>
            </div>
            <ul className="space-y-4 mb-8">
              <CompareItem icon="check" positive text="AI gợi ý dự án cá nhân (độc nhất)" white />
              <CompareItem icon="check" positive text="Mentor thật + AI Coach" white />
              <CompareItem icon="check" positive text="Nội dung Việt – Anh" white />
              <CompareItem icon="check" positive text="Portfolio chuẩn CommonApp" white />
            </ul>
            <button 
              onClick={onStartDemo}
              className="w-full py-3 bg-white text-primary rounded-lg font-semibold hover:bg-slate-100 transition-colors"
            >
              Trải nghiệm ngay
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
