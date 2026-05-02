import React from 'react';

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
            <div className="flex gap-3 items-center">
              {/* Facebook - circular icon, white circle behind works perfectly */}
              <a href="https://www.facebook.com/nextstemvietnam" target="_blank" rel="noopener noreferrer" className="w-7 h-7 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="12" fill="white" />
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
                </svg>
              </a>
              {/* YouTube - rounded rect + play triangle, no background circle */}
              <a href="#" className="w-7 h-7 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" fill="#FF0000" />
                  <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="white" />
                </svg>
              </a>
              {/* Instagram - gradient background + white camera icon */}
              <a href="#" className="w-7 h-7 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <defs>
                    <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
                      <stop offset="0%" stopColor="#fdf497" />
                      <stop offset="5%" stopColor="#fdf497" />
                      <stop offset="45%" stopColor="#fd5949" />
                      <stop offset="60%" stopColor="#d6249f" />
                      <stop offset="90%" stopColor="#285AEB" />
                    </radialGradient>
                  </defs>
                  <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
                  <path d="M12 7.378c-2.552 0-4.622 2.07-4.622 4.622S9.448 16.622 12 16.622 16.622 14.552 16.622 12 14.552 7.378 12 7.378zm0 7.627A3.009 3.009 0 0 1 8.995 12 3.009 3.009 0 0 1 12 8.995 3.009 3.009 0 0 1 15.005 12 3.009 3.009 0 0 1 12 15.005zm4.804-7.954a1.077 1.077 0 1 0 0 2.155 1.077 1.077 0 0 0 0-2.155zM17.871 6.13c-.882-.882-2.16-1.37-3.594-1.37H9.723c-2.964 0-4.963 1.999-4.963 4.963v4.554c0 1.434.488 2.712 1.37 3.594.882.882 2.16 1.37 3.594 1.37h4.554c1.434 0 2.712-.488 3.594-1.37.882-.882 1.37-2.16 1.37-3.594V9.723c0-1.434-.488-2.712-1.37-3.594zm.229 8.148c0 1.068-.37 1.985-1.042 2.656-.672.672-1.588 1.042-2.656 1.042H9.598c-1.068 0-1.985-.37-2.656-1.042C6.27 16.262 5.9 15.346 5.9 14.278V9.724c0-1.068.37-1.985 1.042-2.656C7.614 6.396 8.53 6.026 9.598 6.026h4.804c1.068 0 1.985.37 2.656 1.042.672.672 1.042 1.588 1.042 2.656v4.554z" fill="white" />
                </svg>
              </a>
              {/* LinkedIn - blue rounded rect + white "in" text */}
              <a href="#" className="w-7 h-7 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <rect width="24" height="24" rx="4" fill="#0077B5" />
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.327-.027-3.037-1.849-3.037-1.851 0-2.132 1.445-2.132 2.939v5.667H9.358V9h3.414v1.561h.049c.476-.9 1.637-1.849 3.37-1.849 3.602 0 4.267 2.369 4.267 5.455v6.285zM5.337 7.433c-1.144 0-2.07-.927-2.07-2.07 0-1.143.926-2.07 2.07-2.07 1.143 0 2.07.927 2.07 2.07 0 1.143-.927 2.07-2.07 2.07zm1.777 13.019H3.56V9h3.554v11.452z" fill="white" />
                </svg>
              </a>
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
                  <span className="material-symbols-outlined text-sm text-primary flex-shrink-0">call</span>
                  <span className="whitespace-nowrap">+84 (123) 456-7890</span>
                </a>
              </li>
              <li>
                <a href="mailto:nextstemvietnam@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm text-primary">mail</span>
                  nextstemvietnam@gmail.com
                </a>
              </li>
              <li>
                <a href="https://nextstemvietnam.vercel.app" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm text-primary">language</span>
                  nextstemvietnam.vercel.app
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
