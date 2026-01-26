import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <h1 className={styles.title}>
          오후 3시 30분의 따뜻함으로 공간을 디자인합니다.
        </h1>
      </div>
    </section>
  );
}