const weightAddBtn = document.getElementById('weight-add');
const weightAddForm = document.getElementById('weight-add-modal');

const toggleWeightAddForm = () => {
    weightAddForm.classList.toggle('hidden');
}

const saveWeight = (e) => {    
    e.preventDefault();
    
    sendWeightData(document.getElementById('new-weight-value').value);
    
    toggleWeightAddForm();
}

weightAddForm.addEventListener('click', (e)=>{ 
    if(!e.target.closest('.modal-content')) toggleWeightAddForm();
    if(e.target.closest('button')) saveWeight(e); 
})

weightAddBtn.addEventListener('click', toggleWeightAddForm)