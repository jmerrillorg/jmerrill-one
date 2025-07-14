// src/utils/graph/getUsersWithPhotos.ts

export async function getUsersWithPhotos(): Promise<{
  id: string;
  displayName: string;
  jobTitle?: string;
  mail?: string;
  photoUrl?: string;
}[]> {
  // Mock data for now; replace with actual Graph API call
  return [
    {
      id: '1',
      displayName: 'John Doe',
      jobTitle: 'Developer',
      mail: 'john@example.com',
      photoUrl: '/images/logo-circle.png',
    },
  ];
}