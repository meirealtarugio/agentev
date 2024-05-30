document.getElementById('formCliente')
  .addEventListener('submit', function (event) {
    event.preventDefault() //evita recarregar
    //efetuando validações
    
    //criando o objeto cliente
    //campo setor
    let setorSelecionado = ''
    if (document.getElementById('setor-0').checked) {
      setorSelecionado = 'Geral'
    } else { setorSelecionado = 'Portátil' }

    const dadosCliente = {
      nomeVendedor: document.getElementById('nomeVendedor').value,
      nascimento: document.getElementById('dataDaVisita').value,
      filial: document.getElementById('filial').value,
      notaA: document.getElementById('notaA').value,
      notaP: document.getElementById('notaP').value,
      notaO: document.getElementById('notaO').value,
      notaN: document.getElementById('notaN').value,
      notaT: document.getElementById('notaT').value,
      notaE: document.getElementById('notaE').value,
      setor: setorSelecionado
    }
    //testando...
    //alert(JSON.stringify(dadosCliente))

    if (document.getElementById('id').value !== '') { //Se existir algo, iremos alterar,
      alterar(event, 'clientes', dadosCliente, document.getElementById('id').value)
    } else {
      incluir(event, 'clientes', dadosCliente)
    }
  })

async function incluir(event, collection, dados) {
  event.preventDefault()
  return await firebase.database().ref(collection).push(dados)
    .then(() => {
      alerta('✅Vendedor incluído com sucesso!', 'success')
      document.getElementById('formCliente').reset()//limpa
    })
    .catch(error => {
      alerta('❌Falha ao incluir: ' + error.message, 'danger')
    })
}

async function alterar(event, collection, dados, id) {
  event.preventDefault()
  return await firebase.database().ref().child(collection + '/' + id).update(dados)
    .then(() => {
      alerta('✅Vendedor alterado com sucesso!', 'success')
      document.getElementById('formCliente').reset()//limpa
    })
    .catch(error => {
      alerta('❌Falha ao alterar: ' + error.message, 'danger')
    })
}

async function obtemClientes() {
  let spinner = document.getElementById('carregandoDados')
  let tabela = document.getElementById('tabelaDados')

  await firebase.database().ref('clientes').orderByChild('nome').on('value', (snapshot) => {
    tabela.innerHTML = ''
    tabela.innerHTML += `
            <tr class='bg-info'>
              <th>Filial</th>  
              <th>Nome do Vendedor</th>     
              <th title='Aborde positivamente'> A</th>   
              <th title='Pesquise o Cliente'> P</th>
              <th title='Ofereça uma demostração envolvente'> O</th> 
              <th title='Neutralize objeções'> N</th>     
              <th title='Tome a iniciativa e feche a venda'> T</th>
              <th title='Estenda o relacionamento'> E</th>
              <th title='Média'> Média</th>
              <th>Opções</th>
              
            </tr>
    `
    snapshot.forEach(item => {
      //Dados do Firebase
      let db = item.ref._delegate._path.pieces_[0] //nome da collection
      let id = item.ref._delegate._path.pieces_[1] //id do registro
      //Criando as novas linhas da tabela
      let novaLinha = tabela.insertRow() //insere uma nova linha na tabela
      novaLinha.insertCell().textContent = item.val().filial
      novaLinha.insertCell().textContent = item.val().nomeVendedor
      novaLinha.insertCell().textContent = item.val().notaA
      novaLinha.insertCell().textContent = item.val().notaP
      novaLinha.insertCell().textContent = item.val().notaO
      novaLinha.insertCell().textContent = item.val().notaN
      novaLinha.insertCell().textContent = item.val().notaT
      novaLinha.insertCell().textContent = item.val().notaE
      novaLinha.insertCell().textContent = ((parseInt(item.val().notaA)+parseInt(item.val().notaP)+parseInt(item.val().notaO)+parseInt(item.val().notaN)+parseInt(item.val().notaT)+parseInt(item.val().notaE))/6).toFixed(2);
           novaLinha.insertCell().innerHTML = `<button class='btn btn-sm btn-danger' title='Apaga o cliente selecionado' onclick=remover('${db}','${id}')> <i class='bi bi-trash'></i> </button>
                                          <button class='btn btn-sm btn-warning' title='Edita o cliente selecionado' onclick=carregaDadosAlteracao('${db}','${id}')> <i class='bi bi-pencil-square'></i> </button>`
    })
  })
  //ocultamos o botão Carregando...
  spinner.classList.add('d-none')
}

async function remover(db, id) {
  if (window.confirm('⚠ Confirma a exclusão do Vendedor?')) {
    let dadosExclusao = await firebase.database().ref().child(db + '/' + id)
    dadosExclusao.remove()
      .then(() => {
        alerta('✅Vendedor removido com sucesso!', 'success')
      })
      .catch(error => {
        alerta(`❌Falha ao apagar o Vendedor: ${error.message}`)
      })
  }
}

async function carregaDadosAlteracao(db, id) {
  await firebase.database().ref(db + '/' + id).on('value', (snapshot) => {
    document.getElementById('id').value = id
    document.getElementById('filial').value = snapshot.val().filial
    document.getElementById('nomeVendedor').value = snapshot.val().nomeVendedor
    document.getElementById('letraA').value = snapshot.val().letraA
    document.getElementById('letraP').value = snapshot.val().letraP
    document.getElementById('letraO').value = snapshot.val().letraO
    document.getElementById('letraN').value = snapshot.val().letraN
    document.getElementById('letraT').value = snapshot.val().letraT
    document.getElementById('letraE').value = snapshot.val().letraE
    document.getElementById('dataDaVisita').value = snapshot.val().dataDaVisita
    if (snapshot.val().setor === 'Portátil') {
      document.getElementById('setor-1').checked = true
    } else {
      document.getElementById('setor-0').checked = true //Geral
    }
  })
  document.getElementById('nome').focus() //Definimos o foco no campo nome
}

function filtrarTabela(idFiltro, idTabela) {
  // Obtém os elementos HTML
  var input = document.getElementById(idFiltro); // Input de texto para pesquisa
  var filter = input.value.toUpperCase(); // Valor da pesquisa em maiúsculas
  var table = document.getElementById(idTabela); // Tabela a ser filtrada
  var tr = table.getElementsByTagName("tr"); // Linhas da tabela

  // Oculta todas as linhas da tabela inicialmente (exceto o cabeçalho)
  for (var i = 1; i < tr.length; i++) { // Começa em 1 para ignorar o cabeçalho
    tr[i].style.display = "none"; // Oculta a linha
  }

  // Filtra cada linha da tabela
  for (var i = 1; i < tr.length; i++) { // Começa em 1 para ignorar o cabeçalho
    for (var j = 0; j < tr[i].cells.length; j++) { // Percorre as células da linha
      var td = tr[i].cells[j]; // Célula atual
      if (td) { // Verifica se a célula existe
        var txtValue = td.textContent || td.innerText; // Conteúdo da célula
        txtValue = txtValue.toUpperCase(); // Conteúdo da célula em maiúsculas

        // Verifica se o valor da pesquisa está presente no conteúdo da célula
        if (txtValue.indexOf(filter) > -1) {
          tr[i].style.display = ""; // Exibe a linha se houver correspondência
          break; // Sai do loop interno quando encontrar uma correspondência
        }
      }
    }
  }
}