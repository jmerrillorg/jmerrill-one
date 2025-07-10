import QRCode from 'qrcode';

export async function generateQRCode(url: string): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 256,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    return qrDataUrl;
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return '';
  }
}