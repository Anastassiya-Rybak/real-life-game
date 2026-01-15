let db;

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
  const today = new Date();
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
  const { error: errorDaily } = await db
    .from('daily')
    .insert([{
      daily_date: taskData.date,      // YYYY-MM-DD
      act_id: taskData.name,          // связь через name
      act_point: Number(taskData.point) || 0,
      act_duration: Number(taskData.duration) || 0,
      act_time: taskData.time || null
    }]);

  if (errorDaily) throw errorDaily;
}

const saveTask = async (taskData) => {  
  try {
    const { error } = await db
      .from("daily_acts")
      .upsert({
        act_name: taskData.name,
        act_point: +taskData.point,
        act_option: taskData.option,
        act_duration: +taskData.duration,
        act_time: taskData.time,
        act_timer: taskData.timer
      });

    if (error) throw error;

    if (taskData.date) {
      addDailyTask(taskData);
    }

    return {
      success: true,
      msg: "Сохранено",
      addCurrTask: taskData === getTodayDate()
    };

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
  const todayISO = new Date().toISOString().slice(0, 10);

  // формируем payload для БД (НЕ мутируем исходные объекты)
  const payload = arrTasks.map(task => ({
    daily_date: todayISO,
    act_id: task.act_name,          // связь по name, как ты и используешь
    act_point: task.act_point ?? 0,
    act_duration: task.act_duration ?? null,
    act_time: task.act_time ?? null,
    done: false
  }));

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
    .select('id, act_name, act_point, act_time, act_duration, act_block, block_color')
    .eq('act_spec', false)
    .order('act_point', { ascending: false });

  if (actsError) throw actsError;  

  return actsArr;
}