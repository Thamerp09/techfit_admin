import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

// 👈 دالة استخراج الصورة المصغرة من الفيديو تلقائياً
const generateThumbnail = (videoFile) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const video = document.createElement("video");

    video.autoplay = true;
    video.muted = true;
    video.src = URL.createObjectURL(videoFile);

    video.onloadeddata = () => {
      video.currentTime = 1;
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        const thumbnailFile = new File([blob], "thumbnail.jpg", { type: "image/jpeg" });
        resolve(thumbnailFile);
      }, "image/jpeg", 0.7);
    };
  });
};

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

    // إعطاء المتصفح لحظة لتحديث شكل الزر وبدء الأنيميشن
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // 1. استخراج الصورة المصغرة
      const thumbFile = await generateThumbnail(videoFile);

      const videoName = `${Date.now()}_${videoFile.name}`;
      const thumbName = `${Date.now()}_thumb.jpg`;

      // 🚀 2. الرفع المتوازي (السريع): رفع الفيديو والصورة في نفس اللحظة
      const [videoUploadRes, thumbUploadRes] = await Promise.all([
        supabase.storage.from('videos').upload(`machine-videos/${videoName}`, videoFile),
        supabase.storage.from('thumbnails').upload(thumbName, thumbFile)
      ]);

      if (videoUploadRes.error) throw videoUploadRes.error;
      if (thumbUploadRes.error) throw thumbUploadRes.error;

      // 3. جلب الروابط
      const videoUrl = supabase.storage.from('videos').getPublicUrl(`machine-videos/${videoName}`).data.publicUrl;
      const thumbUrl = supabase.storage.from('thumbnails').getPublicUrl(thumbName).data.publicUrl;

      // 4. حفظ البيانات
      const { error: insertError } = await supabase.from('machines').insert([{
        name: formData.name,
        description: formData.description,
        target_muscle: formData.target_muscle,
        primary_muscle: formData.primary_muscle,
        secondary_muscle: formData.secondary_muscle ? formData.secondary_muscle : null,
        video_url: videoUrl,
        thumbnail_url: thumbUrl
      }]);

      if (insertError) throw insertError;
      alert('تم حفظ الجهاز بنجاح! 🚀');

      // تصفير الحقول
      setFormData({ name: '', description: '', target_muscle: 'Chest', primary_muscle: '', secondary_muscle: '' });
      setVideoFile(null);
      document.getElementById('video-upload-input').value = '';

    } catch (err) {
      alert('تنبيه: حدث خطأ. ' + err.message);
    } finally {
      setLoading(false);
    }
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
            <input className="modern-input" placeholder="مثال: Bench Press" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#334155' }}>العضلة المستهدفة (Target Muscle)</label>
            <select className="modern-input" value={formData.target_muscle} onChange={e => setFormData({ ...formData, target_muscle: e.target.value })}>
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
            <input className="modern-input" placeholder="مثال: Pectoralis Major" value={formData.primary_muscle} onChange={e => setFormData({ ...formData, primary_muscle: e.target.value })} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#334155' }}>العضلة المساعدة (Secondary)</label>
            <input className="modern-input" placeholder="اختياري" value={formData.secondary_muscle} onChange={e => setFormData({ ...formData, secondary_muscle: e.target.value })} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#334155' }}>شرح التمرين</label>
          <textarea className="modern-input" style={{ minHeight: '120px', resize: 'vertical' }} placeholder="اشرح الحركة للمتدرب لتجنب الإصابات..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#334155' }}>فيديو توضيحي (MP4)</label>
          <div className="upload-box">
            <input id="video-upload-input" type="file" accept="video/*" onChange={e => setVideoFile(e.target.files[0])} style={{ width: '100%' }} required />
            <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>سيتم استخراج الصورة المصغرة تلقائياً عند الرفع</p>
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              {/* 👈 أنيميشن التحميل الدائري النظيف (Spinner) */}
              <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white">
                <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25" />
                <path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z">
                  <animateTransform attributeName="transform" type="rotate" dur="0.75s" values="0 12 12;360 12 12" repeatCount="indefinite" />
                </path>
              </svg>
              جاري المعالجة والرفع...
            </span>
          ) : (
            'اعتماد وحفظ الجهاز في النظام'
          )}
        </button>
      </form>
    </div>
  );
}