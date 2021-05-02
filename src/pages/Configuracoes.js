import React from 'react'
import '../styles/configuracoes.css'
import MenuInferior from '../components/MenuInferior'
import WhatsApp from '../components/WhatsApp'

class Configuracoes extends React.Component {

    render() {

        return (
            <div>
                <WhatsApp/>
                <MenuInferior pagina="configuracoes"/>
            </div>
        )
    }
}

export default Configuracoes
