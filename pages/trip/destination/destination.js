let planData  = [];
let tripId;
let currDayData = {};
const elContent = document.querySelector('.content');
const elDaysContainer = document.querySelector('.daysPlan_nav');
const elAddDay = document.getElementById('add-day-plan');
const elAddDayItem = document.getElementById('add-day-plan-item');

const createEl = (type, data, init = false) => {
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
        if (init) {
            elContent.classList.add('hidden');
            return;
        }

        const exActive = document.querySelector('.active-day');
        
        elBtn.classList.add('active-day');

        if (!exActive) return;

        exActive.classList.remove('active-day');

        document.querySelector(`[data-day-content="${exActive.dataset.nav}"]`).classList.add('hidden');
    } else if (type == 'day-item') {
        // Создаем новый пункт плана на день
        let activeDay;

        if (!data.day) {
            activeDay = document.querySelector('.active-day').dataset.nav;
        } else {
            activeDay = data.day;
        }

        const elDayContentWrapper = document.querySelector(`[data-day-content="${activeDay}"]`).children[0];

        let elLi = document.createElement('li');
        elLi.id = data.id;
        elDayContentWrapper.append(elLi);

        // Время отображаем только если оно реально привязано ко времени
        if (data.time) {
            let elTime = document.createElement('span');
            elTime.className = 'daysPlan_day-time';
            elTime.textContent = data.time;
            elLi.append(elTime);
        }

        let elName = document.createElement('h4');
        elName.className = 'daysPlan_day-item';
        elName.textContent = data.name;
        elLi.append(elName);
    } else if (type == 'item-detail') {
        const elParentOl = document.getElementById('modal-detailes');  
        let elLi = document.createElement('li');
        elLi.textContent = data;
        elParentOl.append(elLi);
    }
}

const fillDetails = async () => {
    const params = new URLSearchParams(window.location.search);
    tripId = params.get('id');
    const allDestDetails = await getDestinationData(tripId);

    let elTitle = document.querySelector(".content-title").children;
    elTitle[0].src = allDestDetails.tripInfo.img;
    elTitle[1].textContent = allDestDetails.tripInfo.name;

    let procObj;
    let procItem;

    allDestDetails.daysData.forEach((elem,idx)=>{
        if (elem.type == 'day') {
            procObj = {};
            procObj.num = elem.value;
            procObj.date = elem.trip_date;
            procObj.items = [];

            planData.push(procObj);
        } else if (elem.type.includes('day-item')) {            
            procObj = planData.find(el => el.date == elem.trip_date );

            procItem = procObj.items.find(el => el.name == elem.name );

            if (!procItem) {
                procItem = {};
                procItem.day = procObj.num;
                procItem.id = elem.id;
                procItem.name = elem.name;
                procItem.time = elem.time;
                procItem.detaile = [];

                procObj.items.push(procItem);
            } else {
                procItem.detaile.push(elem.value); 
            }            
        } 
    });
    
    planData.forEach((elem,idx) => {
        createEl('day', elem, idx !== 0);
        elem.items.forEach(el => {            
            createEl('day-item', el);
        })
    });

    currDayData = planData[0];
}

const setModalElVisible = (elements, type) => {
    switch (type) {
        case 0:
            elements[1].classList.remove('hidden');
            elements[2].classList.add('hidden');
            elements[3].classList.add('hidden');
            elements[4].classList.add('hidden');
            elements[5].classList.remove('hidden');
            elements[6].classList.add('hidden');
            break;
        case 1:
            elements[1].classList.add('hidden');
            elements[2].classList.remove('hidden');
            elements[3].classList.remove('hidden');
            elements[4].classList.remove('hidden');
            elements[5].classList.remove('hidden');
            elements[6].classList.add('hidden');
            break;
        case 2:
            elements[1].classList.add('hidden');
            elements[2].classList.add('hidden');
            elements[3].classList.add('hidden');
            elements[4].classList.add('hidden');
            elements[5].classList.add('hidden');
            elements[6].classList.remove('hidden');
            break;
        default:
            break;
    }
}

const toggleModal = (type = 0, dop = '') => {
    const modalEl = document.querySelector('.modal-wrap');

    modalEl.classList.toggle('hidden');
    modalEl.dataset.modalType = type;

    let elForm = modalEl.children[0].children;

    switch (type) {
        case 0:
            elForm[0].dataset.newDay   = planData.length + 1;
            elForm[0].textContent      = 'День ' + (planData.length + 1);
            setModalElVisible(elForm, type);
            break;
        case 1:
            elForm[0].textContent = 'Новый пункт плана:';
            setModalElVisible(elForm, type);
            break;
        case 2:
            elForm[0].textContent = 'Детали:';
            elForm[6].innerHTML = '';

            currDayData.items.forEach(elem => {
                if (elem.id == dop.id) {
                    elem.detaile.forEach(el => {
                       createEl('item-detail', el); 
                    });
                }
            });

            setModalElVisible(elForm, type);
            break;
        default:
            break;
    }
}

const processNavigation = (e) => {
    const currBtn = e.target.closest('button');

    if (!currBtn) return;

    if (!currBtn.dataset.nav) { 
        toggleModal(); 
        return;
    }

    const daysData = +currBtn.dataset.nav;
    let dataMark = '';

    if (daysData) {
        dataMark = '-day';
        currDayData = planData.find(el => +el.num == daysData);
    }    
    
    const exActive = document.querySelector('.active'+dataMark);
    exActive.classList.remove('active'+dataMark);
    currBtn.classList.add('active'+dataMark);

    if (daysData) {
        document.querySelector(`[data-day-content="${exActive.dataset.nav}"]`).classList.add('hidden');
        document.querySelector(`[data-day-content="${daysData}"]`).classList.remove('hidden');
    } else {
        document.querySelector(`.${exActive.dataset.nav}`).classList.add('hidden');
        document.querySelector(`.${currBtn.dataset.nav}`).classList.remove('hidden');
    }
}

const processModalClick = async(e) => {

    const elBtn = e.target.closest('button');
    
    if (e.target.closest('form') && !elBtn) { return; }

    if (!elBtn) { 
        toggleModal();
        return; 
    }

    e.preventDefault();
    
    const formType = document.querySelector('.modal-wrap').dataset.modalType;
    const formEls = document.querySelector('.modal-content').children;

    if (formType == 0) {
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

        currDayData.num = newDayData.num;
        currDayData.date = newDayData.date;
        currDayData.items = [];

        planData.push(currDayData);
            
        toggleModal(); 

        createEl('day', newDayData);
    } else {
        const newItemData = {
            time: formEls[2].value ? String(formEls[2].value) : null,
            name: formEls[3].value,
            detaile: formEls[4].value,
            date: currDayData.date,
            trip_id: tripId
        };

        const result = await saveDayItem(newItemData);

        elBtn.textContent = result.msg;

        currDayData.items.push(result);

        setTimeout(()=>{
            elBtn.textContent = 'OK';

            document.querySelector('.modal-content').reset();

            toggleModal(); 

            createEl('day-item', result.res);
        }, 600)
    }
}

const addDayItem  = () => {
    toggleModal(1);
}

const showDetailes = (e) => {
    const currLiEl = e.target.closest('li');

    if (!currLiEl) return;

    toggleModal(2, currLiEl);
}

const initListeners = () => {
    document.getElementById('navigation').addEventListener('click', processNavigation);
    document.getElementById('days-navigation').addEventListener('click', processNavigation);
    document.getElementById('daysPlan').addEventListener('click', showDetailes);
    document.getElementById('add-day-plan-item').addEventListener('click', addDayItem);
    // document.querySelector('.marks-btn').addEventListener('click', processNavigation);
    document.querySelector('.modal-wrap').addEventListener('click', processModalClick);

    
}

const initContent = () => {
    initSupabase();
    fillDetails();
    initListeners();
}

window.addEventListener("DOMContentLoaded", initContent);