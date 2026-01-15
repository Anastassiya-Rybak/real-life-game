const addNewTask        = document.getElementById('add-new-task-btn');
const taskCreateform    = document.getElementById('modal_task-add');

// TODO: При создании нового задания и заполненном modalListData - добавлять его и туда
const openNewTaskModal = () => {
  taskCreateform.classList.remove('hidden');
}

// открытие форм
addNewTask.addEventListener('click', openNewTaskModal);
// 

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


