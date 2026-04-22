import React from 'react';

export default function Sidebar({ adminName, onLogout, activeTab, setActiveTab }) {
  return (
    <aside style={{ width: '280px', background: '#0f172a', padding: '30px 24px', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #1e293b' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '50px' }}>
        <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '22px', fontWeight: 'bold' }}>T</div>
        <h2 style={{ color: '#fff', margin: 0, fontSize: '24px', fontWeight: '800' }}>TechFit</h2>
      </div>
      
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* زر إضافة جهاز */}
        <div 
          onClick={() => setActiveTab('add')}
          style={{ padding: '14px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: '0.3s',
            background: activeTab === 'add' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)' : 'transparent',
            color: activeTab === 'add' ? '#ef4444' : '#94a3b8',
            border: activeTab === 'add' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid transparent',
            fontWeight: activeTab === 'add' ? '700' : '500'
          }}>
          <span style={{ fontSize: '20px' }}></span> إضافة جهاز جديد
        </div>
        
        {/* زر إدارة الأجهزة */}
        <div 
          onClick={() => setActiveTab('list')}
          style={{ padding: '14px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: '0.3s',
            background: activeTab === 'list' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)' : 'transparent',
            color: activeTab === 'list' ? '#ef4444' : '#94a3b8',
            border: activeTab === 'list' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid transparent',
            fontWeight: activeTab === 'list' ? '700' : '500'
          }}>
          <span style={{ fontSize: '20px' }}></span> إدارة الأجهزة
        </div>

        {/* زر إدارة العروض */}
        <div 
          onClick={() => setActiveTab('banners')}
          style={{ padding: '14px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: '0.3s',
            background: activeTab === 'banners' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)' : 'transparent',
            color: activeTab === 'banners' ? '#ef4444' : '#94a3b8',
            border: activeTab === 'banners' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid transparent',
            fontWeight: activeTab === 'banners' ? '700' : '500'
          }}>
          <span style={{ fontSize: '20px' }}></span> إدارة العروض
        </div>

        {/* زر إدارة الحصص (الجديد) */}
        <div 
          onClick={() => setActiveTab('classes')}
          style={{ padding: '14px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: '0.3s',
            background: activeTab === 'classes' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)' : 'transparent',
            color: activeTab === 'classes' ? '#ef4444' : '#94a3b8',
            border: activeTab === 'classes' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid transparent',
            fontWeight: activeTab === 'classes' ? '700' : '500'
          }}>
          <span style={{ fontSize: '20px' }}></span> إدارة الحصص
        </div>
        
      </nav>
      
      <button onClick={onLogout} style={{ padding: '14px', borderRadius: '12px', border: '1px solid #334155', background: 'rgba(30, 41, 59, 0.5)', color: '#f87171', cursor: 'pointer', fontWeight: 'bold', marginTop: 'auto' }}>
         تسجيل خروج 
      </button>
    </aside>
  );
}