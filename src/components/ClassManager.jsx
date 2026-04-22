import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ClassManager() {
  const [classes, setClasses] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // حالات الإضافة
  const [formData, setFormData] = useState({
    title: '', description: '', class_date: '', class_time: '', max_capacity: 20, coach_id: '', status: 'upcoming'
  });

  // حالات التعديل (Edit State)
  const [editingClass, setEditingClass] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    // 1. جلب المستخدمين الذين رتبتهم "مدرب"
    const { data: coachesData } = await supabase.from('users').select('id, name').eq('role', 'COACH');
    setCoaches(coachesData || []);
    
    // 2. جلب الحصص مع اسم المدرب المرتبط بها
    const { data: classesData } = await supabase.from('fitness_classes').select(`
      *,
      users ( name )
    `).order('class_date', { ascending: true });
    setClasses(classesData || []);
    setLoading(false);
  };

  // ==========================================
  // العمليات البرمجية (Logic)
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('fitness_classes').insert([formData]);
      if (error) throw error;
      alert('تمت جدولة الحصة بنجاح! ');
      setFormData({ title: '', description: '', class_date: '', class_time: '', max_capacity: 20, coach_id: '', status: 'upcoming' });
      fetchInitialData();
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('fitness_classes')
        .update({
          title: editForm.title,
          description: editForm.description,
          class_date: editForm.class_date,
          class_time: editForm.class_time,
          max_capacity: editForm.max_capacity,
          coach_id: editForm.coach_id,
          status: editForm.status
        })
        .eq('id', editingClass.id);

      if (error) throw error;
      alert('تم تحديث بيانات الحصة! ');
      setEditingClass(null);
      fetchInitialData();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const deleteClass = async (id, title) => {
    if (!window.confirm(`هل أنت متأكد من إلغاء حصة "${title}"؟`)) return;
    const { error } = await supabase.from('fitness_classes').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchInitialData();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      {/* 1. نموذج إضافة حصة جديدة */}
      <div style={{ background: '#fff', padding: '35px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '12px', color: '#ef4444' }}></div>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>جدولة حصة تدريبية</h3>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px' }}>اسم الحصة</label>
            <input className="modern-input" placeholder="مثال: تحدي الكارديو الشامل" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px' }}>التاريخ</label>
            <input type="date" className="modern-input" value={formData.class_date} onChange={e => setFormData({...formData, class_date: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px' }}>الوقت</label>
            <input type="time" className="modern-input" value={formData.class_time} onChange={e => setFormData({...formData, class_time: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px' }}>المدرب </label>
            <select className="modern-input" value={formData.coach_id} onChange={e => setFormData({...formData, coach_id: e.target.value})} required>
              <option value="">اختر مدرباً من القائمة</option>
              {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px' }}>السعة الاستيعابية</label>
            <input type="number" className="modern-input" value={formData.max_capacity} onChange={e => setFormData({...formData, max_capacity: e.target.value})} />
          </div>
          <button type="submit" className="btn-submit" style={{ gridColumn: '1 / -1' }} disabled={loading}>
            {loading ? ' جاري الجدولة...' : 'تثبيت الحصة في الجدول'}
          </button>
        </form>
      </div>

      {/* 2. نافذة التعديل (تظهر عند الضغط على تعديل) */}
      {editingClass && (
        <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '20px', border: '2px solid #ef4444', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#b91c1c' }}> تعديل بيانات الحصة</h3>
          <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <input className="modern-input" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
            </div>
            <input type="date" className="modern-input" value={editForm.class_date} onChange={e => setEditForm({...editForm, class_date: e.target.value})} />
            <input type="time" className="modern-input" value={editForm.class_time} onChange={e => setEditForm({...editForm, class_time: e.target.value})} />
            <select className="modern-input" value={editForm.coach_id} onChange={e => setEditForm({...editForm, coach_id: e.target.value})}>
              {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="modern-input" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
              <option value="upcoming">قادمة (Upcoming)</option>
              <option value="ongoing">مباشرة الآن (Ongoing)</option>
              <option value="ended">منتهية (Ended)</option>
            </select>
            <div style={{ display: 'flex', gap: '10px', gridColumn: '1 / -1' }}>
              <button type="submit" className="btn-submit" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</button>
              <button type="button" onClick={() => setEditingClass(null)} style={{ flex: 1, background: '#94a3b8', color: 'white', borderRadius: '12px', border: 'none', cursor: 'pointer' }}>إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {/* 3. قائمة عرض وإدارة الحصص */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
        {classes.map(item => (
          <div key={item.id} style={{ background: '#fff', borderRadius: '20px', padding: '25px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', position: 'relative', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* مؤشر الحالة */}
            <div style={{ alignSelf: 'flex-start', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', 
              background: item.status === 'upcoming' ? '#eff6ff' : item.status === 'ongoing' ? '#f0fdf4' : '#f1f5f9',
              color: item.status === 'upcoming' ? '#3b82f6' : item.status === 'ongoing' ? '#22c55e' : '#64748b' }}>
              {item.status === 'upcoming' ? '• قادمة' : item.status === 'ongoing' ? '• مباشرة الآن' : '• منتهية'}
            </div>

            <div>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '800' }}>{item.title}</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}> المدرب: <span style={{ color: '#0f172a', fontWeight: '700' }}>{item.users?.name || 'غير محدد'}</span></p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', padding: '15px', borderRadius: '15px', fontSize: '14px' }}>
              <div>📅 {item.class_date}</div>
              <div>⏰ {item.class_time}</div>
              <div style={{ gridColumn: '1 / -1', marginTop: '5px', color: '#ef4444', fontWeight: '700' }}>👥 {item.current_enrolled} / {item.max_capacity} مشترك</div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #f1f5f9' }}>
              <button onClick={() => { setEditingClass(item); setEditForm(item); }} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #3b82f6', background: 'none', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer' }}> تعديل</button>
              <button onClick={() => deleteClass(item.id, item.title)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #ef4444', background: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}> حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
