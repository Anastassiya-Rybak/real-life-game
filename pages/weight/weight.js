const weightAddBtn = document.getElementById('weight-add');
const weightAddForm = document.getElementById('weight-add-modal');

const toggleWeightAddForm = () => {
    weightAddForm.classList.toggle('hidden');
}

const saveWeight = () => {
    sendWeightData(document.getElementById('new-weight-value').value);        
}

weightAddForm.addEventListener('click', (e)=>{ 
    if(!e.target.closest('.modal-content')) toggleWeightAddForm();
    if(e.target.closest('button')) saveWeight(); 
})

weightAddBtn.addEventListener('click', toggleWeightAddForm)