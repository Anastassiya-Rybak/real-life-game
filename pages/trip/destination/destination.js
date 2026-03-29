let planData  = [];
let reservData = [];
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
    } else if (type == 'reserv') {
        const elParentUl = document.getElementById('reserv');  
        let elLi = document.createElement('li');
        elLi.id = data.id;
        elLi.className = data.paid ? 'paid' : 'unpaid';
        elLi.innerHTML = `<h4>${data.date} ${data.time}</h4>
                            <p>${data.option}</p>
                            <span>${data.price} ${data.currency}</span>`;
        elParentUl.append(elLi);
    } else if (type == 'mark') {
        const elParentUl = document.getElementById('marks');  
        let elLi = document.createElement('li');
        elLi.id = data.id;
        elLi.textContent = data.value;

        elParentUl.append(elLi);
    } else if (type == 'list') {
        const listValue = JSON.parse(data.value);
        const elParentUl = document.getElementById(listValue.parentID);  

        let elLi = document.createElement('li');
        elLi.id = data.id;
        elLi.innerHTML = `<div class="sqvr ${listValue.done ? 'done' : ''}"></div>
                            <h4>${listValue.value}</h4>`;
        elParentUl.append(elLi);
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

    allDestDetails.daysData.forEach((elem)=>{
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
        } else if (elem.type == 'reserv') {
            procObj = reservData.find(el => el.date == elem.trip_date && el.time == elem.time);

            procItem = JSON.parse(elem.value);

            if (!procObj) {
                procObj = {
                    id: elem.id,
                    time: elem.time,
                    date: elem.trip_date,
                    option: procItem.option,
                    price: procItem.price,
                    currency: procItem.currency,
                    paid: procItem.paid
                }
            }

            createEl('reserv', procObj)
        } else if (elem.type == 'mark') {
            procObj = {
                id: elem.id,
                value: elem.value
            }

            createEl('mark', procObj)
        } else if (elem.type == 'list') {
            procObj = {
                id: elem.id,
                value: elem.value
            }

            createEl('list', procObj)
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
            elements[5].classList.add('hidden');
            elements[6].classList.remove('hidden');
            elements[7].classList.add('hidden');
            break;
        case 1:
            elements[1].classList.add('hidden');
            elements[2].classList.remove('hidden');
            elements[3].classList.remove('hidden');
            elements[4].classList.remove('hidden');
            elements[5].classList.add('hidden');
            elements[6].classList.remove('hidden');
            elements[7].classList.add('hidden');
            break;
        case 2:
            elements[1].classList.add('hidden');
            elements[2].classList.add('hidden');
            elements[3].classList.add('hidden');
            elements[4].classList.add('hidden');
            elements[5].classList.add('hidden');
            elements[6].classList.remove('hidden');
            elements[7].classList.add('hidden');
            break;
        case 3:
            elements[1].classList.remove('hidden');
            elements[2].classList.remove('hidden');
            elements[3].classList.add('hidden');
            elements[4].classList.remove('hidden');
            elements[5].classList.remove('hidden');
            elements[6].classList.remove('hidden');
            elements[7].classList.remove('hidden');
            break;
        case 4:
            elements[1].classList.add('hidden');
            elements[2].classList.add('hidden');
            elements[3].classList.add('hidden');
            elements[4].classList.remove('hidden');
            elements[5].classList.add('hidden');
            elements[6].classList.remove('hidden');
            elements[7].classList.add('hidden');
            break;
        case 5:
            elements[1].classList.add('hidden');
            elements[2].classList.add('hidden');
            elements[3].classList.remove('hidden');
            elements[4].classList.add('hidden');
            elements[5].classList.add('hidden');
            elements[6].classList.remove('hidden');
            elements[7].classList.add('hidden');
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
        case 3:
            elForm[0].textContent = 'Новая бронь:';
            setModalElVisible(elForm, type);
            break;
        case 4:
            elForm[0].textContent = 'Новая заметка:';
            setModalElVisible(elForm, type);
            break;
        case 5:
            elForm[0].textContent = '';
            setModalElVisible(elForm, type);
            break;
        default:
            break;
    }
}

const processNavigation = (e) => {
    let currBtn = e.target.closest('button');
    let dataMark = '';

    if (!currBtn) {
        currBtn = e.target.closest('li');
        dataMark = '-list'
    }

    if (!currBtn) return;

    if (!currBtn.dataset.nav) { 
        toggleModal(); 
        return;
    }

    const daysData = +currBtn.dataset.nav;

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
    } else if (formType == 1) {
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
    } else if (formType == 3) {
        const elPriceInfo = formEls[5].children;
        const dataToJSon = {
            option: formEls[4].value,
            price: elPriceInfo[0].value,
            currency: elPriceInfo[1].value,
            paid: elPriceInfo[2].checked
        };

        const newReservData = {
            type: 'reserv',
            value: JSON.stringify(dataToJSon),
            time: formEls[2].value,
            trip_date: formEls[1].value,
            trip_id: tripId
        };

        const result = await saveReserv(newReservData);

        elBtn.textContent = result.msg;

        setTimeout(()=>{
            elBtn.textContent = 'OK';
        }, 600)

        const resToStore = {
            id: result.res.id,
            time: result.res.time,
            date: result.res.trip_date,
            option: dataToJSon.option,
            price: dataToJSon.price,
            currency: dataToJSon.currency,
            paid: dataToJSon.paid
        }

        reservData.push(resToStore);
            
        toggleModal(); 

        createEl('reserv', resToStore);
    } else if (formType == 4) {
        const newMarkData = {
            type: "mark",
            value: formEls[4].value,
            trip_id: tripId
        };

        const result = await saveMark(newMarkData);

        elBtn.textContent = result.msg;

        setTimeout(()=>{
            elBtn.textContent = 'OK';

            toggleModal(); 

            createEl('mark', result.res);
        }, 600)
    } else if (formType == 5) {
        const dataToJSon = {
            parentID: document.querySelector('.active-list').dataset.nav,
            value: formEls[3].value,
            done: false
        };

        const newCheckData = {
            type: 'list',
            value: JSON.stringify(dataToJSon),
            trip_id: tripId
        };

        const result = await saveCheckItem(newCheckData);

        elBtn.textContent = result.msg;

        setTimeout(()=>{
            elBtn.textContent = 'OK';

            toggleModal(); 

            createEl('list', result.res);
        }, 600)
    }
}

const addDayItem  = () => {
    toggleModal(1);
}

const addReservItem = () => {
    toggleModal(3);
}

const addMarkItem = () => {
    toggleModal(4);
}

const showDetailes = (e) => {
    const currLiEl = e.target.closest('li');

    if (!currLiEl) return;

    toggleModal(2, currLiEl);
}

const openMark = (e) => {
    const elLi = e.target.closest('li');

    if (!elLi) return;

    elLi.classList.toggle('opened');
}

const addListItem = () => {
    toggleModal(5);
}

const toCheck = async(e) => {
    const elParent = e.target.closest('.sqvr');

    if (!elParent) return;

    const elLi = e.target.closest('li');

    const dataToJSon = {
        parentID: document.querySelector('.active-list').dataset.nav,
        value: elLi.children[1].textContent,
        done: !elParent.className.includes('done')
    };

    const newCheckData = {
        id: elLi.id,
        type: 'list',
        value: JSON.stringify(dataToJSon),
        trip_id: tripId
    };

    const result = await saveCheckItem(newCheckData);

    if (result.success) {
        elParent.classList.toggle('done');
    }

}

const initListeners = () => {
    document.getElementById('navigation').addEventListener('click', processNavigation);
    document.getElementById('days-navigation').addEventListener('click', processNavigation);
    document.getElementById('daysPlan').addEventListener('click', showDetailes);
    document.getElementById('add-day-plan-item').addEventListener('click', addDayItem);
    document.getElementById('add-reserv').addEventListener('click', addReservItem);
    document.getElementById('add-mark').addEventListener('click', addMarkItem);
    document.querySelector('.marks-btn').addEventListener('click', processNavigation);
    document.querySelector('.modal-wrap').addEventListener('click', processModalClick);
    document.getElementById('marks').addEventListener('click', openMark);
    document.querySelector('.checkList_tab').addEventListener('click', processNavigation);
    document.getElementById('add-check-item').addEventListener('click', addListItem);
    document.getElementById('checkList').addEventListener('click', toCheck);
}

const initContent = () => {
    initSupabase();
    fillDetails();
    initListeners();
}

window.addEventListener("DOMContentLoaded", initContent);