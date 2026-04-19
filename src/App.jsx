import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// إعدادات سوبابيس الخاصة بمشروعك
const supabase = createClient('https://fecxbivkntyupuqqnevd.supabase.co', 'sb_publishable_5QH4ck-8BTDRC6bnYdfxOw_io9c8oWC');

export default function App() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',               // اسم الجهاز (عمود name)
    description: '',        // شرح الحركة (عمود description)
    target_muscle: 'Chest', // القسم العام (عمود target_muscle)
    primary_muscle: '',     // العضلة الأساسية (عمود primary_muscle)
    secondary_muscle: '',   // العضلة الثانوية (عمود secondary_muscle)
  });
  const [videoFile, setVideoFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) return alert('الرجاء إرفاق فيديو توضيحي للجهاز');
    
    setLoading(true);
    try {
      // 1. رفع الفيديو إلى Storage (تأكد من وجود Bucket باسم videos)
      const fileName = `${Date.now()}_${videoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('videos').upload(`machine-videos/${fileName}`, videoFile);
      
      if (uploadError) throw uploadError;

      // 2. الحصول على رابط الفيديو العام
      const { data: urlData } = supabase.storage.from('videos').getPublicUrl(`machine-videos/${fileName}`);
      
      // 3. الإضافة في جدول machines بناءً على الصور المرفقة
      const { error: insertError } = await supabase.from('machines').insert([{
        name: formData.name,
        description: formData.description,
        target_muscle: formData.target_muscle,
        primary_muscle: formData.primary_muscle,
        secondary_muscle: formData.secondary_muscle,
        video_url: urlData.publicUrl
      }]);
      
      if (insertError) throw insertError;
      
      alert('تم اعتماد الجهاز وحفظ كافة البيانات بنجاح! 🚀');
      
      // تصفير الفورم بعد النجاح
      setFormData({ name: '', description: '', target_muscle: 'Chest', primary_muscle: '', secondary_muscle: '' });
      setVideoFile(null);

    } catch (err) { 
      alert('حدث خطأ أثناء المعالجة: ' + err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        * { box-sizing: border-box; font-family: 'Tajawal', sans-serif; }
        body { margin: 0; background-color: #f8fafc; color: #1e293b; overflow: hidden; }
        .modern-input { width: 100%; padding: 14px 16px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #fff; font-size: 15px; transition: all 0.3s ease; color: #0f172a; }
        .modern-input:focus { border-color: #ef4444; outline: none; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1); }
        .upload-box { border: 2px dashed #cbd5e1; padding: 25px; border-radius: 16px; text-align: center; cursor: pointer; transition: all 0.3s ease; background: #f8fafc; }
        .upload-box:hover { border-color: #ef4444; background: #fef2f2; }
        .btn-submit { width: 100%; padding: 16px; border-radius: 12px; border: none; background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); color: white; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3); }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.4); }
        .btn-submit:disabled { background: #94a3b8; cursor: not-allowed; }
        .glass-header { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); border-bottom: 1px solid #e2e8f0; }
        .nav-item { padding: 14px 20px; border-radius: 12px; color: #64748b; font-weight: 500; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        .nav-active { background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
      `}</style>

      <div style={{ display: 'flex', height: '100vh', direction: 'rtl' }}>
        <aside style={{ width: '280px', background: '#0f172a', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '50px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: 'bold' }}>T</div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '22px', fontWeight: '800' }}>TechFit Admin</h2>
          </div>
          <nav style={{ flex: 1 }}>
            <div className="nav-item nav-active">⚡️ إدارة الأجهزة</div>
            <div className="nav-item">👥 قائمة المشتركين</div>
            <div className="nav-item">📊 التقارير</div>
          </nav>
        </aside>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <header className="glass-header" style={{ position: 'sticky', top: 0, zIndex: 5, padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>تحديث قاعدة البيانات</h1>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>أضف الأجهزة الجديدة وعضلاتها المستهدفة</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '700', fontSize: '14px' }}>المدرب ثامر</div>
                <div style={{ color: '#64748b', fontSize: '12px' }}>مشرف النظام</div>
              </div>
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👨‍💻</div>
            </div>
          </header>

          <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            <div style={{ background: '#fff', borderRadius: '24px', padding: '35px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* الصف الأول: اسم الجهاز والقسم */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px' }}>اسم الجهاز (Name)</label>
                    <input className="modern-input" placeholder="مثال: Bench Press" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px' }}>القسم المستهدف (Target Muscle)</label>
                    <select className="modern-input" value={formData.target_muscle} onChange={e => setFormData({...formData, target_muscle: e.target.value})}>
                      <option value="Chest">Chest (صدر)</option>
                      <option value="Back">Back (ظهر)</option>
                      <option value="Legs">Legs (أرجل)</option>
                      <option value="Shoulders">Shoulders (أكتاف)</option>
                      <option value="Arms">Arms (أذرع)</option>
                    </select>
                  </div>
                </div>

                {/* الصف الثاني: العضلات الأساسية والثانوية */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px' }}>العضلة الأساسية (Primary Muscle)</label>
                    <input className="modern-input" placeholder="مثال: Pectoralis Major" value={formData.primary_muscle} onChange={e => setFormData({...formData, primary_muscle: e.target.value})} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px' }}>العضلة الثانوية / المساعدة (Secondary Muscle)</label>
                    <input className="modern-input" placeholder="مثال: Triceps" value={formData.secondary_muscle} onChange={e => setFormData({...formData, secondary_muscle: e.target.value})} />
                  </div>
                </div>

                {/* الصف الثالث: شرح الحركة الفنية */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px' }}>شرح الحركة الفنية (Movement Description)</label>
                  <textarea className="modern-input" style={{ minHeight: '100px', resize: 'vertical' }} placeholder="اشرح بالتفصيل كيفية أداء التمرين على الجهاز..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                </div>

                {/* الصف الرابع: الفيديو */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px' }}>فيديو توضيحي للجهاز (Video URL Storage)</label>
                  <div className="upload-box">
                    <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files[0])} style={{ width: '100%' }} required />
                    <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#64748b' }}>يفضل أن يكون الامتداد MP4 وبحجم مناسب</p>
                  </div>
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? '⏳ جاري الحفظ والرفع...' : 'اعتماد وحفظ الجهاز في النظام'}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}