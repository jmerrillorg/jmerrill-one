export type VCardOptions = {
  fullName: string;
  phone: string; // Direct line (call/text)
  additionalPhones?: string[]; // Office or other lines
  email: string;
  website: string;
  org?: string;
  title?: string;
};

export function generateVCard({
  fullName,
  phone,
  additionalPhones = [],
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
    `TEL;TYPE=CELL,VOICE:${phone}`, // Direct line (call/text)
    ...additionalPhones.map(
      (p) => `TEL;TYPE=WORK,VOICE:${p}` // Office line(s)
    ),
    `EMAIL:${email}`,
    `URL:${website}`,
    'END:VCARD',
  ];

  const vcardString = lines.join('\n');
  return new Blob([vcardString], { type: 'text/vcard' });
}