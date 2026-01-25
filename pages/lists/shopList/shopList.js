const shopList  = [];

const elContentDaily = document.querySelector('.daily-content');
const elContentPlan = document.querySelector('.plan-content');
const formEl = document.getElementById('modal_item-add');

const createElement = (elData) => {
    const currContainer = elData.isPlan ? elContentPlan : elContentDaily;

    const elLi = document.createElement('li');
    currContainer.prepend(elLi);

    const checkIs = elData.bought ? 'checked' : '';

    elLi.innerHTML = elData.isPlan 
                        ? `<input type="checkbox" name="${elData.id}" id="${elData.id}">
                            <label>
                                <h4>${elData.itemName}</h4>
                                <span>|</span>
                                <p>${elData.itemPrice} тг</p>
                            </label>` 
                        : `<input type="checkbox" name="${elData.id}" id="${elData.id}"${checkIs}>
                            <label>${elData.itemName}</label>`;
}

const checkItem = async(element) => {
    sendCheckToShopList(element.id, element.checked);
}

const toggleModal = () => {
    formEl.classList.toggle('hidden');
    formEl.classList.remove('plan');
}

const processClick = (e) => {
    if (e.target.closest('input')) { checkItem(e.target.closest('input')); }

    const currBtn = e.target.closest('button');

    if (!currBtn) return;

    toggleModal();

    if (currBtn.id == 'add-plan-shop-item') formEl.classList.add('plan');

}

const sendItem = async(e) => {
    e.preventDefault();

    const formElArr = formEl.children[0].children;

    const dataToSave = {
        isPlan: formEl.classList.contains('plan'),
        itemName: formElArr[1].value,
        itemPrice: +formElArr[3].value,
        itemPriority: +formElArr[2].value
    };

    const savedData = await saveShopListItem(dataToSave);

    dataToSave.id = savedData.id;

    createElement(dataToSave);

    formEl.children[0].reset();

    toggleModal();
}

const fillDetails = async () => {
    dailyTaskData = await getShopListData();
    
    dailyTaskData.forEach(el => {
        createElement(el);
    });

    document.querySelector('.dashboard').addEventListener('click', processClick);
    formEl.addEventListener('submit', sendItem);
    formEl.addEventListener('click', (e)=>{ if (!e.target.closest('.modal-content')) { toggleModal(); } })
}

const initContent = () => {
    initSupabase();
    fillDetails();
}

window.addEventListener("DOMContentLoaded", initContent);