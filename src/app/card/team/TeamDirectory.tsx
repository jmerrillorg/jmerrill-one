'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getUsersWithPhotos } from '@/utils/graph/getUsersWithPhotos';

interface TeamUser {
  id: string;
  displayName: string;
  jobTitle?: string;
  mail?: string;
  photoUrl?: string;
}

export default function TeamDirectory() {
  const [users, setUsers] = useState<TeamUser[]>([]);

  useEffect(() => {
    async function loadUsers() {
      const data = await getUsersWithPhotos();
      setUsers(data);
    }
    loadUsers();
  }, []);

  return (
    <div className="min-h-screen px-6 py-12 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-center text-primary dark:text-white">
          Meet the Team
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/team/${user.id}`}
              className="block group rounded-2xl overflow-hidden border border-secondary hover:shadow-md transition-all bg-card"
            >
              <div className="flex flex-col items-center p-6 text-center">
                <Image
                  src={user.photoUrl || '/images/logo-circle.png'}
                  alt={user.displayName}
                  width={120}
                  height={120}
                  className="rounded-full object-cover shadow-sm mb-4"
                />
                <h2 className="text-xl font-semibold group-hover:text-primary">
                  {user.displayName}
                </h2>
                <p className="text-sm text-muted-foreground">{user.jobTitle}</p>
                <p className="text-sm text-secondary mt-1">{user.mail}</p>
              </div>
            </Link>
          ))}
        </div>

        {users.length === 0 && (
          <p className="text-center text-muted-foreground mt-10">
            No team members found.
          </p>
        )}
      </div>
    </div>
  );
}