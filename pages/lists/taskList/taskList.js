let listData = null;

const fillContent = async() => {
    const elContainer = document.querySelector('.list-content');

    if (!listData) {
        listData = await getUnspecList();  
    }

    listData.forEach(el => {
        const elItemLi = document.createElement('li');
        elItemLi.className   = "list-content_item";
        elItemLi.id          = el.id;
        
        elContainer.append(elItemLi);

        const elItemH4 = document.createElement('h4');
        elItemH4.textContent = el.act_name;

        const elItemSpan = document.createElement('span');
        elItemSpan.innerHTML = `${el.act_duration} | <span style="color: green;">${el.act_point}</span>`;

        const elItemBtn = document.createElement('button');
        elItemBtn.className = "list-content_btn icon-btn";
        elItemBtn.innerHTML = '<img src="/pen-new-round-svgrepo-com.svg" alt="open">';

        elItemLi.append(elItemH4);
        elItemLi.append(elItemSpan);
        elItemLi.append(elItemBtn);
    });
}

const initContent = () => {
    initSupabase();
    fillContent();
}

window.addEventListener("DOMContentLoaded", initContent);