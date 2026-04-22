import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function BannerManager() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // حالات الإضافة
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // حالات التعديل
  const [editingBanner, setEditingBanner] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [newImageFile, setNewImageFile] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    const { data, error } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
    if (!error) setBanners(data || []);
  };

  // ==========================================
  // 1. الإضافة والحذف
  // ==========================================
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert('الرجاء اختيار صورة العرض');
    setLoading(true);
    try {
      const fileName = `${Date.now()}_${imageFile.name}`;
      const { error: uploadError } = await supabase.storage.from('banners').upload(fileName, imageFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('banners').getPublicUrl(fileName);
      
      const { error: insertError } = await supabase.from('banners').insert([
        { title, image_url: urlData.publicUrl, is_active: false } // ينزل كـ "غير نشط" بالبداية
      ]);
      if (insertError) throw insertError;

      alert('تمت الإضافة بنجاح! تجده في قسم الأرشيف لرفعه للتطبيق.');
      setTitle(''); setImageFile(null); fetchBanners();
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  const deleteBanner = async (id, imageUrl) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العرض نهائياً؟')) return;
    try {
      const fileName = imageUrl.split('/banners/')[1];
      if (fileName) await supabase.storage.from('banners').remove([fileName]);
      await supabase.from('banners').delete().eq('id', id);
      fetchBanners();
    } catch (err) { alert('خطأ في الحذف'); }
  };

  // ==========================================
  // 2. التعديل (Edit)
  // ==========================================
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      let finalImageUrl = editingBanner.image_url;

      if (newImageFile) {
        const oldFileName = editingBanner.image_url.split('/banners/')[1];
        if (oldFileName) await supabase.storage.from('banners').remove([oldFileName]);

        const newFileName = `${Date.now()}_${newImageFile.name}`;
        await supabase.storage.from('banners').upload(newFileName, newImageFile);
        const { data } = supabase.storage.from('banners').getPublicUrl(newFileName);
        finalImageUrl = data.publicUrl;
      }

      await supabase.from('banners').update({ title: editTitle, image_url: finalImageUrl }).eq('id', editingBanner.id);
      alert('تم تحديث العرض بنجاح! ✨');
      setEditingBanner(null); setNewImageFile(null); fetchBanners();
    } catch (err) { alert(err.message); }
    finally { setSavingEdit(false); }
  };

  // ==========================================
  // 3. السحب والإفلات (Drag & Drop)
  // ==========================================
  const handleDragStart = (e, bannerId) => { e.dataTransfer.setData('bannerId', bannerId); };
  const handleDragOver = (e) => { e.preventDefault(); }; // للسماح بالإفلات

  const handleDropToActive = async (e) => {
    e.preventDefault();
    const bannerId = e.dataTransfer.getData('bannerId');
    const activeCount = banners.filter(b => b.is_active).length;
    
    // منع إضافة أكثر من 3
    if (activeCount >= 3 && !banners.find(b => b.id == bannerId).is_active) {
      return alert('لا يمكنك تفعيل أكثر من 3 عروض في التطبيق. اسحب عرضاً للأرشيف أولاً.');
    }
    await supabase.from('banners').update({ is_active: true }).eq('id', bannerId);
    fetchBanners();
  };

  const handleDropToArchive = async (e) => {
    e.preventDefault();
    const bannerId = e.dataTransfer.getData('bannerId');
    await supabase.from('banners').update({ is_active: false }).eq('id', bannerId);
    fetchBanners();
  };

  // تقسيم العروض
  const activeBanners = banners.filter(b => b.is_active);
  const archivedBanners = banners.filter(b => !b.is_active);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      {/* 1. فورم إضافة عرض جديد */}
      <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ fontSize: '24px' }}></span> إنشاء عرض ترويجي جديد</h3>
        <form onSubmit={handleUpload} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>عنوان العرض </label>
            <input className="modern-input" placeholder="مثال: خصم 50% بمناسبة الافتتاح" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>صورة العرض الترويجي</label>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="modern-input" required style={{ padding: '11px' }} />
          </div>
          <button type="submit" className="btn-submit" disabled={loading} style={{ gridColumn: '1 / -1' }}>{loading ? ' جاري الرفع...' : 'رفع العرض للنظام'}</button>
        </form>
      </div>

      {/* نافذة التعديل (تظهر عند الضغط على زر تعديل) */}
      {editingBanner && (
        <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '16px', border: '2px solid #3b82f6', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.15)' }}>
          <h3 style={{ marginTop: 0, color: '#1d4ed8' }}> تعديل العرض: {editingBanner.title}</h3>
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input className="modern-input" value={editTitle} onChange={e => setEditTitle(e.target.value)} required />
            <div style={{ padding: '10px', background: '#fff', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
              <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '5px' }}>تغيير الصورة (اختيارية)</label>
              <input type="file" accept="image/*" onChange={e => setNewImageFile(e.target.files[0])} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn-submit" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }} disabled={savingEdit}>{savingEdit ? 'جاري الحفظ...' : 'حفظ التعديلات'}</button>
              <button type="button" onClick={() => { setEditingBanner(null); setNewImageFile(null); }} style={{ padding: '16px', borderRadius: '12px', border: 'none', background: '#94a3b8', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {/* 2. منطقة السحب والإفلات */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* العروض النشطة (شاشة التطبيق) */}
        <div 
          onDragOver={handleDragOver} 
          onDrop={handleDropToActive}
          style={{ background: '#f0fdf4', padding: '25px', borderRadius: '20px', border: '2px dashed #22c55e', minHeight: '400px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#16a34a' }}> العروض النشطة في التطبيق</h3>
            <span style={{ background: '#22c55e', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>{activeBanners.length} / 3</span>
          </div>
          <p style={{ fontSize: '13px', color: '#15803d', marginTop: 0 }}>اسحب العروض هنا لعرضها للمتدربين (الحد الأقصى 3).</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {activeBanners.map(banner => (
              <BannerCard key={banner.id} banner={banner} onDragStart={handleDragStart} onDelete={deleteBanner} onEdit={() => { setEditingBanner(banner); setEditTitle(banner.title); }} isActive={true} />
            ))}
            {activeBanners.length === 0 && <div style={{ textAlign: 'center', color: '#86efac', padding: '40px 0', fontWeight: 'bold' }}>المنطقة فارغة</div>}
          </div>
        </div>

        {/* العروض المؤرشفة */}
        <div 
          onDragOver={handleDragOver} 
          onDrop={handleDropToArchive}
          style={{ background: '#f8fafc', padding: '25px', borderRadius: '20px', border: '2px dashed #cbd5e1', minHeight: '400px' }}
        >
          <h3 style={{ margin: 0, color: '#475569', marginBottom: '5px' }}> أرشيف العروض</h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: 0, marginBottom: '20px' }}>اسحب العروض هنا لإخفائها من التطبيق.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {archivedBanners.map(banner => (
              <BannerCard key={banner.id} banner={banner} onDragStart={handleDragStart} onDelete={deleteBanner} onEdit={() => { setEditingBanner(banner); setEditTitle(banner.title); }} isActive={false} />
            ))}
            {archivedBanners.length === 0 && <div style={{ textAlign: 'center', color: '#cbd5e1', padding: '40px 0', fontWeight: 'bold' }}>الأرشيف فارغ</div>}
          </div>
        </div>

      </div>
    </div>
  );
}

// مكون صغير (Component) لبطاقة العرض عشان ما يتكرر الكود
function BannerCard({ banner, onDragStart, onDelete, onEdit, isActive }) {
  return (
    <div 
      draggable 
      onDragStart={(e) => onDragStart(e, banner.id)}
      style={{ display: 'flex', gap: '15px', background: '#fff', padding: '12px', borderRadius: '15px', border: `1px solid ${isActive ? '#bbf7d0' : '#e2e8f0'}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)', cursor: 'grab' }}
    >
      <img src={banner.image_url} alt={banner.title} style={{ width: '120px', height: '80px', borderRadius: '10px', objectFit: 'cover' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#0f172a' }}>{banner.title}</h4>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onEdit} style={{ fontSize: '12px', padding: '5px 15px', borderRadius: '6px', border: '1px solid #3b82f6', background: '#eff6ff', color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold' }}>تعديل</button>
          <button onClick={() => onDelete(banner.id, banner.image_url)} style={{ fontSize: '12px', padding: '5px 15px', borderRadius: '6px', border: '1px solid #ef4444', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>حذف</button>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', color: '#cbd5e1', cursor: 'grab', paddingRight: '10px' }}>
        ⠿ {/* أيقونة السحب */}
      </div>
    </div>
  );
}