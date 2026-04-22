import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function MachineForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', target_muscle: 'Chest', primary_muscle: '', secondary_muscle: '',
  });
  const [videoFile, setVideoFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) return alert('الرجاء إرفاق فيديو توضيحي للجهاز');
    
    setLoading(true);
    try {
      const fileName = `${Date.now()}_${videoFile.name}`;
      const { error: uploadError } = await supabase.storage.from('videos').upload(`machine-videos/${fileName}`, videoFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('videos').getPublicUrl(`machine-videos/${fileName}`);
      
      const { error: insertError } = await supabase.from('machines').insert([{
        name: formData.name, description: formData.description,
        target_muscle: formData.target_muscle, primary_muscle: formData.primary_muscle,
        secondary_muscle: formData.secondary_muscle ? formData.secondary_muscle : null, 
        video_url: urlData.publicUrl
      }]);
      
      if (insertError) throw insertError;
      alert('تم حفظ الجهاز والفيديو في قاعدة بيانات TechFit بنجاح! ');
      
      setFormData({ name: '', description: '', target_muscle: 'Chest', primary_muscle: '', secondary_muscle: '' });
      setVideoFile(null);
    } catch (err) { alert('تنبيه: حدث خطأ. ' + err.message); } 
    finally { setLoading(false); }
  };

  return (
    <div style={{ background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
      
      <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '12px', color: '#ef4444', fontSize: '20px' }}>🏋️‍♂️</div>
        <div>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>إضافة جهاز جديد</h3>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>البيانات ستظهر فوراً في تطبيق المشتركين</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#334155' }}>اسم الجهاز (Name)</label>
            <input className="modern-input" placeholder="مثال: Bench Press" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#334155' }}>العضلة المستهدفة (Target Muscle)</label>
            <select className="modern-input" value={formData.target_muscle} onChange={e => setFormData({...formData, target_muscle: e.target.value})}>
              <option value="Chest">Chest (صدر)</option>
              <option value="Back">Back (ظهر)</option>
              <option value="Legs">Legs (أرجل)</option>
              <option value="Shoulders">Shoulders (أكتاف)</option>
              <option value="Arms">Arms (أذرع)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#334155' }}>العضلة الأساسية (Primary)</label>
            <input className="modern-input" placeholder="مثال: Pectoralis Major" value={formData.primary_muscle} onChange={e => setFormData({...formData, primary_muscle: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#334155' }}>العضلة المساعدة (Secondary)</label>
            <input className="modern-input" placeholder="اختياري" value={formData.secondary_muscle} onChange={e => setFormData({...formData, secondary_muscle: e.target.value})} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#334155' }}>شرح التمرين</label>
          <textarea className="modern-input" style={{ minHeight: '120px', resize: 'vertical' }} placeholder="اشرح الحركة للمتدرب لتجنب الإصابات..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#334155' }}>فيديو توضيحي (MP4)</label>
          <div className="upload-box">
            <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files[0])} style={{ width: '100%' }} required />
            <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>اضغط هنا لاختيار الفيديو من جهازك</p>
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? ' جاري الرفع والمعالجة...' : 'اعتماد وحفظ الجهاز في النظام'}
        </button>
      </form>
    </div>
  );
}