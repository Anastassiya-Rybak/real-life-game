const addNewTask        = document.getElementById('add-new-task-btn');
const taskCreateform    = document.getElementById('modal_task-add');
const elAddDailyTask    = document.getElementById('add-daily-task');
const taskAddform       = document.getElementById('modal_task-daily');
const elArrDailyForm    = taskAddform.querySelectorAll('.modal-content_container');

let modalListData = null;

const openNewTaskModal = () => {
  taskCreateform.classList.remove('hidden');
}

// открытие форм
addNewTask.addEventListener('click', openNewTaskModal);
elAddDailyTask.addEventListener('click', () => { taskAddform.classList.remove('hidden'); });
// 

const closeDailyTaskModal = () => {
  taskAddform.classList.add('hidden');

  elArrDailyForm.forEach((el, idx) => {
    if (idx) { el.classList.add('hidden') }
    else { el.classList.remove('hidden') } 
  });
}

// закрытие модалок
taskCreateform.addEventListener('click', (e) => {
  if (!e.target.closest('.modal-content')) {
    taskCreateform.classList.add('hidden');
  }
});
// 

/* Отправка форм */
taskCreateform.addEventListener('submit', sendNewTask);

async function sendNewTask(e) {
  e.preventDefault();

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

    if (res.addCurrTask) {
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

const addTaskToDay = async () => {
  const checkboxData  = taskAddform.querySelectorAll('input');
  const addBtn        = taskAddform.querySelector('.modal-daily_save-btn');
    
  const filteredCheckData = [...checkboxData].filter(el => el.checked);
  const choosedTasks      = modalListData.filter(e => filteredCheckData.find(el => el.id == e.id));  

  if (!choosedTasks.length) return;

  try {
    addBtn.disabled = true;
    addBtn.textContent = 'Сохранение...';

    const res = await sendTask(choosedTasks);

    addBtn.textContent = res.msg || 'Сохранено';

    const elTasksCheck = document.getElementById('tasks-check');

    const [label, countStr] = elTasksCheck.textContent.split(' / ');
    const count = Number(countStr) + choosedTasks.length;

    elTasksCheck.textContent = `${label} / ${count}`;

    setTimeout(() => {
      taskAddform.classList.add('hidden');
      taskAddform.children[0].reset();
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
  const elList      = taskAddform.querySelector('.modal-daily_list');
  const elContainer = taskAddform.querySelector('.modal-daily_list-content');
  
  elList.classList.remove('hidden');

  if (modalListData) return;

  modalListData = await getUnspecList();

  console.log(modalListData);
  

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

const chooseDailyTask = async (e) => {
  if (!e.target.closest('.modal-content')) {
    closeDailyTaskModal();
    return;
  }

  const currBtn = e.target.closest('button');

  if (!currBtn) return;

  e.preventDefault();

  const elIntro   = taskAddform.querySelector('.modal-daily_intro');
  const elBlocks  = taskAddform.querySelector('.modal-daily_block');

  switch (currBtn.id) {
    case 'intro_list':
      elIntro.classList.add('hidden');
      showTaskList();
      break;
    case 'intro_block':
      
      break;
    case 'intro_new':
      closeDailyTaskModal();
      openNewTaskModal();
      break;
    default:
      addTaskToDay();
      break;
  }
}

taskAddform.addEventListener('click', chooseDailyTask);


