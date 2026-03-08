import React from 'react';
import { SocialIcon } from '../components/SharedUI';

interface FooterProps {
  onOpenAbout: () => void;
}

export default function Footer({ onOpenAbout }: FooterProps) {
  return (
    <footer className="bg-slate-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/images/logo_footer.png" alt="nextSTEM logo" className="w-[12rem] h-[12rem] object-contain" />
            </div>
            <p className="text-sm text-slate-400 mb-6">
              Nền tảng AI Study Coach giúp học sinh Việt Nam chinh phục thế giới.
            </p>
            <div className="flex gap-3">
              <SocialIcon icon="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" color="#1877F2" href="https://www.facebook.com/nextstemvietnam" />
              <SocialIcon icon="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" color="#FF0000" />
              <SocialIcon icon="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" color="#E4405F" />
              <SocialIcon icon="M20.447 20.452h-3.554v-5.569c0-1.327-.027-3.037-1.849-3.037-1.851 0-2.132 1.445-2.132 2.939v5.667H9.358V9h3.414v1.561h.049c.476-.9 1.637-1.849 3.37-1.849 3.602 0 4.267 2.369 4.267 5.455v6.285zM5.337 7.433c-1.144 0-2.07-.927-2.07-2.07 0-1.143.926-2.07 2.07-2.07 1.143 0 2.07.927 2.07 2.07 0 1.143-.927 2.07-2.07 2.07zm1.777 13.019H3.56V9h3.554v11.452z" color="#0077B5" />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Sản phẩm</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-primary transition-colors">AI Advisor</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Project Builder</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Portfolio Dashboard</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Mentor Hub</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Essay Coach</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Công ty</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><button onClick={onOpenAbout} className="hover:text-primary transition-colors">Về chúng tôi</button></li>
              <li><a href="#" className="hover:text-primary transition-colors">Đội ngũ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Tuyển dụng</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Liên hệ</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                Hà Nội, Việt Nam
              </li>
              <li>
                <a href="tel:+84123456789" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm text-primary">call</span>
                  +84 (123) 456-7890
                </a>
              </li>
              <li>
                <a href="mailto:contact@nextstem.ai" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm text-primary">mail</span>
                  contact@nextstem.ai
                </a>
              </li>
              <li>
                <a href="https://www.nextSTEM.ai" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm text-primary">language</span>
                  www.nextSTEM.ai
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">© 2026 nextSTEM EdTech Co. All rights reserved | Tạo ra để giúp học sinh Việt chinh phục thế giới.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
