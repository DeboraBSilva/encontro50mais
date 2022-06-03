require('dotenv').config()
const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_DATABASE,
        ssl: {
            rejectUnauthorized: false
        }
    }
});

exports.validar = async (req, res) => {
    req.session.user = ''
    let erro = false
    knex.select(
        'idPessoa', 'email', 'apelido'
    ).from('pessoa')
        .modify(function (queryBuilder) {
            if (req.body.email && req.body.password) {
                queryBuilder
                    .whereRaw(' email = \'' + req.body.email + '\' AND password = \'' + req.body.password + '\'')
            } else {
                erro = true
                console.log('Problemas com o email ou senha')
            }
        })
        .then((usuario) => {
            if (!erro && usuario[0] && usuario[0].email == req.body.email) {
                req.session.user = 'logado'
                req.session.email = req.body.email
                req.session.idPessoa = usuario[0].idPessoa
                req.session.apelido = usuario[0].apelido
                req.session.posicaoPergunta = -1
                res.redirect('/')
            } else {
                res.render('pages/login', {
                    mensagem: 'Verifique se o email e a senha estão corretos!'
                })                
            }
        })
}
