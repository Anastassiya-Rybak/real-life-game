const addNewTask        = document.getElementById('add-new-task-btn');
const taskCreateform    = document.getElementById('modal_task-add');

// TODO: При создании нового задания и заполненном modalListData - добавлять его и туда
const openNewTaskModal = (changedTask = '') => {
  taskCreateform.classList.remove('hidden');  
  
  if (typeof changedTask !== 'string' || !changedTask) return;

  const dataToFill = listData.find(el => el.id == changedTask);
  
  let formElArr = taskCreateform.children[0].children;

  formElArr[1].value = dataToFill.act_name;
  formElArr[2].value = dataToFill.act_option;

  formElArr[3].children[0].value = dataToFill.act_point;
  formElArr[3].children[1].value = dataToFill.act_duration;
  formElArr[3].children[2].value = dataToFill.act_timer;
 
  formElArr[4].children[0].value = dataToFill.act_date;
  formElArr[4].children[1].value = dataToFill.act_time;
}

addNewTask.addEventListener('click', openNewTaskModal);

taskCreateform.addEventListener('click', (e) => {
  if (!e.target.closest('.modal-content')) {
    taskCreateform.classList.add('hidden');
    taskCreateform.children[0].reset();
  }
});

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
    
    if (listData) {
      if(taskData.id){
        const idx = listData.findIndex(el => el.id == taskData.id);
        listData.splice(idx, 1);
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


