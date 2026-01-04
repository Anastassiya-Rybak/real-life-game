
const fillDetails = async () => {
    const currData = await getMainPageData();

    console.log(currData);
    
}

const initContent = () => {
    initSupabase();
    fillDetails();
}

window.addEventListener("DOMContentLoaded", initContent);