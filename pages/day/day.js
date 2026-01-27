const listData  = null;
const elSwitchDate = document.getElementById('switch-date-btn');
const elCurrDate = document.getElementById('curr-day');
const elContent = document.querySelector('.list-content');

let dailyTaskData = [];

const checkDailyTask = async (id, element) => {
    sendCheckToTask(id);

    element.classList.add('is-done');
    element.children[0].classList.add('done');
    elContent.append(element);
}

const processTaskClick = (e) => {
    const elLi = e.target.closest('li');

    if (!elLi) return;

    if (e.target.closest('.sqvr') && !e.target.closest('.done')) {
        checkDailyTask(elLi.id, elLi);
    }
}

const fillDetails = async () => {
    if (!currDate) {
        currDate = formatDateLocal(getTodayDate());

        elCurrDate.value = getTodayDate();
    }

    dailyTaskData = await getDayPageData();
    
    dailyTaskData.forEach(el => {
        const elLi = document.createElement('li');
        elLi.id = el.id;
        elLi.className = el.done ? 'is-done' : '';
        elContent.append(elLi);

        let elDop = '';

        if (el.daily_acts.act_time) { elDop = `<span class="list-content_time">${el.daily_acts.act_time}</span>`; }
        else if (el.daily_acts.act_duration && el.daily_acts.act_timer) { elDop = `<button class="list-content_timer-btn" data-detail="${el.daily_acts.act_duration}">>></button>`; }
        else if (el.daily_acts.act_sub_acts) { elDop = '<button class="list-content_detail-btn"></button>'; }

        elLi.innerHTML = `<div class="sqvr ${el.done ? 'done' : ''}"></div>
                        <div class="list-content_data">
                            <p><span style="color: green;">${el.daily_acts.act_point}</span> | ${el.daily_acts.act_duration} мин.</p>
                            <h4>${el.daily_acts.act_name}</h4>
                        </div>
                        <div class="list-content_dop">
                            ${elDop}
                        </div>`;
    });

}

const formatForInputDate = (date) => {
  console.log(date);
  if (!(date instanceof Date) || isNaN(date)) return '';
  
  return date.toISOString().slice(0, 10);
};

const switchCurrDate = () => {
    elSwitchDate.classList.add('hidden');

    currDate = formatDateLocal(elCurrDate.value);

    elContent.innerHTML = '';

    fillDetails();
}

const processDateClick = (e) => {
    const currEl = e.target.closest('button') || e.target.closest('input');
    
    if (!currEl) return; 

    currDate = new Date(ruDateToISO(currDate));

    switch (currEl.id) {
        case 'curr-day':
            elSwitchDate.classList.remove('hidden');
            break;
        case 'switch-date-btn':
            switchCurrDate();
            break;
        case 'prev-day-btn':
            currDate.setDate(currDate.getDate() - 1);
            elCurrDate.value = formatForInputDate(currDate);
            switchCurrDate();
            break;
        case 'next-day-btn':
            currDate.setDate(currDate.getDate() + 1);
            elCurrDate.value = formatForInputDate(currDate);
            switchCurrDate();
            break;
        default:
            break;
    }
}

const initListeners = () => {
    elContent.addEventListener('click', processTaskClick);
    document.querySelector('.date-content').addEventListener('click', processDateClick)
}

const initContent = () => {
    initSupabase();
    fillDetails();
    initListeners();
}

window.addEventListener("DOMContentLoaded", initContent);