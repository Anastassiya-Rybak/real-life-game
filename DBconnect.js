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
  return new Date().toISOString().slice(0, 10);
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
  const today = getTodayDate();

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
     2. CASH FLOW
  ========================= */
  const { data: cashFlowRows, error: cashFlowError } = await db
    .from('cash-flow')
    .select('flow_sum, flow_type')
    .eq('flow_date', today);

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
    .select('num_value')
    .eq('const_name', 'weight_goal')
    .limit(1);

  if (constError) throw constError;

  const weightGoal = weightConstRows?.[0]?.num_value ?? null;

  /* =========================
     4. DAILY TASKS
  ========================= */
  const { data: dailyRows, error: dailyError } = await db
    .from('daily')
    .select('done, act_point')
    .eq('date', today);

  if (dailyError) throw dailyError;

  const totalDaily = dailyRows?.length ?? 0;

  const doneDaily = (dailyRows ?? []).filter(row => row.done === true);
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

  const currentWeight = weightRows?.[0]?.value ?? null;

  /* =========================
     RESULT
  ========================= */
  return {
    budgetLimit,
    todayCashFlow,
    weightGoal,
    daily: {
      total: totalDaily,
      done: doneCount,
      donePoints
    },
    financeGoal,
    currentWeight
  };
}
