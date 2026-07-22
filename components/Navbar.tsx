'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setEmail(session?.user.email ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signOut() { await createClient().auth.signOut(); window.location.assign('/'); }

  return <nav className='sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85'>
    <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
      <Link href='/' className='flex items-center gap-2 font-semibold tracking-tight'><span className='grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'>P</span><span>Pennywise</span></Link>
      <div className='flex items-center gap-2 text-sm'>
        <Link href='/about' className='hidden rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 sm:block dark:text-slate-300 dark:hover:bg-slate-800'>About</Link>
        <ThemeToggle />
        {email ? <><span className='hidden max-w-40 truncate px-2 text-xs text-slate-500 sm:block'>{email}</span><button onClick={signOut} className='rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-900'>Sign out</button></> : <Link href='/sign-in' className='rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white'>Sign in</Link>}
      </div>
    </div>
  </nav>;
}
