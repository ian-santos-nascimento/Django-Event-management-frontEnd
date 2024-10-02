function getCookie(name) {
    // Verifica se o cookie está disponível
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Verifica se o cookie começa com o nome que estamos procurando
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }

    if (cookieValue === null) {
        cookieValue = localStorage.getItem(name);
    }

    if (cookieValue === null) {
        cookieValue = sessionStorage.getItem(name);
    }

    return cookieValue;
}

const sessionId = getCookie('sessionid');
export default sessionId;