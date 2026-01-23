const addNewBlock        = document.getElementById('add-new-block-btn');
const blockCreateform    = document.getElementById('modal_block-add');
const elTaskListContainer = blockCreateform.querySelector('.modal-block_task-list');
let changedBlockName     = '';
let modalListData         = null;
let choosedTasks          = [];

const createBlockTaskListEl = (data) => {
    const elLi = document.createElement('li');
    elLi.id = data.id;
    elLi.innerHTML = `<h4>${data.act_name}</h4>
                      <p>${data.act_duration} | <span style="color: green;">${data.act_point}</span></p>
                      <button class="icon-btn bad-btn">x</button>`;

    elTaskListContainer.append(elLi);
}

const openNewBlockModal = (changedBlock = '') => {
  blockCreateform.classList.remove('hidden');  
  
  if (typeof changedBlock !== 'string' || !changedBlock) return;
  console.log(blocksData);

  choosedTasks = structuredClone(blocksData.find(el => el[0].act_block == changedBlock));
  
  const elBlockName = document.getElementById('new-block-name');
  elBlockName.value = choosedTasks[0].act_block;

  const elBlockColor = document.getElementById('block-color');
  elBlockColor.value = choosedTasks[0].block_color;

  const elBlockOption = document.getElementById('new-block-option');
  elBlockOption.value = choosedTasks[0].block_option;
  
  for (let i = elTaskListContainer.children.length - 1; i >= 0; i--) {
    elTaskListContainer.children[i].remove();
  }

  choosedTasks.forEach(el => {
    createBlockTaskListEl(el);
  });

  changedBlockName = changedBlock;
}

addNewBlock.addEventListener('click', openNewBlockModal);

blockCreateform.addEventListener('click', (e) => {
  if (!e.target.closest('form')) {
    blockCreateform.classList.add('hidden');
    blockCreateform.children[1].classList.add('hidden');
    blockCreateform.children[0].classList.remove('hidden');

    blockCreateform.children[0].reset();
    blockCreateform.children[1].reset();

    choosedTasks = [];
    for (let i = elTaskListContainer.children.length - 1; i >= 0; i--) {
      elTaskListContainer.children[i].remove();
    }
  }

  if (!e.target.closest('button')) return;

  e.preventDefault();  

  const currBtn = e.target.closest('button');

  switch (currBtn.id) {
    case 'block-task-add':
      showTaskList();
      break;
    case 'task-lict-add':
      saveTaskList();
      break;
    case 'modal-block_add-btn':
      sendNewBlock();
      break;
    default:
      break;
  }

  if (currBtn.className.includes('bad-btn')) {
    const deletedId = currBtn.closest('li').id;
    choosedTasks.forEach(el => {
      if (el.id == deletedId) {        
        el.act_block = null;
      }
    });

    const deletedEl = document.getElementById(deletedId);
    deletedEl.remove();
  }
});

const sendNewBlock = async(e) => {
  const addBtn = blockCreateform.querySelector('.modal-block_add-btn'); 

  try {
    addBtn.disabled = true;
    addBtn.textContent = 'Сохранение...';
    
    const res = await saveTask(choosedTasks);

    addBtn.textContent = res.msg || 'Сохранено';
    
    setTimeout(() => {
      blockCreateform.classList.add('hidden');
      blockCreateform.children[0].reset();
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
  const modalForm    = document.querySelector('.modal-content');
  const elList      = blockCreateform.querySelector('.modal-task_list');
  const elContainer = blockCreateform.querySelector('.modal-task_list-content');
  
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

const saveTaskList = () => {
  blockCreateform.children[1].classList.add('hidden');
  blockCreateform.children[0].classList.remove('hidden');
  
  const elBlockName = document.getElementById('new-block-name').value;
  const checkboxData  = blockCreateform.children[1].querySelectorAll('input');
  const filteredCheckData = [...checkboxData].filter(el => el.checked);
  const filteredTasks = modalListData.filter(e => filteredCheckData.find(el => el.id == e.id));  
 
  filteredTasks.forEach(el => { el.act_block = elBlockName; });

  filteredTasks.forEach(el => {
    createBlockTaskListEl(el);
  });
  
  choosedTasks = choosedTasks.concat(filteredTasks);
}

