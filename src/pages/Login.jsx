import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login({ onLoginSuccess }) {
  const [authData, setAuthData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', authData.username)
        .eq('password', authData.password)
        .single();

      if (error || !data) {
        throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
      }

      if (data.role !== 'ADMIN') {
        throw new Error('عذراً، لا تملك صلاحية الدخول. هذه الصفحة للمدراء فقط.');
      }

      // الدخول ناجح
      onLoginSuccess(data.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', direction: 'rtl', fontFamily: 'Tajawal, sans-serif' }}>
      
      {/* ستايل مخصص لصفحة الدخول فقط عشان ما تتداخل مع باقي الصفحات */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        * { box-sizing: border-box; }
        .login-input { 
          width: 100%; 
          padding: 16px; 
          border-radius: 12px; 
          border: 1.5px solid #334155; 
          background: #0f172a; 
          color: white; 
          font-size: 15px; 
          font-family: 'Tajawal', sans-serif;
          transition: all 0.3s ease; 
          margin-top: 8px;
        }
        .login-input:focus { 
          border-color: #ef4444; 
          outline: none; 
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
        }
        .login-btn {
          width: 100%; 
          padding: 16px; 
          border-radius: 12px; 
          border: none; 
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); 
          color: white; 
          font-size: 16px; 
          font-weight: 700; 
          font-family: 'Tajawal', sans-serif;
          cursor: pointer; 
          transition: all 0.3s ease; 
          margin-top: 15px;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
        }
        .login-btn:disabled {
          background: #475569;
          box-shadow: none;
          cursor: not-allowed;
          color: #94a3b8;
        }
      `}</style>
      
      <div style={{ background: '#1e293b', padding: '45px 40px', borderRadius: '24px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid #334155' }}>
        
        {/* الشعار والترحيب */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{ width: '65px', height: '65px', borderRadius: '16px', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '30px', fontWeight: 'bold', margin: '0 auto 15px auto', boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)' }}>
            T
          </div>
          <h2 style={{ color: 'white', margin: 0, fontSize: '24px', fontWeight: '800' }}>TechFit Admin</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>قم بتسجيل الدخول للوصول إلى لوحة التحكم</p>
        </div>

        {/* نموذج تسجيل الدخول */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '700' }}>اسم المستخدم</label>
            <input 
              type="text" 
              className="login-input" 
              placeholder="أدخل اسم المستخدم (admin)" 
              value={authData.username} 
              onChange={e => setAuthData({...authData, username: e.target.value})} 
              required 
            />
          </div>
          
          <div>
            <label style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '700' }}>كلمة المرور</label>
            <input 
              type="password" 
              className="login-input" 
              placeholder="••••••••" 
              value={authData.password} 
              onChange={e => setAuthData({...authData, password: e.target.value})} 
              required 
            />
          </div>

          {/* رسالة الخطأ إن وجدت */}
          {error && (
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#f87171', fontSize: '14px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={isAuthenticating}>
            {isAuthenticating ? ' جاري التحقق من الصلاحيات...' : 'تسجيل الدخول'}
          </button>

        </form>
      </div>
    </div>
  );
}