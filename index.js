const listData = null;

const fillDetails = async () => {
    const currData = await getMainPageData();
    
    const elDate            = document.querySelector('.date');
    const elLimitSection    = document.querySelectorAll('.limit');
    const elSavedSum        = document.getElementById('saved-summ');
    const elGoalSum         = document.getElementById('goal-summ');
    const elSumProgressBar  = document.querySelector('.progress-fill');
    const elDayPoints       = document.getElementById('day-points');
    const elTasksCheck      = document.getElementById('tasks-check');
    const elWeightValue     = document.querySelectorAll('.weight-value-in');
    const elWeightProgressBar  = document.querySelector('.weight-line-progress');
    
    elDate.textContent = currData.today;
    
    elLimitSection[0].textContent = currData.todayCashFlow;
    elLimitSection[1].textContent = currData.budgetLimit;

    elSavedSum.textContent  = currData.financeGoal.goalSave;
    elGoalSum.textContent   = currData.financeGoal.goalSum;

    const percent = (currData.financeGoal.goalSave / currData.financeGoal.goalSum) * 100;

    if (percent <= 30) { elSumProgressBar.classList.add('bad'); }
    else if (percent <= 75) { elSumProgressBar.classList.add('middle'); }
    else { elSumProgressBar.classList.add('succes'); }
    
    elSumProgressBar.style.width = `${percent}%`;

    elDayPoints.textContent = currData.daily.donePoints;

    elTasksCheck.textContent = `${currData.daily.done} / ${currData.daily.total}`;

    const weightPercent = ((currData.weightStart - currData.currentWeight) / (currData.weightStart - currData.weightGoal)) * 100;

    if (weightPercent <= 30) { elWeightProgressBar.classList.add('bad'); }
    else if (weightPercent <= 75) { elWeightProgressBar.classList.add('middle'); }
    else { elWeightProgressBar.classList.add('succes'); }
    
    elWeightProgressBar.style.width = `${weightPercent}%`;

    elWeightValue[0].textContent = currData.currentWeight;
    elWeightValue[1].textContent = currData.weightGoal;

    // document.addEventListener('click', toProcessClick)
}

const initContent = () => {
    initSupabase();
    fillDetails();
}

window.addEventListener("DOMContentLoaded", initContent);