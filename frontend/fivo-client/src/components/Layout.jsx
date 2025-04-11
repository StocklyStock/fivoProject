// 📄 src/components/Layout.jsx

import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 고정된 헤더 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
        <Header />
      </div>

      {/* 헤더 높이만큼 패딩 확보 */}
      <main className="pt-[72px] px-4 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
