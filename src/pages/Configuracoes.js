import React from 'react'
import '../styles/configuracoes.css'
import {FormControlLabel, FormLabel, Switch} from '@material-ui/core'
import MenuInferior from '../components/MenuInferior'
import WhatsApp from '../components/WhatsApp'
import Site from '../components/Site'

import {
    createMuiTheme,
    MuiThemeProvider
} from '@material-ui/core/styles'

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#212121'
        }
    },
})

class Configuracoes extends React.Component {

    state = {
        site: true
    }

    onClickAlterar = e => this.setState({site: e.target.checked})

    render() {
        const {site} = this.state
        return (
            <MuiThemeProvider theme={theme}>
                <div id="configuracoes">
                    <div id="div-definicao">
                        <div id="div-site-whatsapp">
                            <FormLabel>Alterar entre configurções de Site é WhatsApp</FormLabel>
                            <FormControlLabel label={site ? 'Site' : 'WhatsApp'} control={
                                <Switch color="primary" checked={site} onChange={(e) => this.onClickAlterar(e)}/>}
                            />
                        </div>
                    </div>
                    {site ? <Site/> : <WhatsApp/>}
                    <MenuInferior pagina="configuracoes"/>
                </div>
            </MuiThemeProvider>
        )
    }
}

export default Configuracoes
