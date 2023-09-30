const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const Sequelize = require('sequelize');

const app = express();
app.use(bodyParser.json());

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});

const Aluno = sequelize.define('Aluno', {
    nome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    nota1: {
        type: Sequelize.FLOAT,
        validate: {
            min: 0,
            max: 10
        }
    },
    nota2: {
        type: Sequelize.FLOAT,
        validate: {
            min: 0,
            max: 10
        }
    }
});

sequelize.sync().then(() => {
    console.log('Banco de dados sincronizado');
});

app.post('/alunos', async (req, res) => {
    try {
        const { nome, nota1, nota2 } = req.body;
        if (nota1 < 0 || nota1 > 10 || nota2 < 0 || nota2 > 10) {
            throw new Error('As notas devem estar entre 0 e 10.');
        }
        const aluno = await Aluno.create({ nome, nota1, nota2 });
        res.status(201).json(aluno);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/alunos', async (req, res) => {
    try {
        const alunos = await Aluno.findAll();
        res.json(alunos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/alunos/:id', async (req, res) => {
    try {
        const aluno = await Aluno.findByPk(req.params.id);
        if (aluno) {
            res.json(aluno);
        } else {
            res.status(404).send('Aluno não encontrado');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/alunos/:id', async (req, res) => {
    try {
        const { nome, nota1, nota2 } = req.body;
        if (nota1 < 0 || nota1 > 10 || nota2 < 0 || nota2 > 10) {
            throw new Error('As notas devem estar entre 0 e 10.');
        }
        const aluno = await Aluno.findByPk(req.params.id);
        if (aluno) {
            aluno.nome = nome;
            aluno.nota1 = nota1;
            aluno.nota2 = nota2;
            await aluno.save();
            res.json(aluno);
        } else {
            res.status(404).send('Aluno não encontrado');
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/alunos/:id', async (req, res) => {
    try {
        const aluno = await Aluno.findByPk(req.params.id);
        if (aluno) {
            await aluno.destroy();
            res.status(204).send();
        } else {
            res.status(404).send('Aluno não encontrado');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota Swagger
const swaggerDocument = require('./swagger.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Inicie o servidor na porta 3000
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
