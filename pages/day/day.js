const listData  = null;
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
    currDate = formatDateLocal(getTodayDate());

    elCurrDate.textContent = currDate;

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

    elContent.addEventListener('click', processTaskClick);
}

const initContent = () => {
    initSupabase();
    fillDetails();
}

window.addEventListener("DOMContentLoaded", initContent);