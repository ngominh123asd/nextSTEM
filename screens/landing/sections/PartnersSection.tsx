import React from 'react';
import { PartnerRow } from '../components/SharedUI';

interface PartnersSectionProps {
  partnerLogos: string[];
}

export default function PartnersSection({ partnerLogos }: PartnersSectionProps) {
  return (
    <>
      {/* Partners Section */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-semibold uppercase tracking-wide">Tin cậy bởi</span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-2 mb-4">Đối tác và Khách hàng</h2>
            <p className="text-slate-600">Chúng tôi tự hào được đồng hành cùng các tổ chức giáo dục hàng đầu</p>
          </div>
        </div>
        
        {/* Partner Rows with Animation */}
        <div className="space-y-6">
          <PartnerRow logos={partnerLogos.slice(0, 6)} direction="left" />
          <PartnerRow logos={partnerLogos.slice(6, 12)} direction="right" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] px-8 py-16 sm:px-16 sm:py-24 overflow-hidden shadow-[0_20px_50px_-12px_rgba(30,58,138,0.4)]">
            {/* Minimalist decorative glowing light effects */}
            <div className="absolute top-0 right-[-10%] w-[30rem] h-[30rem] bg-blue-300 rounded-full mix-blend-overlay filter blur-[100px] opacity-30 animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[25rem] h-[25rem] bg-[#1E3A8A] rounded-full mix-blend-overlay filter blur-[80px] opacity-50"></div>
            
            <div className="relative text-center z-10 flex flex-col items-center">
              <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-white text-sm font-semibold tracking-wider mb-6 border border-white/20 uppercase backdrop-blur-sm">
                 Bắt đầu ngay hôm nay
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                Join nextSTEM Today!
              </h2>
              <p className="text-blue-50 text-xl font-medium mb-3 max-w-2xl">
                Bạn đã sẵn sàng xây dựng hồ sơ du học thông minh?
              </p>
              <p className="text-blue-100/80 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                nextSTEM đồng hành cùng bạn trong hành trình học tập, nghiên cứu và chinh phục thế giới.
              </p>
              
              <button className="group relative inline-flex items-center justify-center px-8 py-4 text-[17px] font-bold text-[#1E3A8A] bg-white hover:bg-gray-50 transition-all duration-300 rounded-2xl shadow-xl hover:shadow-[0_10px_40px_rgba(255,255,255,0.25)] hover:-translate-y-1">
                <span className="relative z-10 flex items-center">
                  Tiến vào nền tảng
                  <svg className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
