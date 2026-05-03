import { supabase } from '../../supabaseClient';

export const transactionService = {
  async addTransaction(transaction) {
    const userId = localStorage.getItem('boreal_user_id') || 'guest';
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        ...transaction,
        user_id: userId
      }])
      .select();
      
    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
    return data[0];
  },

  async getTransactions() {
    const userId = localStorage.getItem('boreal_user_id') || 'guest';
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
    
    // Convert DB snake_case back to camelCase if needed, but the UI expects 'amount', 'date', 'type', 'category' which map directly.
    return data || [];
  },

  async updateTransaction(transaction) {
    const userId = localStorage.getItem('boreal_user_id') || 'guest';
    const { id, user_id, ...updateData } = transaction; // Remove id from payload
    
    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
    return data[0];
  },

  async deleteTransaction(id) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
    return true;
  }
};
