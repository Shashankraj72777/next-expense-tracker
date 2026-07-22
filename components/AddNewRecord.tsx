'use client';

import { useRef, useState } from 'react';
import addExpenseRecord from '@/app/actions/addExpenseRecord';
import { suggestCategory } from '@/app/actions/suggestCategory';

const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Travel', 'Education', 'Other'];
const today = new Date().toISOString().slice(0, 10);

export default function AddNewRecord() {
  const formRef = useRef<HTMLFormElement>(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today);
  const [state, setState] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);
  const [thinking, setThinking] = useState(false);

  async function askPennywise() {
    if (!description.trim()) return setState({ type: 'error', message: 'Add a description first so Pennywise has something to classify.' });
    setThinking(true);
    setState(null);
    const result = await suggestCategory(description);
    setThinking(false);
    setCategory(result.category);
    setState({ type: result.error ? 'error' : 'success', message: result.error || `Pennywise suggests ${result.category}.` });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setState(null);
    const formData = new FormData(event.currentTarget);
    const result = await addExpenseRecord(formData);
    setSaving(false);
    if (result.error) return setState({ type: 'error', message: result.error });
    setDescription(''); setAmount(''); setCategory('Other'); setDate(today);
    setState({ type: 'success', message: 'Expense saved. Your dashboard is refreshed.' });
  }

  const inputClass = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-indigo-400 dark:focus:bg-slate-900 dark:focus:ring-indigo-500/15';

  return (
    <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6'>
      <div className='flex items-start justify-between gap-4'>
        <div><p className='text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300'>Quick capture</p><h2 className='mt-1 text-xl font-semibold'>Log an expense</h2><p className='mt-1 text-sm text-slate-500'>Pennywise can sort the details for you.</p></div>
        <button type='button' onClick={askPennywise} disabled={thinking || !description.trim()} className='shrink-0 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500/10 dark:text-indigo-200'>
          {thinking ? 'Thinking…' : '✦ Ask Pennywise'}
        </button>
      </div>
      <form ref={formRef} onSubmit={submit} className='mt-6 space-y-4'>
        <div><label htmlFor='text' className='text-sm font-medium'>What was it?</label><input id='text' name='text' value={description} onChange={(event) => setDescription(event.target.value)} className={inputClass} maxLength={180} placeholder='e.g. Lunch with the team' required /></div>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div><label htmlFor='amount' className='text-sm font-medium'>Amount</label><div className='relative'><span className='absolute left-3.5 top-[1.1rem] text-sm text-slate-400'>$</span><input id='amount' name='amount' type='number' min='0.01' step='0.01' value={amount} onChange={(event) => setAmount(event.target.value)} className={`${inputClass} pl-7`} placeholder='0.00' required /></div></div>
          <div><label htmlFor='date' className='text-sm font-medium'>Date</label><input id='date' name='date' type='date' value={date} onChange={(event) => setDate(event.target.value)} className={inputClass} required /></div>
        </div>
        <div><label htmlFor='category' className='text-sm font-medium'>Category</label><select id='category' name='category' value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass}>{categories.map((name) => <option key={name}>{name}</option>)}</select></div>
        <button disabled={saving} className='w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60'>{saving ? 'Saving expense…' : 'Save expense'}</button>
      </form>
      {state && <p className={`mt-4 rounded-xl px-3 py-2.5 text-sm ${state.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'}`}>{state.message}</p>}
    </section>
  );
}
