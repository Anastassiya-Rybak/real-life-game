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
    elItemContainer.id          = blockData[0].act_block;

    elContentList.append(elItemContainer);

    let blockPointSum       = 0;
    let blockDurationSum    = 0;

    const elItemDetailes = document.createElement('div');
    elItemDetailes.className = 'dashboard_detailes-inner';

    elItemContainer.append(elItemDetailes);

    const elUl = document.createElement('ul');
    elItemDetailes.append(elUl);

    blockData.forEach(elem => {
        const elLi = document.createElement('li');
        elUl.append(elLi);

        const elH = document.createElement('h5');
        elH.textContent = elem.act_name;

        const elP = document.createElement('p');
        elP.innerHTML = `${elem.act_duration} | <span style="color: green;">${elem.act_point}</span>`;

        elLi.append(elH);
        elLi.append(elP);

        blockPointSum += elem.act_point;
        blockDurationSum += elem.act_duration;
    });

    const elBtn = document.createElement('button');
    elBtn.className = 'ghost-btn light-btn';
    elBtn.textContent = 'РЕДАКТИРОВАТЬ';
    elItemDetailes.append(elBtn);


    const elItemTitle = document.createElement('div');
    elItemTitle.className = 'dashboard_title-inner';
    elItemTitle.style = `background-color:${blockData[0].block_color};`;
    elItemTitle.innerHTML = `<h3>${blockData[0].act_block}</h3>
                            <p><span style="color: green;">${blockPointSum}</span> | ${blockDurationSum} мин</p>`;
    
    elItemContainer.prepend(elItemTitle);
}

const fillContent = async() => {
    const blocksUnsortData = await getUnspecList('act_point', 'act_block');

    blocksUnsortData.sort((a, b) => a.act_block.localeCompare(b.act_block));

    blocksData      = [];
    let interVar    = { num: -1, name: '' };

    blocksUnsortData.forEach(el => {
        if (interVar.name !== el.act_block){
            interVar.name = el.act_block;
            blocksData.push([]);
            interVar.num += 1;
        }    
        blocksData[interVar.num].push(el);
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