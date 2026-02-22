const elContent = document.querySelector('.list-content');

let techListData = [];

const processTaskClick = (e) => {
    const elLi = e.target.closest('.del-btn');

    if (!elLi) return;

    const parentLi = elLi.closest('li');

    deleteTechTask(parentLi.id);

    parentLi.remove();
}

const createElem = (data) => {
    const elLi = document.createElement('li');
    elLi.id = data.id;
    elContent.append(elLi);

    const elText = document.createElement('span');
    elText.textContent = data.value;
    elText.className = 'li-text';

    const elSpan = document.createElement('span');
    elSpan.textContent = 'x';
    elSpan.className = 'del-btn';

    elLi.append(elText, elSpan);
}

const fillDetails = async () => {
    techListData = await getTechTasksData();
    
    elContent.innerHTML = '';

    techListData.forEach(el => {
        createElem(el);
    });

}

const sendTechTask = async(e) => {
    e.preventDefault();
        
    const res = await sendTechTaskData(document.getElementById('dev-msg').value);

    createElem(res);

    document.getElementById('dev-msg').value = ''
}

const initListeners = () => {
    document.getElementById('add-task').addEventListener('click', sendTechTask);
    elContent.addEventListener('click', processTaskClick)
}

const initContent = () => {
    initSupabase();
    fillDetails();
    initListeners();
}

window.addEventListener("DOMContentLoaded", initContent);