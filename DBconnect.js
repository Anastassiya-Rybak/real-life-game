let db;
let currDate = null;

const initSupabase = () => {
  if (db) return db;

  db = supabase.createClient(
      'https://atvxapbmefhnmihiuqor.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0dnhhcGJtZWZobm1paGl1cW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2MzAwMDgsImV4cCI6MjA1MjIwNjAwOH0.KhVML4xVgV3EiAQFcLoaOa-4ti4HA4LjCSrIDdqtp10'
  )
}

const constsTypes = {
    weight_goal: "num_value"
}

const getConstValue = async (constName) => {
    let valueType = constsTypes[constName];

    let data = await db.from('constants').select(valueType).eq('const_name', constName).single();

    return data.data;
}

function getTodayDate() {
  let today = new Date();
  
  const localDate = today.getFullYear() + '-' +
                  String(today.getMonth() + 1).padStart(2, '0') + '-' +
                  String(today.getDate()).padStart(2, '0');
  return localDate;
}

function formatDateLocal(isoDate) {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
}

function ruDateToISO(dateStr) {
  if (!dateStr) return null;

  const [day, month, year] = dateStr.split('.');

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
// {
//   budgetLimit: number,
//   todayCashFlow: number,
//   weightGoal: number | null,
//   daily: {
//     total: number,
//     done: number,
//     donePoints: number
//   },
//   financeGoal: {
//     goalSum: number,
//     goalSave: number
//   } | null,
//   currentWeight: number | null
// }

async function getMainPageData() {
  let today = getTodayDate();
  
  /* =========================
     1. BUDGET LIMIT
  ========================= */
  const { data: budgetRows, error: budgetError } = await db
    .from('buget-limit')
    .select('sum')
    .lte('date_start', today)
    .gte('date_end', today)
    .limit(1);

  if (budgetError) throw budgetError;

  const budgetLimit = budgetRows?.[0]?.sum ?? 0;

  /* =========================
     2. CASH FLOW (today, без plan_id)
  ========================= */
  const { data: cashFlowRows, error: cashFlowError } = await db
    .from('cash-flow')
    .select('flow_sum, flow_type')
    .eq('flow_date', today)
    .is('plan_id', null); // ⬅️ ВАЖНО

  if (cashFlowError) throw cashFlowError;

  const todayCashFlow = (cashFlowRows ?? []).reduce((acc, row) => {
    const value =
      row.flow_type === 2
        ? -Math.abs(row.flow_sum)
        : row.flow_sum;
    return acc + value;
  }, 0);

  /* =========================
     3. CONSTANTS (weight goal)
  ========================= */
  const { data: weightConstRows, error: constError } = await db
    .from('constants')
    .select('num_value, text_value')
    .eq('const_name', 'weight_goal')
    .limit(1);

  if (constError) throw constError;

  const weightGoal  = weightConstRows?.[0]?.num_value ?? 0;
  const weightStart = +weightConstRows?.[0]?.text_value ?? 0;
  /* =========================
     4. DAILY TASKS
  ========================= */
  const { data: dailyRows, error: dailyError } = await db
    .from('daily')
    .select('done, act_point')
    .eq('daily_date', today);

  if (dailyError) throw dailyError;  
  
  const totalDaily = dailyRows?.length ?? 0;

  const doneDaily = (dailyRows ?? []).filter(row => row.done == true);
  const doneCount = doneDaily.length;

  console.log(doneDaily);
  
  const donePoints = doneDaily.reduce(
    (sum, row) => sum + (row.act_point ?? 0),
    0
  );

  /* =========================
     5. FINANCES GOAL
  ========================= */
  const { data: financeGoalRows, error: financeGoalError } = await db
    .from('finances-goal')
    .select('goal_sum, goal_save')
    .eq('active', true)
    .limit(1);

  if (financeGoalError) throw financeGoalError;

  const financeGoal = financeGoalRows?.[0]
    ? {
        goalSum: financeGoalRows[0].goal_sum,
        goalSave: financeGoalRows[0].goal_save
      }
    : null;

  /* =========================
     6. WEIGHT CONTROL (latest)
  ========================= */
  const { data: weightRows, error: weightError } = await db
    .from('weight-control')
    .select('value')
    .order('weighing-date', { ascending: false })
    .limit(1);

  if (weightError) throw weightError;

  const currentWeight = weightRows?.[0]?.value ?? weightStart;
  
  /* =========================
     RESULT
  ========================= */

  today = formatDateLocal(today);

  return {
    budgetLimit,
    todayCashFlow,
    weightGoal,
    weightStart,
    daily: {
      total: totalDaily,
      done: doneCount,
      donePoints
    },
    financeGoal,
    currentWeight,
    today
  };
}

const addDailyTask = async(taskData) => {
  console.log("Данные добавляемые в дату");
  console.log(taskData);
  
  const { error: errorDaily } = await db
    .from('daily')
    .insert([{
      daily_date: taskData.date,      // YYYY-MM-DD
      act_id: taskData.name,          // связь через name
      act_point: Number(taskData.point) || 0
    }]);

  if (errorDaily) throw errorDaily;
}

const saveTask = async (taskData) => {  
  try {
    if (Array.isArray(taskData)) {      
      const { error } = await db
      .from("daily_acts")
      .upsert(taskData, { onConflict: 'act_name' });

      if (error) throw error;
    
      return {
        success: true,
        msg: "Сохранено",
      };
    } else {
      const savedData = {
        act_name: taskData.name,
        act_point: +taskData.point,
        act_option: taskData.option,
        act_duration: +taskData.duration,
        act_date: taskData.date,
        act_time: taskData.time,
        act_timer: taskData.timer
      };
          
      const { data: data, error } = await db
      .from("daily_acts")
      .upsert(savedData, { onConflict: 'act_name' })
      .select('id')
      .single();

      if (error) throw error;
    
      savedData.id = data.id;

      if (taskData.date || currDate) {
        addDailyTask(taskData);
      }

      return {
        success: true,
        msg: "Сохранено",
        addCurrTask: taskData.date === getTodayDate() && !currDate,
        savedData: savedData
      };
    }

  } catch (err) {
    console.error("SAVE ERROR:", err);
    throw err;
  }

}

const sendTask = async (arrTasks, type = 'task') => {  
  if (!Array.isArray(arrTasks) || !arrTasks.length) {
    return { success: false, msg: 'Нет данных для сохранения' };
  }

  // дата ТОЛЬКО в формате YYYY-MM-DD
  const todayISO = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  // формируем payload для БД (НЕ мутируем исходные объекты)
  const payload = arrTasks.map(task => ({
    daily_date: todayISO,
    act_id: task.act_name, // связь по name, как ты и используешь
    done: false,
    act_point: task.act_point
  }));

          console.log('Переработанные данные блока');
          console.log(payload);

  const { error } = await db
    .from('daily')
    .upsert(payload);

  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }

  return {
    success: true,
    msg: 'Сохранено'
  };
};

const getUnspecList = async () => {
  const { data: actsArr, error: actsError } = await db
    .from('daily_acts')
    .select('id, act_name, act_option, act_timer, act_point, act_date, act_time, act_duration')
    .eq('act_spec', false)
    .order('act_created_at');

  if (actsError) throw actsError;  

  return actsArr;
}

const getBlockList = async() => {
  const { data: actsArr, error: actsError } = await db
    .from('act_blocks')
    .select(`id,block_name,block_color,block_option,sequence,act_name,
              daily_acts!inner (act_name,act_point,act_duration)`)
    .order('block_name')
    .order('sequence');

  if (actsError) throw actsError;  

  return actsArr;
}

const saveBlock = async(blockData) => {  
  const dataToDelete  = [];
  const dataToSave    = [];
        console.log(`Состав к отправке:`);
        console.log(choosedTasks);
        
  for (let idx=0; idx < blockData.length; idx++) {
            console.log(`Позиция ${idx + 1} не отправится:`);
            console.log((blockData[idx].delete && blockData[idx].new) || (!blockData[idx].new && !blockData[idx].delete));
            
    if ((blockData[idx].delete && blockData[idx].new) || (!blockData[idx].new && !blockData[idx].delete)) continue;
    
    const sendData = {
      act_name: blockData[idx].act_name,
      block_name: blockData[idx].block_name,
      block_color: blockData[idx].block_color,
      block_option: blockData[idx].block_option,
      sequence: blockData[idx].sequence ? blockData[idx].sequence : 1
    };
    
    if (blockData[idx].delete) { dataToDelete.push(blockData[idx].id); } 
    else { dataToSave.push(sendData); }
  };    
            console.log(`Массив к удалению:`);
            console.log(dataToDelete);
            
            console.log(`Массив к сохранению:`);
            console.log(dataToSave);
  try {
    if (dataToSave.length) {
      const { error: saveError } = await db
                              .from("act_blocks")
                              .insert(dataToSave);

      if (saveError) throw saveError;
    }

    if (dataToDelete.length) {
      const { error: deleteError } = await db
                              .from("act_blocks")
                              .delete()
                              .in('id', dataToDelete);

      if (deleteError) throw deleteError;
    }

    return {
      success: true,
      msg: "Сохранено",
    };

  } catch (err) {
    console.error("SAVE ERROR:", err);
    throw err;
  }
}

const getDayPageData = async() => {  
  const { data: dailyRows, error: dailyError } = await db
    .from('daily')
    .select(`id,
            act_id,
            done,
            daily_acts!inner (
              act_name,
              act_timer,
              act_point,
              act_time,
              act_sub_acts,
              act_duration
            )
          `)
    .eq('daily_date', ruDateToISO(currDate))
    .order('done');

  if (dailyError) throw dailyError;  
  
  return dailyRows;
}

const sendCheckToTask = async (id) => {
  const { error } = await db
    .from('daily')
    .update({ done: true })
    .eq('id', id);

  if (error) {
    console.error('Supabase error:', error);
    throw error;
  } 
}

const getShopListData = async() => {
  const { data, error } = await db
    .from('shop_list')
    .select('*')
    .order('bought', { ascending: false }) // false → true
    .order('itemPriority', { ascending: true });; // true - false

  if (error) throw error;  

  return data;
}

const sendCheckToShopList = async (id, value) => {
  const { error } = await db
    .from('shop_list')
    .update({ bought: value })
    .eq('id', id);

  if (error) {
    console.error('Supabase error:', error);
    throw error;
  } 
}

const saveShopListItem = async (itemData) => {    
  try {         
      const { data, error } = await db
      .from("shop_list")
      .insert(itemData)
      .select('id')
      .single();

      if (error) console.error("SAVE ERROR:", error);
    
      return {
        success: true,
        msg: "Сохранено",
        id: data.id
      };
  } catch (err) {
    console.error("SAVE ERROR:", err);
    throw err;
  }

}

const sendWeightData = async(value) => {
  try {         
      const { error } = await db
      .from("weight-control")
      .insert({ value: value });

      if (error) console.error("SAVE ERROR:", error);
  } catch (err) {
    console.error("SAVE ERROR:", err);
    throw err;
  }
}

const sendFinGoalFlowData = async(value, type) => {
  try {         
    const rpcName = type ? 'increment' : 'decrement';

    const { error } = await db.rpc(rpcName, {  value: Number(value) });

    if (error) console.error("SAVE ERROR:", error);
  } catch (err) {
    console.error("SAVE ERROR:", err);
    throw err;
  }
}