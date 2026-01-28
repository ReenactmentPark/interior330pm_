import HomeHeaderSection from '@/components/home/HomeHeaderSection/HomeHeaderSection';
import HomeGallerySection from '@/components/home/HomeGallerySection/HomeGallerySection';
import HomeContactSection from '@/components/home/HomeContactSection/HomeContactSection';

export default function HomeMainSection() {
  return (
    <section aria-label="홈 메인">
      <HomeHeaderSection />
      <HomeGallerySection />
      <HomeContactSection />
    </section>
  );
}
