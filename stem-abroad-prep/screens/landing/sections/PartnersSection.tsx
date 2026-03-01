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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Join nextSTEM Today!</h2>
          <p className="text-slate-600 text-lg mb-2">Bạn đã sẵn sàng xây dựng hồ sơ du học thông minh?</p>
          <p className="text-slate-600 mb-8">nextSTEM đồng hành cùng bạn trong hành trình học tập, nghiên cứu và chinh phục thế giới.</p>
        </div>
      </section>
    </>
  );
}
