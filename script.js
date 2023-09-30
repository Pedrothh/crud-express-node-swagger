document.addEventListener("DOMContentLoaded", () => {
    const alunoForm = document.getElementById("aluno-form");
    const alunosContainer = document.getElementById("alunos-container");
    const nomeInput = document.getElementById("nome");
    const nota1Input = document.getElementById("nota1");
    const nota2Input = document.getElementById("nota2");

    // Função para carregar e exibir alunos
    async function carregarAlunos() {
        try {
            const response = await fetch("http://localhost:3000/alunos");
            const alunos = await response.json();
            alunosContainer.innerHTML = ""; // Limpa o conteúdo antes de adicionar novos alunos

            alunos.forEach(aluno => {
                exibirAluno(aluno);
            });
        } catch (error) {
            console.error("Erro ao carregar alunos:", error);
        }
    }

    // Função para preencher o formulário para edição
    function preencherFormularioParaEdicao(aluno) {
        nomeInput.value = aluno.nome;
        nota1Input.value = aluno.nota1;
        nota2Input.value = aluno.nota2;
        alunoForm.dataset.id = aluno.id;
    }

    // Função para enviar dados do formulário para a API para cadastro ou atualização
    async function salvarAluno(event) {
        event.preventDefault();
        const nome = nomeInput.value;
        const nota1 = parseFloat(nota1Input.value);
        const nota2 = parseFloat(nota2Input.value);
        const alunoId = alunoForm.dataset.id;

        if (nome && !isNaN(nota1) && !isNaN(nota2)) {
            try {
                let response;
                if (alunoId) {
                    // Se alunoId existir, é uma atualização
                    response = await fetch(`http://localhost:3000/alunos/${alunoId}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ nome, nota1, nota2 })
                    });
                } else {
                    // Se não, é um novo cadastro
                    response = await fetch("http://localhost:3000/alunos", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ nome, nota1, nota2 })
                    });
                }

                if (response.ok) {
                    // Limpa o formulário, recarrega a lista de alunos e fecha o modal de edição
                    alunoForm.reset();
                    delete alunoForm.dataset.id;
                    carregarAlunos();
                    $("#editarModal").modal("hide"); // Fecha o modal
                } else {
                    console.error("Erro ao salvar aluno:", response.statusText);
                }
            } catch (error) {
                console.error("Erro ao salvar aluno:", error);
            }
        } else {
            console.error("Por favor, preencha todos os campos corretamente.");
        }
    }

    // Adiciona um evento de envio para o formulário de aluno
    alunoForm.addEventListener("submit", salvarAluno);

    // Função para excluir um aluno
    async function excluirAluno(id) {
        try {
            const response = await fetch(`http://localhost:3000/alunos/${id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                carregarAlunos();
            } else {
                console.error("Erro ao excluir aluno:", response.statusText);
            }
        } catch (error) {
            console.error("Erro ao excluir aluno:", error);
        }
    }

    // Função para adicionar botões de edição e exclusão para cada aluno
    function adicionarBotoesEdicaoExclusao(alunoDiv, aluno) {
        const editarBtn = document.createElement("button");
        editarBtn.classList.add("btn", "btn-primary", "mr-2");
        editarBtn.textContent = "Editar";
        editarBtn.addEventListener("click", () => preencherFormularioParaEdicao(aluno));

        const excluirBtn = document.createElement("button");
        excluirBtn.classList.add("btn", "btn-danger");
        excluirBtn.textContent = "Excluir";
        excluirBtn.addEventListener("click", () => excluirAluno(aluno.id));

        alunoDiv.appendChild(editarBtn);
        alunoDiv.appendChild(excluirBtn);
    }

    // Função para criar e exibir alunos na lista
    function exibirAluno(aluno) {
        let situacao;
        let media = (aluno.nota1 + aluno.nota2) / 2;
        if (media >= 7) {
            situacao = "aprovado";
        } else if (media >= 4) {
            situacao = "recuperacao";
        } else {
            situacao = "reprovado";
        }
        const alunoDiv = document.createElement("div");
        alunoDiv.classList.add("aluno", "mb-3");
        alunoDiv.innerHTML = `<strong>${aluno.nome}</strong><br>
                            Nota 1: ${aluno.nota1}<br>
                            Nota 2: ${aluno.nota2}<br>
                            Média: ${(aluno.nota1 + aluno.nota2) / 2}<br>
                            Situação: ${situacao}`;

        adicionarBotoesEdicaoExclusao(alunoDiv, aluno);
        alunosContainer.appendChild(alunoDiv);
    }

    // Carrega alunos ao carregar a página
    carregarAlunos();
});
