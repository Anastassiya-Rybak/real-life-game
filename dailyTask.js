const elAddDailyTask    = document.getElementById('add-daily-task');
const taskAddform       = document.getElementById('modal_task-daily');
const elArrDailyForm    = taskAddform.querySelectorAll('.modal-content_container');

let modalListData   = null;
let modalBlocksData = null;
let checkedBlock    = null;

const closeDailyTaskModal = () => {
  taskAddform.classList.add('hidden');

  elArrDailyForm.forEach((el, idx) => {
    if (idx) { el.classList.add('hidden') }
    else { el.classList.remove('hidden') } 
  });
}

const addTaskToDay = async () => {
  let choosedTasks = null;

  if (!modalListData) { modalListData = await getUnspecList(); }
  console.log(modalBlocksData);
  
  if (checkedBlock) {
    choosedTasks = modalListData.filter(e => modalBlocksData.find(el => el.daily_acts.act_name == e.act_name )); 
    checkedBlock = '';
  } else {
    const checkboxData  = taskAddform.querySelectorAll('input');
    const filteredCheckData = [...checkboxData].filter(el => el.checked);
    choosedTasks = modalListData.filter(e => filteredCheckData.find(el => el.id == e.id));  
  }

  const addBtn = taskAddform.querySelector('.modal-daily_save-btn');
    
  if (!choosedTasks.length) return;

  try {
    addBtn.disabled = true;
    addBtn.textContent = 'Сохранение...';

    const res = await sendTask(choosedTasks);

    addBtn.textContent = res.msg || 'Сохранено';

    const elTasksCheck = document.getElementById('tasks-check');

    if (elTasksCheck) {
      const [label, countStr] = elTasksCheck.textContent.split(' / ');
      const count = Number(countStr) + choosedTasks.length;

      elTasksCheck.textContent = `${label} / ${count}`;
    } else {
      window.location.assign(location.href);
    }

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

const showBlockList = async() => {
  const elBlocks    = taskAddform.querySelector('.modal-daily_block');
  const elContainer = taskAddform.querySelector('.modal-daily_block-content');
  
  elBlocks.classList.remove('hidden');
  
  if (!modalBlocksData) { 
    let blockOfListData = await getBlockList();
    
    modalBlocksData = Object.values(
      blockOfListData.reduce((acc, item) => {
        const key = `${item.block_name}`;

        if (!acc[key]) {
          acc[key] = {
            block_name: item.block_name,
            block_color: item.block_color,
            daily_acts: item.daily_acts,
            total_points: 0,
            total_duration: 0
          };
        }

        acc[key].total_points += Number(item.daily_acts.act_point) || 0;
        acc[key].total_duration += Number(item.daily_acts.act_duration) || 0;
        return acc;
      }, {})
    );    
  }

  modalBlocksData.forEach(el => {
    const elItemButton = document.createElement('button');
    elItemButton.style.backgroundColor = el.block_color;
    elItemButton.className             = 'modal-daily_block-item';
    elItemButton.id                    = el.block_name;
    
    elContainer.append(elItemButton);

    elItemButton.innerHTML = `<span>${el.block_name}</span>
          <div class="madal-daily_block-dop">
            <span>${el.total_duration} мин</span><hr><span>${el.total_points}</span>
          </div>`;
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

  if (currBtn.className == 'modal-daily_block-item') { 
    checkedBlock = currBtn.children[0].textContent;
    return;
  }
  
  const elIntro = taskAddform.querySelector('.modal-daily_intro');

  switch (currBtn.id) {
    case 'intro_list':
      elIntro.classList.add('hidden');
      showTaskList();
      break;
    case 'intro_block':
      elIntro.classList.add('hidden');
      showBlockList();
      break;
    case 'intro_new':
      closeDailyTaskModal();
      openNewTaskModal();
      break;
    default:
      addTaskToDay(currBtn.className);
      break;
  }
}

elAddDailyTask.addEventListener('click', () => { taskAddform.classList.remove('hidden'); });
taskAddform.addEventListener('click', chooseDailyTask);
