import React from 'react'
import '../styles/categoria.css'
import {Card, CardContent, FormControlLabel, FormLabel, Switch} from '@material-ui/core'
import {Delete} from '@material-ui/icons'

class Categoria extends React.Component {

    onClickAtivo = (e, id) => this.props.handleChange({acao: 'alterar', dados: {ativo: e.target.checked, id: id}})

    onClickDeletar = objeto => this.props.handleChange({acao: 'deletar', dados: objeto})

    render() {
        const {_id, categoria, ativo} = this.props.data
        return (
            <Card id="card-categoria">
                <CardContent id="card-content-categoria">
                    <FormLabel id="label-categoria">{categoria}</FormLabel>
                    <div id="div-acoes-categoria">
                        <FormControlLabel
                            control={<Switch checked={ativo}
                                             onChange={(e) => this.onClickAtivo(e, _id)}/>}
                            label={ativo ? 'Categoria ativada' : 'Categoria desativada'}
                        />
                        <Delete id="icone" onClick={() => this.onClickDeletar({id: _id, categoria: categoria})}/>
                    </div>
                </CardContent>
            </Card>
        )
    }
}

export default Categoria
