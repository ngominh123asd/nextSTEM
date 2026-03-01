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
              <SocialIcon icon="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 2 .2 2.5.4.6.2 1 .5 1.5 1 .5.5.8.9 1 1.5.2.5.3 1.3.4 2.5.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 2-.4 2.5-.2.6-.5 1-1 1.5-.5.5-.9.8-1.5 1-.5.2-1.3.3-2.5.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-2-.2-2.5-.4-.6-.2-1-.5-1.5-1-.5-.5-.8-.9-1-1.5-.2-.5-.3-1.3-.4-2.5C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-2 .4-2.5.2-.6.5-1 1-1.5.5-.5.9-.8 1.5-1 .5-.2 1.3-.3 2.5-.4C8.4 2.2 8.8 2.2 12 2.2z" color="#E4405F" />
              <SocialIcon icon="M22.46 6c-.77.35-1.6.59-2.47.7a4.3 4.3 0 0 0 1.88-2.38 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.64-.58 1.38-.58 2.17 0 1.5.76 2.83 1.92 3.61-.71-.02-1.38-.22-1.97-.54v.05c0 2.1 1.49 3.85 3.47 4.25-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.68 2.11 2.9 3.97 2.93A8.6 8.6 0 0 1 2 19.54c-.29 0-.58-.02-.86-.05A12.13 12.13 0 0 0 8.29 21.5c7.55 0 11.69-6.26 11.69-11.69 0-.18-.01-.36-.02-.54A8.36 8.36 0 0 0 22.46 6z" color="#1DA1F2" />
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
