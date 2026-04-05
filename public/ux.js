// Mostrar fecha/hora actual solo si el elemento existe
(() => {
    const output = document.querySelector('#actualTime');
    if (!output) return;

    const now = new Date();
    const date = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    if (!output.textContent || output.textContent.includes('--')) {
        output.innerText = `${date}/${month}/${year}`;
    }
})();
