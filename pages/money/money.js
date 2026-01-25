const finGoalFlowBtns = document.getElementById('fin-goal-flow');
const wfinGoalFlowForm = document.getElementById('fin-goal-flow-modal');

let currFinGoalFlow = null;

const toggleFinGoalAddForm = () => {
    wfinGoalFlowForm.classList.toggle('hidden');
}

const saveFinGoalFlow = (e) => {
    e.preventDefault();
    
    const newFlowValue = document.getElementById('new-fin-goal-flow-value').value;
    sendFinGoalFlowData(newFlowValue, currFinGoalFlow);      
    
    const finSaveValue = document.getElementById('saved-summ');
    
    finSaveValue.textContent = +finSaveValue.textContent + (currFinGoalFlow ? +newFlowValue : -newFlowValue);
   
    toggleFinGoalAddForm();

    currFinGoalFlow = null;
}

wfinGoalFlowForm.addEventListener('click', (e)=>{ 
    if(!e.target.closest('.modal-content')) toggleFinGoalAddForm(e);
    if(e.target.closest('button')) saveFinGoalFlow(e); 
})

finGoalFlowBtns.addEventListener('click', (e)=>{
    if (!e.target.closest('button')) return;

    toggleFinGoalAddForm();

    currFinGoalFlow = e.target.closest('button').classList.contains('add-btn');
})