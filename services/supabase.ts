import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Supabase configuration
const getSupabaseUrl = (): string => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url) {
    throw new Error('VITE_SUPABASE_URL is not set in environment variables');
  }
  return url;
};

const getSupabaseAnonKey = (): string => {
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('VITE_SUPABASE_ANON_KEY is not set in environment variables');
  }
  return key;
};

// Initialize Supabase client
let supabase: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabase) {
    try {
      const url = getSupabaseUrl();
      const anonKey = getSupabaseAnonKey();
      supabase = createClient(url, anonKey);
    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
      throw error;
    }
  }
  return supabase;
};

// Database Types
export interface SupabaseUser {
  id: string;
  email: string;
  business_name?: string;
  created_at: string;
}

export interface SupabaseSale {
  id: string;
  user_id: string;
  item_name: string;
  category?: string;
  quantity: number;
  price: number;
  total: number;
  type: 'sale' | 'expense';
  voice_input?: string;
  receipt_data?: any;
  created_at: string;
}

export interface SupabaseReceipt {
  id: string;
  sale_id: string;
  receipt_data: any;
  created_at: string;
}

// Auth Functions
export const signUp = async (email: string, password: string): Promise<{ user: User | null; session: Session | null; error: any }> => {
  const client = getSupabase();
  const { data, error } = await client.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    console.error('Sign up error:', error);
    return { user: null, session: null, error };
  }

  // Create user record in suarakira_users table
  if (data.user) {
    const { error: insertError } = await client
      .from('suarakira_users')
      .insert([
        {
          id: data.user.id,
          email: data.user.email,
          created_at: new Date().toISOString(),
        },
      ]);

    if (insertError) {
      console.error('Error creating user record:', insertError);
    }
  }

  return { user: data.user, session: data.session, error: null };
};

export const signIn = async (email: string, password: string): Promise<{ user: User | null; session: Session | null; error: any }> => {
  const client = getSupabase();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Sign in error:', error);
    return { user: null, session: null, error };
  }

  return { user: data.user, session: data.session, error: null };
};

export const signOut = async (): Promise<{ error: any }> => {
  const client = getSupabase();
  const { error } = await client.auth.signOut();
  
  if (error) {
    console.error('Sign out error:', error);
  }
  
  return { error };
};

export const getCurrentUser = async (): Promise<User | null> => {
  const client = getSupabase();
  const { data: { user } } = await client.auth.getUser();
  return user;
};

export const getCurrentSession = async (): Promise<Session | null> => {
  const client = getSupabase();
  const { data: { session } } = await client.auth.getSession();
  return session;
};

// Transaction/Sales Functions
export const saveSaleToSupabase = async (sale: {
  item_name: string;
  category?: string;
  quantity: number;
  price: number;
  total: number;
  type: 'sale' | 'expense';
  voice_input?: string;
  receipt_data?: any;
}): Promise<{ data: SupabaseSale | null; error: any }> => {
  const client = getSupabase();
  const user = await getCurrentUser();
  
  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const { data, error } = await client
    .from('suarakira_sales')
    .insert([
      {
        user_id: user.id,
        item_name: sale.item_name,
        category: sale.category,
        quantity: sale.quantity,
        price: sale.price,
        total: sale.total,
        type: sale.type,
        voice_input: sale.voice_input,
        receipt_data: sale.receipt_data,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error saving sale:', error);
  }

  return { data, error };
};

export const getSalesFromSupabase = async (): Promise<{ data: SupabaseSale[] | null; error: any }> => {
  const client = getSupabase();
  const user = await getCurrentUser();
  
  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const { data, error } = await client
    .from('suarakira_sales')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sales:', error);
  }

  return { data, error };
};

export const deleteSaleFromSupabase = async (saleId: string): Promise<{ error: any }> => {
  const client = getSupabase();
  const { error } = await client
    .from('suarakira_sales')
    .delete()
    .eq('id', saleId);

  if (error) {
    console.error('Error deleting sale:', error);
  }

  return { error };
};

// Receipt Functions
export const saveReceiptToSupabase = async (saleId: string, receiptData: any): Promise<{ data: SupabaseReceipt | null; error: any }> => {
  const client = getSupabase();
  
  const { data, error } = await client
    .from('suarakira_receipts')
    .insert([
      {
        sale_id: saleId,
        receipt_data: receiptData,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error saving receipt:', error);
  }

  return { data, error };
};
