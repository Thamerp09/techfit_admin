import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { QRCodeCanvas } from 'qrcode.react';

const generateThumbnail = (videoFile) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const video = document.createElement("video");

    video.autoplay = true;
    video.muted = true;
    video.src = URL.createObjectURL(videoFile);

    video.onloadeddata = () => { video.currentTime = 1; };

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

export default function MachineList() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState(null);

  const [editingMachine, setEditingMachine] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newVideoFile, setNewVideoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMachines();
  }, []);

  // 🚀 هذه الدالة هي الحل السحري للصعود لأعلى الصفحة بشكل مضمون
  useEffect(() => {
    if (editingMachine) {
      const editSection = document.getElementById('edit-form-section');
      if (editSection) {
        editSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [editingMachine]);

  const fetchMachines = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('machines').select('*').order('id', { ascending: false });
    if (error) alert('خطأ في جلب البيانات: ' + error.message);
    else setMachines(data || []);
    setLoading(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من حذف جهاز "${name}" نهائياً؟`)) return;

    const { error } = await supabase.from('machines').delete().eq('id', id);
    if (error) alert('حدث خطأ أثناء الحذف: ' + error.message);
    else {
      alert('تم الحذف بنجاح ');
      fetchMachines();
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      let video_url = editingMachine.video_url;
      let thumbnail_url = editingMachine.thumbnail_url;

      if (newVideoFile) {
        const thumbFile = await generateThumbnail(newVideoFile);

        if (editingMachine.video_url) {
          const oldPath = editingMachine.video_url.split('/videos/')[1];
          if (oldPath) await supabase.storage.from('videos').remove([oldPath]);
        }

        const fileName = `${Date.now()}_${newVideoFile.name}`;
        const thumbName = `${Date.now()}_thumb.jpg`;

        const [videoUploadRes, thumbUploadRes] = await Promise.all([
          supabase.storage.from('videos').upload(`machine-videos/${fileName}`, newVideoFile),
          supabase.storage.from('thumbnails').upload(thumbName, thumbFile)
        ]);

        if (videoUploadRes.error) throw videoUploadRes.error;
        if (thumbUploadRes.error) throw thumbUploadRes.error;

        video_url = supabase.storage.from('videos').getPublicUrl(`machine-videos/${fileName}`).data.publicUrl;
        thumbnail_url = supabase.storage.from('thumbnails').getPublicUrl(thumbName).data.publicUrl;
      }

      const { error: updateError } = await supabase.from('machines').update({
        name: editForm.name,
        description: editForm.description,
        target_muscle: editForm.target_muscle,
        primary_muscle: editForm.primary_muscle,
        secondary_muscle: editForm.secondary_muscle || null,
        video_url: video_url,
        thumbnail_url: thumbnail_url
      }).eq('id', editingMachine.id);

      if (updateError) throw updateError;

      alert('تم تحديث بيانات الجهاز بنجاح! 🚀');
      setEditingMachine(null);
      setNewVideoFile(null);
      fetchMachines();

    } catch (err) {
      alert('خطأ في التحديث: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontWeight: 'bold' }}> جاري تحميل الأجهزة...</div>;

  return (
    <div>
      <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '15px', borderRadius: '12px', fontSize: '24px' }}></div>
        <div>
          <h3 style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>إجمالي الأجهزة في النظام</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{machines.length} جهاز</p>
        </div>
      </div>

      {editingMachine && (
        <div id="edit-form-section" style={{ background: '#f8fafc', padding: '30px', borderRadius: '16px', border: '2px solid #ef4444', marginBottom: '30px', boxShadow: '0 10px 25px rgba(239,68,68,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#b91c1c', borderBottom: '1px solid #fee2e2', paddingBottom: '10px', marginBottom: '20px' }}>
            تعديل بيانات: {editingMachine.name}
          </h3>

          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#334155' }}>اسم الجهاز</label>
                <input className="modern-input" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#334155' }}>العضلة المستهدفة</label>
                <select className="modern-input" value={editForm.target_muscle || 'Chest'} onChange={e => setEditForm({ ...editForm, target_muscle: e.target.value })}>
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
                <input className="modern-input" value={editForm.primary_muscle || ''} onChange={e => setEditForm({ ...editForm, primary_muscle: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#334155' }}>العضلة المساعدة</label>
                <input className="modern-input" value={editForm.secondary_muscle || ''} onChange={e => setEditForm({ ...editForm, secondary_muscle: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#334155' }}>شرح للتمرين </label>
              <textarea className="modern-input" style={{ minHeight: '100px', resize: 'vertical' }} value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} required />
            </div>

            <div style={{ padding: '15px', background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <label style={{ display: 'block', fontWeight: '700', fontSize: '14px', color: '#334155', marginBottom: '5px' }}>تحديث الفيديو (اختياري)</label>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: 0, marginBottom: '10px' }}>اتركه اذا كنت لا تريد تغيير الفيديو .</p>
              <input type="file" accept="video/*" onChange={e => setNewVideoFile(e.target.files[0])} style={{ width: '100%' }} />
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <button type="submit" className="action-btn btn-submit" disabled={saving} style={{ opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer', flex: 2 }}>
                {saving ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white">
                      <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25" />
                      <path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z">
                        <animateTransform attributeName="transform" type="rotate" dur="0.75s" values="0 12 12;360 12 12" repeatCount="indefinite" />
                      </path>
                    </svg>
                    جاري المعالجة والرفع...
                  </span>
                ) : (
                  'حفظ التعديلات'
                )}
              </button>
              <button type="button" onClick={() => { setEditingMachine(null); setNewVideoFile(null); }} className="action-btn" style={{ flex: 1, padding: '16px', borderRadius: '12px', border: 'none', background: '#94a3b8', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: 'all 0.2s ease' }}>
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

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
                <button className="action-btn" onClick={() => setSelectedMachine(machine)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #10b981', background: '#ecfdf5', color: '#10b981', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s ease' }}> QR </button>

                <button
                  className="action-btn"
                  onClick={() => {
                    setEditingMachine(machine);
                    setEditForm(machine);
                  }}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #3b82f6', background: '#eff6ff', color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s ease' }}
                >
                  تعديل
                </button>

                <button className="action-btn" onClick={() => handleDelete(machine.id, machine.name)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ef4444', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s ease' }}> حذف</button>
              </div>
            </div>
          </div>
        ))}
        {machines.length === 0 && !loading && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8' }}>لا توجد أجهزة مسجلة حالياً.</p>}
      </div>

      {selectedMachine && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div id="printable-qr" style={{ background: '#fff', padding: '40px', borderRadius: '24px', textAlign: 'center', maxWidth: '400px', width: '90%', position: 'relative' }}>
            <button
              onClick={() => setSelectedMachine(null)}
              style={{ position: 'absolute', top: '20px', left: '20px', border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}
            >
              ✕
            </button>

            <h2 style={{ marginBottom: '10px' }}>{selectedMachine.name}</h2>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>امسح الكود لعرض تفاصيل الجهاز</p>

            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', display: 'inline-block', border: '1px solid #e2e8f0' }}>
              <QRCodeCanvas
                value={`techfit://machine/${selectedMachine.id}`}
                size={200}
                level={"H"}
                includeMargin={true}
              />
            </div>

            <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
              <button
                className="action-btn"
                onClick={handlePrint}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: 'white', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                طباعة الكود
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .action-btn:hover {
          filter: brightness(0.92);
          transform: translateY(-2px);
        }
        .action-btn:active {
          transform: scale(0.95) translateY(0);
        }

        @media print {
          body * { visibility: hidden; }
          #printable-qr, #printable-qr * { visibility: visible; }
          #printable-qr { position: absolute; left: 50%; top: 40%; transform: translate(-50%, -50%); border: none; box-shadow: none; }
          #printable-qr button { display: none; }
        }
      `}</style>
    </div>
  );
}