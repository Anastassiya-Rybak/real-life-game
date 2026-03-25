const listData  = [];
const elContent = document.querySelector('.content_list');

const goToDestination = (e) => {
    const elLi = e.target.closest('li');

    if (!elLi) return;

    location.href = `/pages/trip/destination/destination.html?id=${elLi.id}`;
}

const createEl = (el) => {
    const elLi = document.createElement('li');
    elLi.id = el.id;
    elLi.className = 'content_card card';
    elLi.classList.add(el.date_end <= Date.now() ? 'is-done' : 'not-done');
    elContent.append(elLi);

    let elPeriod = '';

    if (el.date_start) { elPeriod = `<span>${el.date_start} - ${el.date_end}</span>`; }

    elLi.innerHTML = `<img src="${el.img ? el.img : '/istockphoto-1526986072-612x612.jpg'}" alt="">
                        <div class="card_text">
                            <h3>${el.name}</h3>
                            <span>${elPeriod}</span>
                        </div>`;
}

const fillDetails = async () => {
    dailyTaskData = await getTripsData();
    
    elContent.innerHTML = '';

    dailyTaskData.forEach(el => {
        createEl(el);
    });

}

const saveNewTrip = async (e) => {
    e.preventDefault();
    
    const form   = document.querySelector('form');
    const addBtn = e.target;

    // Сбор данных формы
    const raw = Object.fromEntries(new FormData(form));

    const savedData = { ...raw };  

    try {
    addBtn.disabled = true;
    addBtn.textContent = 'Сохранение...';

        console.log(savedData);
        

    const res = await saveTrip(savedData);

    addBtn.textContent = res.msg || 'Сохранено';

    listData.push(res.savedData); 
    createEl(res.savedData);

    setTimeout(() => {
        form.reset();
        addBtn.textContent = 'СОЗДАТЬ';
        addBtn.disabled = false;
    }, 600);

    } catch (err) {
    console.error(err);
    addBtn.textContent = 'Ошибка';
    addBtn.disabled = false;
    }

}

const initListeners = () => {
    elContent.addEventListener('click', goToDestination);
    document.getElementById('add-new-trip').addEventListener('click', saveNewTrip);
}

const initContent = () => {
    initSupabase();
    fillDetails();
    initListeners();
}

window.addEventListener("DOMContentLoaded", initContent);