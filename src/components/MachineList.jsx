import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function MachineList() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // حالات التعديل (Edit State)
  const [editingMachine, setEditingMachine] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newVideoFile, setNewVideoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // جلب الأجهزة أول ما تفتح الصفحة
  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('machines').select('*').order('id', { ascending: false });
    if (error) alert('خطأ في جلب البيانات: ' + error.message);
    else setMachines(data || []);
    setLoading(false);
  };

  // دالة الحذف
  const handleDelete = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من حذف جهاز "${name}" نهائياً؟`)) return;
    
    const { error } = await supabase.from('machines').delete().eq('id', id);
    if (error) alert('حدث خطأ أثناء الحذف: ' + error.message);
    else {
      alert('تم الحذف بنجاح ');
      fetchMachines(); // تحديث القائمة
    }
  };

  // دالة الحفظ بعد التعديل
  // دالة الحفظ بعد التعديل
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let video_url = editingMachine.video_url; // نحتفظ بالرابط القديم مبدئياً

      // إذا رفع فيديو جديد، لازم نحذف القديم أولاً ثم نرفع الجديد
      if (newVideoFile) {
        
        // 1. استخراج مسار الفيديو القديم من الرابط وحذفه من التخزين
        if (editingMachine.video_url) {
          // الرابط عادة يكون بهذا الشكل ويحتوي على اسم الـ bucket اللي هو videos
          const oldPath = editingMachine.video_url.split('/videos/')[1]; 
          if (oldPath) {
            // أمر الحذف الفعلي من سيرفر سوبابيس
            const { error: deleteError } = await supabase.storage.from('videos').remove([oldPath]);
            if (deleteError) console.error("لم يتمكن من حذف الفيديو القديم:", deleteError);
          }
        }

        // 2. رفع الفيديو الجديد
        const fileName = `${Date.now()}_${newVideoFile.name}`;
        const { error: uploadError } = await supabase.storage.from('videos').upload(`machine-videos/${fileName}`, newVideoFile);
        if (uploadError) throw uploadError;
        
        // 3. جلب الرابط الجديد
        const { data: urlData } = supabase.storage.from('videos').getPublicUrl(`machine-videos/${fileName}`);
        video_url = urlData.publicUrl;
      }

      // 4. تحديث البيانات في الجدول
      const { error: updateError } = await supabase.from('machines').update({
        name: editForm.name,
        description: editForm.description,
        target_muscle: editForm.target_muscle,
        primary_muscle: editForm.primary_muscle,
        secondary_muscle: editForm.secondary_muscle || null,
        video_url: video_url
      }).eq('id', editingMachine.id);

      if (updateError) throw updateError;
      
      alert('تم تحديث بيانات الجهاز بنجاح! ✨');
      setEditingMachine(null); // إغلاق نافذة التعديل
      setNewVideoFile(null);
      fetchMachines(); // تحديث القائمة
      
    } catch (err) {
      alert('خطأ في التحديث: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontWeight: 'bold' }}> جاري تحميل الأجهزة...</div>;

  return (
    <div>
      {/* عرض إحصائية عدد الأجهزة */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '15px', borderRadius: '12px', fontSize: '24px' }}></div>
        <div>
          <h3 style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>إجمالي الأجهزة في النظام</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{machines.length} جهاز</p>
        </div>
      </div>

      {/* نافذة التعديل */}
      {editingMachine && (
        <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '16px', border: '2px solid #ef4444', marginBottom: '30px', boxShadow: '0 10px 25px rgba(239,68,68,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#b91c1c', borderBottom: '1px solid #fee2e2', paddingBottom: '10px', marginBottom: '20px' }}>
            تعديل بيانات: {editingMachine.name}
          </h3>
          
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#334155' }}>اسم الجهاز</label>
                <input className="modern-input" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#334155' }}>العضلة المستهدفة</label>
                <select className="modern-input" value={editForm.target_muscle || 'Chest'} onChange={e => setEditForm({...editForm, target_muscle: e.target.value})}>
                  <option value="Chest">Chest (صدر)</option>
                  <option value="Back">Back (ظهر)</option>
                  <option value="Legs">Legs (أرجل)</option>
                  <option value="Shoulders">Shoulders (أكتاف)</option>
                  <option value="Arms">Arms (أذرع)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#334155' }}>العضلة الأساسية</label>
                <input className="modern-input" value={editForm.primary_muscle || ''} onChange={e => setEditForm({...editForm, primary_muscle: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#334155' }}>العضلة المساعدة</label>
                <input className="modern-input" value={editForm.secondary_muscle || ''} onChange={e => setEditForm({...editForm, secondary_muscle: e.target.value})} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#334155' }}>شرح للتمرين </label>
              <textarea className="modern-input" style={{ minHeight: '100px', resize: 'vertical' }} value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} required />
            </div>
            
            <div style={{ padding: '15px', background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <label style={{ display: 'block', fontWeight: '700', fontSize: '14px', color: '#334155', marginBottom: '5px' }}>تحديث الفيديو (اختياري)</label>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: 0, marginBottom: '10px' }}>اتركه اذا كنت لا تريد تغيير الفيديو .</p>
              <input type="file" accept="video/*" onChange={e => setNewVideoFile(e.target.files[0])} style={{ width: '100%' }} />
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <button type="submit" className="btn-submit" disabled={saving} style={{ flex: 2 }}>
                {saving ? ' جاري الحفظ...' : ' حفظ التعديلات'}
              </button>
              <button type="button" onClick={() => { setEditingMachine(null); setNewVideoFile(null); }} style={{ flex: 1, padding: '16px', borderRadius: '12px', border: 'none', background: '#94a3b8', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: '0.3s' }}>
                 إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* شبكة عرض الأجهزة */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {machines.map((machine) => (
          <div key={machine.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <video src={machine.video_url} controls style={{ width: '100%', height: '180px', objectFit: 'cover', background: '#000' }} />
            
            <div style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '800' }}>{machine.name}</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px' }}>
                <span style={{ background: '#fef2f2', color: '#ef4444', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{machine.target_muscle}</span>
                <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>{machine.primary_muscle}</span>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                <button onClick={() => { setEditingMachine(machine); setEditForm(machine); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #3b82f6', background: '#eff6ff', color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold' }}> تعديل</button>
                <button onClick={() => handleDelete(machine.id, machine.name)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ef4444', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}> حذف</button>
              </div>
            </div>
          </div>
        ))}
        {machines.length === 0 && !loading && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8' }}>لا توجد أجهزة مسجلة حالياً.</p>}
      </div>
    </div>
  );
}