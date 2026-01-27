///////////////////////////
// Home Page Types ////////
///////////////////////////
export type HomeApiResponse = {
  page: 'home';
  version: number;
  updatedAt: string;
  sections: {
    images: {
      hero: { url: string; alt?: string | null };
      cards: Array<{ url: string; alt?: string | null }>;
    };

    heroText: {
      title: string;
      highlight?: string | null;
      highlightColor?: string | null;
    };

    galleryText: {
      title: string;
      highlight?: string | null;
      highlightColor?: string | null;
      description: string;
    };

    cta: {
      background?: { url?: string | null } | null;
      title: string;
      description: string;
      button: { label: string; to: string };
    };

    footer?: {
      leftLines: string[];
      rightLinks: Array<{ label: string; href: string }>;
      copyright: string;
    } | null;
  };
};

export type HighlightVm = { text: string; color?: string } | null;

export type HomePageViewModel = {
  images: {
    heroUrl: string;
    heroAlt: string;
    cards: Array<{ url: string; alt: string; raised?: boolean }>;
  };

  heroText: {
    title: string;
    highlight: HighlightVm;
  };

  galleryText: {
    title: string;
    highlight: HighlightVm;
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
    rightLinks: Array<{ label: string; href: string }>;
    copyright: string;
  };
};

///////////////////////////
// Interior Page Types ////
///////////////////////////

export type InteriorCategoryKey = 'all' | 'cafe' | 'restaurant' | 'commercial' | 'apartment' | 'etc';

export type InteriorCategory = {
  key: InteriorCategoryKey;
  label: string;
};

export type InteriorProject = {
  id: string;
  category: InteriorCategoryKey;
  title: string;
  period: string;
  thumbnailUrl: string;
  to: string;
};

export type InteriorHeaderText = {
  title: string;
  description: string;
};

export type InteriorApiResponse = {
  page: 'interior';
  version: number;
  updatedAt: string;
  headerText: InteriorHeaderText;
  categories: InteriorCategory[];
  projects: InteriorProject[];
};

export type InteriorPageViewModel = {
  headerText: InteriorHeaderText;
  categories: InteriorCategory[];
  projects: InteriorProject[];
};

///////////////////////////
// Furniture Page Types ////
///////////////////////////

export type FurnitureApiResponse = InteriorApiResponse;
export type FurniturePageViewModel = InteriorPageViewModel;