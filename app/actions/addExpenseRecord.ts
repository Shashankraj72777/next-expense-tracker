'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export default async function addExpenseRecord(formData: FormData): Promise<{error?:string}> {
  const text=String(formData.get('text')||'').trim().slice(0,180); const amount=Number(formData.get('amount')); const category=String(formData.get('category')||'Other'); const date=String(formData.get('date')||'');
  if(!text || !Number.isFinite(amount) || amount<=0 || !date) return {error:'Enter a description, a valid amount, and a date.'};
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) return {error:'Please sign in first.'};
  const {error}=await supabase.from('expenses').insert({user_id:user.id,text,amount,category,date});
  if(error) return {error: error.message}; revalidatePath('/'); return {};
}
