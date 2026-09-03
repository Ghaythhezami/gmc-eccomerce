import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#20231f] text-[#a09c92] mt-16 pt-12 pb-6 border-t border-[#3a3d38]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 ">
        {/* Footer Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 mb-8 ">
          <div>
            <h4 className="text-white text-base font-display mb-4">GoMyCode Games</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="hover:text-white transition-colors text-sm">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-white transition-colors text-sm">Careers</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors text-sm">Terms & Conditions</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white text-base font-display mb-4">Customer Service</h4>
            <ul className="space-y-3">
              <li><Link to="/help" className="hover:text-white transition-colors text-sm">Help Center</Link></li>
              <li><Link to="/returns" className="hover:text-white transition-colors text-sm">Returns & Refunds</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors text-sm">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white text-base font-display mb-4">For Creators</h4>
            <ul className="space-y-3">
              <li><Link to="/sell" className="hover:text-white transition-colors text-sm">Sell on GoMyCode</Link></li>
              <li><Link to="/masterclass" className="hover:text-white transition-colors text-sm">Teach a Masterclass</Link></li>
              <li><Link to="/affiliate" className="hover:text-white transition-colors text-sm">Affiliate Program</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="border-t border-[#3a3d38] pt-4 text-center text-sm">
          © {currentYear} GoMyCode Games. All rights reserved.
        </div>
      </div>
    </footer>
  );
}