'use server';
import { revalidatePath } from 'next/cache'; import { createClient } from '@/lib/supabase/server';
export default async function deleteRecord(id:string):Promise<{message?:string;error?:string}>{const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return {error:'Please sign in first.'};const {error}=await supabase.from('expenses').delete().eq('id',id).eq('user_id',user.id);if(error)return {error:error.message};revalidatePath('/');return {message:'Expense deleted'};}
