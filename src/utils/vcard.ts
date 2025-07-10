type VCardOptions = {
  fullName: string;
  phone: string;
  email: string;
  website: string;
  org?: string;
  title?: string;
};

export function generateVCard({
  fullName,
  phone,
  email,
  website,
  org = 'J Merrill One',
  title = 'President & CEO | Founder',
}: VCardOptions): Blob {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${fullName}`,
    `ORG:${org}`,
    `TITLE:${title}`,
    `TEL;TYPE=WORK,VOICE:${phone}`,
    `EMAIL:${email}`,
    `URL:${website}`,
    'END:VCARD',
  ];

  const vcardString = lines.join('\n');
  return new Blob([vcardString], { type: 'text/vcard' });
}