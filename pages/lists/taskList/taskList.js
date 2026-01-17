let listData = null;
const elContainer = document.querySelector('.list-content');

const createLi = (liData) => {    
    const elItemLi = document.createElement('li');
    elItemLi.className   = "list-content_item";
    elItemLi.id          = liData.id;
    
    elContainer.prepend(elItemLi);

    const elItemH4 = document.createElement('h4');
    elItemH4.textContent = liData.act_name;

    const elItemSpan = document.createElement('span');
    elItemSpan.innerHTML = `${liData.act_duration} | <span style="color: green;">${liData.act_point}</span>`;

    const elItemBtn = document.createElement('button');
    elItemBtn.className = "list-content_btn icon-btn";
    elItemBtn.innerHTML = '<img src="/pen-new-round-svgrepo-com.svg" alt="open">';

    elItemLi.append(elItemH4);
    elItemLi.append(elItemSpan);
    elItemLi.append(elItemBtn);
}

const fillContent = async() => {
    if (!listData) {
        listData = await getUnspecList('act_reg');  
    }

    listData.forEach(el => {
        createLi(el);
    });
}

const openTaskCard = (e) => {
    const parent = e.target.closest('button');
    
    if (!parent) return;

    openNewTaskModal(parent.closest('li').id);
}

const initContent = () => {
    initSupabase();
    fillContent();
}

elContainer.addEventListener('click', openTaskCard)
window.addEventListener("DOMContentLoaded", initContent);