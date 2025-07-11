'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function JoinPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bookTitle: '',
    genre: '',
    timezone: '',
    initialStatus: '',
    estimatedPubDate: '',
    message: '',
    manuscriptFile: null as File | null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: files && files.length > 0 ? files[0] : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'bookTitle',
      'genre',
      'timezone',
      'initialStatus',
      'estimatedPubDate',
    ];

    const missing = requiredFields.find((key) => !formData[key as keyof typeof formData]);
    if (missing) {
      alert(`Please complete the ${missing}.`);
      setLoading(false);
      return;
    }

    if (!formData.manuscriptFile) {
      alert('Please upload your manuscript file.');
      setLoading(false);
      return;
    }

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) payload.append(key, value as Blob | string);
    });

    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        body: payload,
      });

      if (res.ok) router.push('/success');
      else throw new Error();
    } catch {
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-primary">Join the J Merrill Publishing Family</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
        <Field label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
        <Field label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
        <Field label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
        <Field label="Book Title" name="bookTitle" value={formData.bookTitle} onChange={handleChange} />
        <Field label="Genre / Book Category" name="genre" value={formData.genre} onChange={handleChange} />
        <Field label="Your Timezone" name="timezone" value={formData.timezone} onChange={handleChange} />
        <Field label="Where are you in the publishing process?" name="initialStatus" value={formData.initialStatus} onChange={handleChange} />
        <Field label="Estimated Publishing Date" name="estimatedPubDate" type="date" value={formData.estimatedPubDate} onChange={handleChange} />
        
        <div>
          <Label htmlFor="message">Message (Optional)</Label>
          <Textarea
            name="message"
            placeholder="Anything else you'd like us to know?"
            value={formData.message}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="manuscriptFile">Upload Manuscript</Label>
          <Input
            type="file"
            name="manuscriptFile"
            accept=".doc,.docx,.pdf"
            onChange={handleChange}
            required
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </div>
  );
}

// 🔁 Reusable Input Field
function Field({
  label,
  name,
  type = 'text',
  value,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<any>) => void;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input name={name} type={type} value={value} onChange={onChange} required />
    </div>
  );
}