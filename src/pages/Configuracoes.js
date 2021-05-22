import React from 'react'
import '../styles/configuracoes.css'
import {AppBar, FormControlLabel, FormLabel, Switch, Tab, Tabs} from '@material-ui/core'
import MenuInferior from '../components/MenuInferior'
import WhatsApp from '../components/WhatsApp'
import Site from '../components/Site'

import {
    createMuiTheme,
    MuiThemeProvider
} from '@material-ui/core/styles'
import Produtos from "./Produtos";
import Adicionais from "./Adicionais";

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#212121'
        }
    },
})

class Configuracoes extends React.Component {

    state = {
        tabIndex: 0
    }

    handleTabs = (event, newValue) => {
        this.setState({tabIndex: newValue})
    }

    render() {
        const {tabIndex} = this.state
        return (
            <MuiThemeProvider theme={theme}>
                <div id="configuracoes">
                    <AppBar position="sticky">
                        <Tabs indicatorColor="primary"
                              variant="fullWidth"
                              value={tabIndex}
                              onChange={this.handleTabs}
                              aria-label="simple tabs example">
                            <Tab label="Site"/>
                            <Tab label="WhatsApp"/>
                        </Tabs>
                    </AppBar>
                    {(() => {
                        if (tabIndex === 0) {
                            return (<Site/>)
                        } else if (tabIndex === 1) {
                            return (<WhatsApp/>)
                        }
                    })()}
                    <MenuInferior pagina="configuracoes"/>
                </div>
            </MuiThemeProvider>
        )
    }
}

export default Configuracoes
