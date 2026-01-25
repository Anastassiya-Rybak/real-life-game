const elContentList = document.querySelector('.dashboard_content');

let blocksData = null;

const toggleInner = (e) => {
    const parentElBtn = e.target.closest('button');
    const parentEl = e.target.closest('.dashboard_title-inner');

    if (!parentEl && !parentElBtn) return;

    if (parentElBtn) {        
        openNewBlockModal(parentElBtn.closest('.dashboard_block').id);    
    } else {
        parentEl.nextElementSibling.classList.toggle('fit-content');
    }
}

const creatBlockEl = (blockData) => {
    const elItemContainer = document.createElement('div');
    elItemContainer.className   = 'dashboard_block';
    elItemContainer.id          = blockData[0].block_name;

    elContentList.append(elItemContainer);

    let blockPointSum       = 0;
    let blockDurationSum    = 0;

    const elItemDetailes = document.createElement('div');
    elItemDetailes.className = 'dashboard_detailes-inner';

    elItemContainer.append(elItemDetailes);

    const elUl = document.createElement('ul');
    elItemDetailes.append(elUl);

    blockData.forEach(elem => {
        const actsData = elem.daily_acts;

        const elLi = document.createElement('li');
        elUl.append(elLi);

        const elH = document.createElement('h5');
        elH.textContent = actsData.act_name;

        const elP = document.createElement('p');
        elP.innerHTML = `${actsData.act_duration} | <span style="color: green;">${actsData.act_point}</span>`;

        elLi.append(elH);
        elLi.append(elP);

        blockPointSum += actsData.act_point;
        blockDurationSum += actsData.act_duration;
    });

    const elBtn = document.createElement('button');
    elBtn.className = 'ghost-btn light-btn';
    elBtn.textContent = 'РЕДАКТИРОВАТЬ';
    elItemDetailes.append(elBtn);


    const elItemTitle = document.createElement('div');
    elItemTitle.className = 'dashboard_title-inner';
    elItemTitle.style = `background-color:${blockData[0].block_color};`;
    elItemTitle.innerHTML = `<h3>${blockData[0].block_name}</h3>
                            <p><span style="color: green;">${blockPointSum}</span> | ${blockDurationSum} мин</p>`;
    
    elItemContainer.prepend(elItemTitle);
}

const fillContent = async() => {
    const blocksUnsortData = await getBlockList();

    blocksData      = [];
    let interVar    = { num: -1, name: '' };

    blocksUnsortData.forEach(el => {
        if (interVar.name !== el.block_name){
            interVar.name = el.block_name;
            blocksData.push([]);
            interVar.num += 1;
        }    
        blocksData[interVar.num].push(el);
        el.delete = false;
        el.new = false;
    });

    for (const block of blocksData) {
        creatBlockEl(block);
    }
}

const initContent = () => {
    initSupabase();
    fillContent();
}

elContentList.addEventListener('click', toggleInner);
window.addEventListener("DOMContentLoaded", initContent);