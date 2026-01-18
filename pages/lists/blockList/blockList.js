const elContentList = document.querySelector('.dashboard_content');

const toggleInner = (e) => {
    const parentEl = e.target.closest('.dashboard_title-inner');

    if (!parentEl) return;

    parentEl.nextElementSibling.classList.toggle('fit-content');
}

elContentList.addEventListener('click', toggleInner)