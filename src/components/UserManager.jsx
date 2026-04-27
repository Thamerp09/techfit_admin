import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function UserManager() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('users')
            .select('id, name, username, email, role')
            .order('id', { ascending: true });

        if (error) {
            alert('خطأ في جلب بيانات المستخدمين: ' + error.message);
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    };

    // دالة لتحديد لون وتمييز كل دور (Role) بشكل احترافي
    const getRoleBadge = (role) => {
        switch (role) {
            case 'ADMIN':
                return <span style={{ background: '#fef2f2', color: '#ef4444', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>مدير النظام</span>;
            case 'COACH':
                return <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>مدرب</span>;
            case 'TRAINEE':
                return <span style={{ background: '#f0fdf4', color: '#22c55e', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>متدرب</span>;
            default:
                return <span style={{ background: '#f1f5f9', color: '#64748b', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>غير محدد</span>;
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontWeight: 'bold' }}>جاري تحميل المستخدمين...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

            {/* إحصائيات سريعة بالأعلى */}
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1, background: '#fff', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: '#f8fafc', color: '#64748b', padding: '15px', borderRadius: '15px', fontSize: '28px' }}></div>
                    <div>
                        <h3 style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>إجمالي المستخدمين</h3>
                        <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>{users.length}</p>
                    </div>
                </div>
                <div style={{ flex: 1, background: '#fff', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: '#eff6ff', color: '#3b82f6', padding: '15px', borderRadius: '15px', fontSize: '28px' }}></div>
                    <div>
                        <h3 style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>المدربين</h3>
                        <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>{users.filter(u => u.role === 'COACH').length}</p>
                    </div>
                </div>
                <div style={{ flex: 1, background: '#fff', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: '#f0fdf4', color: '#22c55e', padding: '15px', borderRadius: '15px', fontSize: '28px' }}></div>
                    <div>
                        <h3 style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>المتدربين</h3>
                        <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>{users.filter(u => u.role === 'TRAINEE').length}</p>
                    </div>
                </div>
            </div>

            {/* جدول المستخدمين */}
            <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '20px', color: '#475569', fontWeight: 'bold', fontSize: '15px' }}>الاسم الكامل</th>
                            <th style={{ padding: '20px', color: '#475569', fontWeight: 'bold', fontSize: '15px' }}>اسم المستخدم</th>
                            <th style={{ padding: '20px', color: '#475569', fontWeight: 'bold', fontSize: '15px' }}>البريد الإلكتروني</th>
                            <th style={{ padding: '20px', color: '#475569', fontWeight: 'bold', fontSize: '15px' }}>نوع الحساب</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user.id} style={{ borderBottom: index === users.length - 1 ? 'none' : '1px solid #e2e8f0', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                                <td style={{ padding: '20px', color: '#0f172a', fontWeight: 'bold', fontSize: '16px' }}>{user.name}</td>
                                <td style={{ padding: '20px', color: '#64748b' }}>{user.username}</td>
                                <td style={{ padding: '20px', color: '#64748b' }}>{user.email}</td>
                                <td style={{ padding: '20px' }}>{getRoleBadge(user.role)}</td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>لا يوجد مستخدمين مسجلين بعد.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}