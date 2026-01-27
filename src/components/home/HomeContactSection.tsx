import { Link } from 'react-router-dom';
import { useMemo} from 'react';
import styles from './HomeContactSection.module.css';
import { useHomePage } from '@/pages/Home/HomePageContext';
import { toSafeUrl } from '@/utils/safeUrl';

export default function HomeContactSection() {
  const vm = useHomePage();
  if (!vm) return null;

  const bg = useMemo(() => toSafeUrl(vm.cta.backgroundUrl), [vm.cta.backgroundUrl]);

  return (
    <section
      className={styles.section}
      aria-label="프로젝트 문의"
      style={bg ? ({ ['--contact-bg' as any]: `url(${bg})` } as React.CSSProperties) : undefined}
    >
      <div className={styles.overlay}>
        <div className={styles.content}>
          {/* ✅ 타이틀/설명/버튼을 “그룹”으로 묶음 */}
          <div className={styles.group}>
            <div className={styles.textGroup}>
              <h2 className={styles.title}>PROJECT INQUIRY</h2>
              <p className={styles.desc}>
                프로젝트의 방향과 공간 정보를 공유해 주세요.
                <br />
                330PM은 쓰임과 완성도를 고려해
                <br />
                과하지 않은, 정확한 제안을 드립니다.
              </p>
            </div>

            <Link className={styles.button} to="/inquiry">
              견적 문의하기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
