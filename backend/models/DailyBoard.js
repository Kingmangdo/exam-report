import { supabase } from './supabase.js';

class DailyBoard {
  static async getByDate(date) {
    const { data, error } = await supabase
      .from('daily_boards')
      .select('*')
      .eq('target_date', date)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
      throw new Error(error.message);
    }

    return data || { target_date: date, global_memo: '', rt_notes: {} };
  }

  static async save(date, data) {
    const { global_memo, rt_notes, last_modified_by } = data;
    
    const { data: result, error } = await supabase
      .from('daily_boards')
      .upsert({
        target_date: date,
        global_memo,
        rt_notes,
        last_modified_by,
        updated_at: new Date().toISOString()
      }, { onConflict: 'target_date' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return result;
  }
}

export default DailyBoard;
