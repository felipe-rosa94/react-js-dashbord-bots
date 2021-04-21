const request = async (url, conexao) => {
    return await fetch(url, conexao).then((data) => data.json()).catch((error) => (error))
}

const cleanAccents = text => {
    text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    text = text.toLowerCase()
    text = text.trim()
    return text
}

export {request, cleanAccents}
