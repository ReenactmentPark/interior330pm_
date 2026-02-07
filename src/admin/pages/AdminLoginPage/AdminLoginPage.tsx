import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminLoginPage.module.css';
import { useAdminAuth } from '@/admin/context/AdminAuthContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();

  const [admin, setAdmin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const result = await login(admin, password);

      if (!result.ok) {
        setError(result.message || '아이디 또는 비밀번호가 올바르지 않습니다.');
        return;
      }

      navigate('/admin/home', { replace: true });
    } catch (err) {
      console.error(err);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.page} aria-label="관리자 로그인">
      <section className={styles.box} aria-label="로그인 박스">
        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.row}>
            <label className={styles.label} htmlFor="admin-id">
              admin
            </label>
            <input
              id="admin-id"
              name="admin"
              className={styles.input}
              autoComplete="username"
              spellCheck={false}
              value={admin}
              onChange={(e) => setAdmin(e.target.value)}
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label} htmlFor="admin-pw">
              password
            </label>
            <input
              id="admin-pw"
              name="password"
              type="password"
              className={styles.input}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ marginTop: 6, fontSize: 12, color: 'rgba(180,0,0,0.85)' }} role="alert">
              {error}
            </div>
          )}

          <div className={styles.actions}>
            <button type="submit" className={styles.loginBtn} disabled={isLoading}>
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
