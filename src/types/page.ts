export type ImageAsset = {
  url: string;
  alt?: string;
};

export type FooterLink = {
  label: string;
  href: string;
};

export type HomeApiResponse = {
  page: 'home';
  version: number;
  updatedAt: string;
  sections: {
    images: {
      hero: ImageAsset;
      cards: ImageAsset[]; // length 4 권장
    };
    cardText: {
      title: string;
      highlight?: string;
      highlightColor?: string;
      description: string; // \n 허용
    };
    cta: {
      background?: ImageAsset;
      title: string;
      description: string; // \n 허용
      button: {
        label: string;
        to: string;
      };
    };
};
  footer?: {
      leftLines: string[];
      rightLinks: FooterLink[];
      copyright: string;
  };
};

/** UI 컴포넌트용 ViewModel */
export type HomePageViewModel = {
  images: {
    heroUrl: string;
    heroAlt: string;
    cards: { url: string; alt: string; raised?: boolean }[];
  };
  cardText: {
    title: string;
    highlight?: { text: string; color?: string };
    description: string;
  };
  cta: {
    backgroundUrl?: string;
    title: string;
    description: string;
    buttonLabel: string;
    buttonTo: string;
  };
  footer?: {
    leftLines: string[];
    rightLinks: FooterLink[];
    copyright: string;
  };
};
