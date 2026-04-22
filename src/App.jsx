import React, { useState } from 'react';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import MachineForm from './components/MachineForm';
import MachineList from './components/MachineList'; 
import BannerManager from './components/BannerManager';
import ClassManager from './components/ClassManager';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminName, setAdminName] = useState('');
  
  // الحالة الافتراضية للوحة التحكم
  const [activeTab, setActiveTab] = useState('add'); 

  if (!isLoggedIn) {
    return <Login onLoginSuccess={(name) => { setAdminName(name); setIsLoggedIn(true); }} />;
  }

  // دالة صغيرة لترتيب العناوين في الهيدر حسب التاب المفتوح
  const getHeaderTitle = () => {
    if (activeTab === 'add') return 'إضافة جهاز جديد';
    if (activeTab === 'list') return 'قاعدة بيانات الأجهزة';
    if (activeTab === 'banners') return 'إدارة العروض الترويجية';
    if (activeTab === 'classes') return 'إدارة حصص اللياقة'; // العنوان الجديد
  };

  const getHeaderDesc = () => {
    if (activeTab === 'add') return 'أضف بيانات وفيديو الجهاز';
    if (activeTab === 'list') return 'استعرض، عدّل، أو احذف الأجهزة الموجودة';
    if (activeTab === 'banners') return 'أضف واحذف الصور الإعلانية المعروضة في التطبيق الرئيسي';
    if (activeTab === 'classes') return 'جدولة وإدارة الحصص التدريبية وتعيين المدربين لها'; // الوصف الجديد
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        * { box-sizing: border-box; font-family: 'Tajawal', sans-serif; }
        body { margin: 0; background-color: #f1f5f9; color: #1e293b; overflow: hidden; }
        
        .modern-input { width: 100%; padding: 14px 16px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #fff; font-size: 15px; color: #0f172a; transition: all 0.3s ease; }
        .modern-input:focus { border-color: #ef4444; outline: none; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1); }
        
        .btn-submit { width: 100%; padding: 16px; border-radius: 12px; border: none; background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); color: white; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s; }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4); }
        .btn-submit:disabled { background: #94a3b8; cursor: not-allowed; box-shadow: none; }
        
        /* ستايل مربع رفع الملفات اللي نحتاجه في فورم الأجهزة والعروض */
        .upload-box { border: 2px dashed #cbd5e1; padding: 25px; border-radius: 16px; text-align: center; cursor: pointer; background: #f8fafc; transition: 0.3s; }
        .upload-box:hover { border-color: #ef4444; background: #fef2f2; }
      `}</style>

      <div style={{ display: 'flex', height: '100vh', direction: 'rtl' }}>
        
        <Sidebar adminName={adminName} onLogout={() => setIsLoggedIn(false)} activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          
          <header style={{ position: 'sticky', top: 0, zIndex: 5, padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
                {getHeaderTitle()}
              </h1>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                {getHeaderDesc()}
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '700', fontSize: '14px' }}>المدير {adminName}</div>
                <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}>Admin</div>
              </div>
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👨‍💻</div>
            </div>
          </header>

          <div style={{ padding: '40px', maxWidth: activeTab === 'add' ? '1000px' : '1200px', margin: '0 auto', width: '100%' }}>
            {/* الشاشة تتغير بناءً على التاب المختار */}
            {activeTab === 'add' && <MachineForm />}
            {activeTab === 'list' && <MachineList />}
            {activeTab === 'banners' && <BannerManager />}
            {activeTab === 'classes' && <ClassManager />} {/* الشاشة الجديدة */}
          </div>
          
        </main>
      </div>
    </>
  );
}