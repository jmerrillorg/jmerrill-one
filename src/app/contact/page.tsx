import { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Us | J Merrill One',
  description: 'Reach out to J Merrill One for publishing, financial services, or nonprofit collaboration.',
  openGraph: {
    title: 'Contact Us | J Merrill One',
    description: 'Let’s connect across publishing, finance, and community impact.',
    url: 'https://jmerrill.one/contact',
    siteName: 'J Merrill One',
    type: 'website',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}