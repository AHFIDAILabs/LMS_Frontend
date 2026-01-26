export function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 p-10">
      <div className="container-custom">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-lime-400 to-emerald-500 flex items-center justify-center">
                <span className="text-black font-bold text-2xl">A</span>
              </div>
              <div>
                <div className="text-lg font-bold text-white">AI ACCELERATOR</div>
                <div className="text-xs text-gray-500">Innovation Program</div>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Empowering the next generation of AI innovators across Africa
            </p>
          </div>

          {/* Program Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Program</h4>
            <ul className="space-y-3">
              {['Curriculum', 'Instructors', 'FAQ', 'Apply'].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-gray-500 hover:text-lime-400 transition-colors text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {['About Us', 'Partners', 'Contact', 'Careers'].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-gray-500 hover:text-lime-400 transition-colors text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Code of Conduct'].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-gray-500 hover:text-lime-400 transition-colors text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 AI Accelerator Program. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-600">Powered by:</span>
            <span className="text-xs text-gray-500">AI4SID by AHFID</span>
          </div>
        </div>
      </div>
    </footer>
  )
}