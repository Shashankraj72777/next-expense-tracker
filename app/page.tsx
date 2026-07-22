import AddNewRecord from '@/components/AddNewRecord';
import AIInsights from '@/components/AIInsights';
import Guest from '@/components/Guest';
import RecordHistory from '@/components/RecordHistory';
import { getDashboardData } from '@/app/actions/getDashboardData';
import { createClient } from '@/lib/supabase/server';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <Guest />;
  const data = await getDashboardData();
  const change = data && data.previousMonthTotal > 0 ? ((data.monthTotal - data.previousMonthTotal) / data.previousMonthTotal) * 100 : null;
  const firstName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'there';

  return (
    <main className='min-h-screen bg-[#f7f8fc] text-slate-900 dark:bg-[#0b1020] dark:text-slate-100'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12'>
        <section className='relative overflow-hidden rounded-[2rem] bg-[#111b38] px-6 py-8 text-white shadow-2xl shadow-indigo-950/20 sm:px-10 sm:py-10'>
          <div className='absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl' />
          <div className='absolute bottom-0 left-1/3 h-36 w-96 rounded-full bg-cyan-400/10 blur-3xl' />
          <div className='relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between'>
            <div>
              <div className='mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100'>
                <span className='h-1.5 w-1.5 rounded-full bg-cyan-300' /> YOUR MONEY, IN FOCUS
              </div>
              <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl'>Good to see you, {firstName}.</h1>
              <p className='mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base'>A calm, clear view of where your money is going — with Pennywise ready to spot the next smart move.</p>
            </div>
            <div className='rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-sm'>
              <p className='text-xs font-medium uppercase tracking-wider text-slate-300'>This month</p>
              <p className='mt-1 text-3xl font-semibold'>{currency.format(data?.monthTotal || 0)}</p>
              <p className={`mt-1 text-xs ${change !== null && change > 0 ? 'text-amber-200' : 'text-emerald-200'}`}>{change === null ? 'Start adding expenses to see your trend' : `${Math.abs(change).toFixed(0)}% ${change > 0 ? 'more' : 'less'} than last month`}</p>
            </div>
          </div>
        </section>

        <section className='mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4'>
          {[
            ['Transactions', String(data?.transactionCount || 0), 'logged this month'],
            ['Top category', data?.topCategory?.name || '—', data?.topCategory ? currency.format(data.topCategory.amount) : 'No data yet'],
            ['Largest expense', currency.format(data?.largestExpense || 0), 'this month'],
            ['Latest activity', data?.recentRecords[0] ? new Date(data.recentRecords[0].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—', data?.recentRecords[0]?.text || 'No expenses yet'],
          ].map(([label, value, caption]) => (
            <div key={label} className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5'>
              <p className='text-xs font-medium text-slate-500'>{label}</p>
              <p className='mt-2 truncate text-xl font-semibold tracking-tight'>{value}</p>
              <p className='mt-1 truncate text-xs text-slate-500'>{caption}</p>
            </div>
          ))}
        </section>

        <section className='mt-6'><AddNewRecord /></section>
        <section className='mt-6'><AIInsights /></section>
        <section className='mt-6'><RecordHistory /></section>
      </div>
    </main>
  );
}
