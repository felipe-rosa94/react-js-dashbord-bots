import React from 'react'
import {AppBar, Tabs, Tab} from '@material-ui/core'
import MenuInferior from '../components/MenuInferior'
import Produtos from './Produtos'
import Adicionais from './Adicionais'

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

class HomeProdutosAdicionas extends React.Component {

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
                <div>
                    <AppBar position="sticky">
                        <Tabs indicatorColor="primary"
                              variant="fullWidth"
                              value={tabIndex}
                              onChange={this.handleTabs}
                              aria-label="simple tabs example">
                            <Tab label="Produtos"/>
                            <Tab label="Adicionais"/>
                        </Tabs>
                    </AppBar>
                    {(() => {
                        if (tabIndex === 0) {
                            return (<Produtos/>)
                        } else if (tabIndex === 1) {
                            return (<Adicionais/>)
                        }
                    })()}
                    <MenuInferior pagina="produtos"/>
                </div>
            </MuiThemeProvider>
        )
    }
}

export default HomeProdutosAdicionas