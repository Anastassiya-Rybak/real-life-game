let planData  = [];
let tripId;
const elContent = document.querySelector('.content');
const elDaysContainer = document.querySelector('.daysPlan_nav');
const elAddDay = document.getElementById('add-day-plan');
const elAddDayItem = document.getElementById('add-day-plan-item');

const createEl = (type, data) => {
    if (type == 'day') {
        // Создаем кнопку навигации
        let elBtn = document.createElement('button');
        elBtn.className = 'daysPlan_btn';
        elBtn.dataset.nav = data.num;
        elBtn.innerHTML = `<h3>День ${data.num}</h3> <span>${data.date}</span>`;
        elAddDay.before(elBtn);

        // Создаем контейнер под контент нового дня
        let elContent = document.createElement('div');
        elContent.className = 'daysPlan_content';
        elContent.dataset.dayContent = data.num;
        elContent.innerHTML = `<ul></ul>`;
        elAddDayItem.before(elContent);

        // Меняем видимость элементов под новый активный день
        const exActive = document.querySelector('.active-day');

        if (!exActive) return;

        exActive.classList.remove('active-day');
        elBtn.classList.add('active-day');

        document.querySelector(`[data-dayContent="${exActive.dataset.nav}"]`).classList.add('hidden');
    } else if (type == 'day-item') {

    }
}

const fillDetails = async () => {

    tripId = 2;
    // dailyTaskData = await getTripsData();
    
    // elContent.innerHTML = '';

    // dailyTaskData.forEach(el => {
    //     createEl(el);
    // });

}

const toggleDayAdding = () => {
    const modalEl = document.querySelector('.modal-wrap');

    modalEl.classList.toggle('hidden');
    // modalEl.children[0].children[0].dataset.newDay = planData.length + 1;
    // modalEl.children[0].children[0].textContent = 'День ' + (planData.length + 1);

    modalEl.children[0].children[0].dataset.newDay = 3;
    modalEl.children[0].children[0].textContent = 'День ' + 3;
}

const processNavigation = (e) => {
    const currBtn = e.target.closest('button');

    if (!currBtn) return;

    if (!currBtn.dataset.nav) { 
        toggleDayAdding(); 
        return;
    }

    const daysData = +currBtn.dataset.nav;
    let dataMark = '';

    if (daysData) {
        dataMark = '-day';
    }    
    
    const exActive = document.querySelector('.active'+dataMark);
    exActive.classList.remove('active'+dataMark);
    currBtn.classList.add('active'+dataMark);

    if (daysData) {
        document.querySelector(`[data-dayContent="${exActive.dataset.nav}"]`).classList.add('hidden');
        document.querySelector(`[data-dayContent="${daysData}"]`).classList.remove('hidden');
    } else {
        document.querySelector(`.${exActive.dataset.nav}`).classList.add('hidden');
        document.querySelector(`.${currBtn.dataset.nav}`).classList.remove('hidden');
    }
}

const processModalClick = async(e) => {

    const elBtn = e.target.closest('button');

    if (e.target.closest('form') && !elBtn) { return; }

    if (!elBtn) { 
        toggleDayAdding();
        return; 
    }

    e.preventDefault();
    
    const formEls = document.querySelector('.modal-content').children;

    const newDayData = {
        num: formEls[0].dataset.newDay,
        date: formEls[1].value,
        trip_id: tripId
    };

    const result = await saveDay(newDayData);

    elBtn.textContent = result.msg;

    setTimeout(()=>{
        elBtn.textContent = 'OK';
    }, 600)
        
    toggleDayAdding(); 

    createEl('day', newDayData);
}

const initListeners = () => {
    document.getElementById('navigation').addEventListener('click', processNavigation);
    document.getElementById('days-navigation').addEventListener('click', processNavigation);
    // document.querySelector('.daysPlan_content').addEventListener('click', openItemDetales);
    // document.getElementById('add-day-plan-item').addEventListener('click', addDayItem);
    // document.querySelector('.marks-btn').addEventListener('click', processNavigation);
    document.querySelector('.modal-wrap').addEventListener('click', processModalClick);
}

const initContent = () => {
    initSupabase();
    fillDetails();
    initListeners();
}

window.addEventListener("DOMContentLoaded", initContent);