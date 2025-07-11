export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage?: string;
  links: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    [key: string]: string | undefined;
  };
}