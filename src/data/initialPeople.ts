import { Person } from '../types';

export const INITIAL_PEOPLE: Person[] = [
  {
    id: 'seed-1',
    name: 'Sarang R N',
    age: 25,
    date_of_birth: '2001-01-15',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  },
  {
    id: 'seed-2',
    name: 'Elena Rostova',
    age: 28,
    date_of_birth: '1998-04-22',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString()
  },
  {
    id: 'seed-3',
    name: 'Marcus Chen',
    age: 32,
    date_of_birth: '1994-08-11',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  {
    id: 'seed-4',
    name: 'Amina Diallo',
    age: 24,
    date_of_birth: '2002-11-03',
    photo_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
  },
  {
    id: 'seed-5',
    name: 'Oliver Wright',
    age: 36,
    date_of_birth: '1990-03-19',
    photo_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: 'seed-6',
    name: 'Sophia Patel',
    age: 29,
    date_of_birth: '1997-07-29',
    photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: 'seed-7',
    name: 'Lucas Silva',
    age: 27,
    date_of_birth: '1999-09-14',
    photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  },
  {
    id: 'seed-8',
    name: 'Hana Tanaka',
    age: 22,
    date_of_birth: '2004-05-08',
    photo_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
