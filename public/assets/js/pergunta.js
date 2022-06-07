let contadorOpcao = 0;

function excluirOpcao(id) {
  document.getElementById(id).remove();
}

function addOpcao(opcao) {
  contadorOpcao++;
  const tr = document.createElement("tr");
  const tdInput = document.createElement("td");
  const tdButton = document.createElement("td");
  const input = document.createElement("input");
  const inputIdOpcao = document.createElement("input");
  const button = document.createElement("button");

  if (opcao) {
    console.log('entrou na opcao')
    inputIdOpcao.type = "number";
    inputIdOpcao.name = "idsOpcoes";
    inputIdOpcao.value = opcao.idOpcao;
    inputIdOpcao.hidden = true;
    tr.appendChild(inputIdOpcao)
    console.log(document.getElementsByName('idsOpcoes'))
  }

  // input
  tr.classList =
    "border dark:bg-gray-800 dark:border-gray-700 odd:bg-white even:bg-gray-50 odd:dark:bg-gray-800 even:dark:bg-gray-700";
  tr.id = `opcao${contadorOpcao}`;
  tdInput.classList = "border px-6 py-4";
  input.classList =
    "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline";
  input.type = "text";
  input.id = `opcao${contadorOpcao}`;
  input.name = "opcoes";
  input.placeholder = "Digite a descrição da opção...";
  input.value = opcao ? opcao.descricao : "";

  tdInput.appendChild(input);
  tr.appendChild(tdInput);

  // button
  tdButton.classList = "border px-6 py-4 text-center";
  button.type = "button";
  button.classList = "text-red-600 font-bold hover:underline";
  button.addEventListener("click", () => {
    excluirOpcao(tr.id);
  });
  button.textContent = "Excluir";

  tdButton.appendChild(button);
  tr.appendChild(tdButton);
  document.getElementById("tblOpcoes").appendChild(tr);
}
