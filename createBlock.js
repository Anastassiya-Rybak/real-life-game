const addNewBlock        = document.getElementById('add-new-block-btn');
const blockCreateform    = document.getElementById('modal_block-add');
let changedBlockName     = '';
let modalListData         = null;

// TODO: При создании нового задания и заполненном modalListData - добавлять его и туда
const openNewBlockModal = (changedBlock = '') => {
  blockCreateform.classList.remove('hidden');  
  
  if (typeof changedBlock !== 'string' || !changedBlock) return;

  const dataToFill = blocksData.find(el => el[0].act_block == changedBlock);
  
//   let formElArr = blockCreateform.children[0].children;

//   formElArr[1].value = dataToFill.act_name;
//   formElArr[2].value = dataToFill.act_option;

//   formElArr[3].children[0].value = dataToFill.act_point;
//   formElArr[3].children[1].value = dataToFill.act_duration;
//   formElArr[3].children[2].checked = dataToFill.act_timer;
 
//   formElArr[4].children[0].value = dataToFill.act_date;
//   formElArr[4].children[1].value = dataToFill.act_time;

  changedBlockName = changedBlock;
}

addNewBlock.addEventListener('click', openNewBlockModal);

blockCreateform.addEventListener('click', (e) => {
  if (!e.target.closest('.modal-content')) {
    blockCreateform.classList.add('hidden');
    blockCreateform.children[0].reset();
  }

  if (!e.target.closest('button')) return;
  
  const currBtn = e.target.closest('button');

  currBtn.preventDefault();

  if (currBtn.id == 'block-task-add') showTaskList();

});

const sendNewBlock = async(e) => {
  const form   = e.target;
  const addBtn = form.querySelector('.modal-task_add-btn');

  // Сбор данных формы
  const raw = Object.fromEntries(new FormData(form));

  const taskData = {
    ...raw,
    date: raw.date || null,
    time: raw.time || null,
    timer: form.querySelector('.modal-task_timer').checked
  };  

  try {
    addBtn.disabled = true;
    addBtn.textContent = 'Сохранение...';

    const res = await saveTask(taskData);

    addBtn.textContent = res.msg || 'Сохранено';
    
    if (listData) {      
      if(changedTaskID){
        const idx = listData.findIndex(el => el.id == changedTaskID);
        listData.splice(idx, 1);
        const currEl = document.getElementById(changedTaskID);
        
        currEl.remove();
      }
      
      listData.push(res.savedData); 
      createLi(res.savedData);
    } else if (res.addCurrTask) {
      const elTasksCheck = document.getElementById('tasks-check');

      const [label, countStr] = elTasksCheck.textContent.split(' / ');
      const count = Number(countStr) + 1;

      elTasksCheck.textContent = `${label} / ${count}`;
    }

    setTimeout(() => {
      taskCreateform.classList.add('hidden');
      form.reset();
      addBtn.textContent = 'Сохранить';
      addBtn.disabled = false;
    }, 600);

  } catch (err) {
    console.error(err);
    addBtn.textContent = 'Ошибка';
    addBtn.disabled = false;
  }
}

const showTaskList = async() => {
  const modalForm    = document.querySelector('modal-content');
  const elList      = taskAddform.querySelector('.modal-daily_list');
  const elContainer = taskAddform.querySelector('.modal-daily_list-content');
  
  elList.classList.remove('hidden');
  modalForm.classList.add('hidden');

  if (!modalListData) {
    modalListData = await getUnspecList('act_point');  
  }

  modalListData.forEach(el => {
    const elItemInput = document.createElement('input');
    elItemInput.type  = 'checkbox';
    elItemInput.name  = el.id;
    elItemInput.id    = el.id;

    const elItemLabel = document.createElement('label');
    elItemLabel.htmlFor = el.id;
    
    elContainer.append(elItemInput);
    elContainer.append(elItemLabel);

    const elItemTitile = document.createElement('h4');
    elItemTitile.textContent = el.act_name;
    const elItemSpan = document.createElement('span');
    elItemSpan.textContent = el.act_point;

    elItemLabel.append(elItemTitile);
    elItemLabel.append(elItemSpan);
  });

}

/* Отправка форм */
blockCreateform.addEventListener('submit', sendNewBlock);

