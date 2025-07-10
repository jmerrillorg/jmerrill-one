'use client';

import Link from 'next/link';
import Image from 'next/image';

type TeamMember = {
  slug: string;
  name: string;
  title: string;
  imageSrc: string;
};

const team: TeamMember[] = [
  {
    slug: 'jackie',
    name: 'Jackie Smith, Jr.',
    title: 'President & CEO | Founder',
    imageSrc: '/images/team/jackie.jpg',
  },
  {
    slug: 'marla',
    name: 'Marla J. Smith',
    title: 'Vice President | Publishing & Foundation',
    imageSrc: '/images/team/marla.jpg',
  },
  // Add more team members as needed
];

export default function TeamDirectory() {
  return (
    <div className="min-h-screen px-6 py-16 bg-white text-[#111111] dark:bg-[#1a1a1a] dark:text-white">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Meet Our Team</h1>
        <p className="text-lg text-secondary mb-12">
          United by purpose, empowered by excellence.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {team.map((member) => (
            <Link key={member.slug} href={`/card/${member.slug}`} className="group block transition-all duration-200">
              <div className="rounded-2xl overflow-hidden shadow-md border border-secondary hover:shadow-xl bg-white dark:bg-gray-800 transition-all duration-300">
                <Image
                  src={member.imageSrc}
                  alt={member.name}
                  width={500}
                  height={500}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-4 text-center">
                  <h2 className="text-xl font-semibold text-publishing group-hover:text-appointments transition">
                    {member.name}
                  </h2>
                  <p className="text-sm text-secondary mt-1">{member.title}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}